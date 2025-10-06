import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { excelParser } from "./excelParser";
import { z } from "zod";

const addIngredientStockSchema = z.object({
  ingredientId: z.string(),
  branchId: z.string(),
  quantity: z.number(),
  expiryDate: z.string(),
  batchNumber: z.string().optional(),
  receivedDate: z.string(),
  isFromYesterday: z.boolean(),
});

const hourlyCheckSchema = z.object({
  branchId: z.string(),
  checks: z.array(
    z.object({
      productId: z.string(),
      countedQuantity: z.number(),
      systemQuantity: z.number(),
    })
  ),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-branch", (branchId: string) => {
      socket.join(`branch-${branchId}`);
      console.log(`Socket ${socket.id} joined branch-${branchId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  app.get("/api/branches", async (req: Request, res: Response) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  });

  app.get("/api/ingredients", async (req: Request, res: Response) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.get("/api/ingredients/stock/:branchId", async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      const stock = await storage.getIngredientStock(branchId);

      const today = new Date();
      const stockWithExpiry = stock.map((s) => {
        const expiryDate = new Date(s.expiryDate);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          ...s,
          daysUntilExpiry,
        };
      });

      stockWithExpiry.sort((a, b) => {
        if (a.isFromYesterday !== b.isFromYesterday) {
          return a.isFromYesterday ? -1 : 1;
        }
        return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
      });

      res.json(stockWithExpiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredient stock" });
    }
  });

  app.get("/api/ingredients/expiring/:branchId/:days", async (req: Request, res: Response) => {
    try {
      const { branchId, days } = req.params;
      const stock = await storage.getIngredientStockExpiringSoon(branchId, parseInt(days));

      const today = new Date();
      const alerts = stock.map((s) => {
        const expiryDate = new Date(s.expiryDate);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        let suggestedAction = "ติดตามการใช้งาน";
        if (daysUntilExpiry === 0) {
          suggestedAction = `ใช้ทันที - ผลิต${s.ingredient.name}`;
        } else if (daysUntilExpiry <= 1) {
          suggestedAction = "ใช้ในการผลิตวันนี้";
        } else if (daysUntilExpiry <= 3) {
          suggestedAction = `วางแผนใช้ภายใน ${daysUntilExpiry} วัน`;
        }

        return {
          id: s.id,
          ingredientName: s.ingredient.name,
          quantity: parseFloat(s.quantity),
          unit: s.ingredient.unit,
          expiryDate: s.expiryDate,
          daysUntilExpiry,
          branch: branchId,
          suggestedAction,
        };
      });

      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expiring ingredients" });
    }
  });

  app.post("/api/ingredients/stock", async (req: Request, res: Response) => {
    try {
      const validatedData = addIngredientStockSchema.parse(req.body);
      const stock = await storage.addIngredientStock({
        ...validatedData,
        quantity: validatedData.quantity.toString(),
        batchNumber: validatedData.batchNumber || null,
      });

      io.to(`branch-${validatedData.branchId}`).emit("stock-updated", {
        type: "ingredient-added",
        data: stock,
      });

      res.json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add ingredient stock" });
      }
    }
  });

  app.post("/api/ingredients/stock/batch", async (req: Request, res: Response) => {
    try {
      const { entries, type, branchId } = req.body;

      const stocks = await Promise.all(
        entries.map(async (entry: any) => {
          return await storage.addIngredientStock({
            ingredientId: entry.ingredientId,
            branchId,
            quantity: entry.quantity.toString(),
            expiryDate: entry.expiryDate,
            batchNumber: entry.batchNumber || null,
            receivedDate: new Date().toISOString().split("T")[0],
            isFromYesterday: type === "yesterday",
          });
        })
      );

      io.to(`branch-${branchId}`).emit("stock-updated", {
        type: "batch-added",
        data: stocks,
      });

      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to add ingredient stock batch" });
    }
  });

  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getBakeryProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/stock/:branchId", async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      const stock = await storage.getProductStock(branchId);
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product stock" });
    }
  });

  app.post("/api/hourly-check", async (req: Request, res: Response) => {
    try {
      const validatedData = hourlyCheckSchema.parse(req.body);
      const checkTime = new Date();

      const checks = await Promise.all(
        validatedData.checks.map(async (check) => {
          const variance = check.countedQuantity - check.systemQuantity;

          const hourlyCheck = await storage.addHourlyCheck({
            branchId: validatedData.branchId,
            productId: check.productId,
            checkTime: checkTime.toISOString(),
            countedQuantity: check.countedQuantity,
            systemQuantity: check.systemQuantity,
            variance,
          });

          const productStocks = await storage.getProductStock(validatedData.branchId);
          const productStock = productStocks.find((s) => s.productId === check.productId);

          if (productStock) {
            await storage.updateProductStock(productStock.id, check.countedQuantity);
          }

          return hourlyCheck;
        })
      );

      io.to(`branch-${validatedData.branchId}`).emit("stock-updated", {
        type: "hourly-check-completed",
        data: checks,
      });

      const recommendations = validatedData.checks
        .filter((check) => check.countedQuantity > 10 && check.countedQuantity < 20)
        .map((check) => ({
          productId: check.productId,
          discount: 10,
          reason: "สต๊อกเหลือน้อย - แนะนำให้ส่วนลด 10%",
        }));

      if (recommendations.length > 0) {
        io.to(`branch-${validatedData.branchId}`).emit("promotion-recommendation", {
          recommendations,
        });
      }

      res.json({ checks, recommendations });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to process hourly check" });
      }
    }
  });

  app.get("/api/forecast/:branchId", async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      const today = new Date();
      
      try {
        const demandData = excelParser.parseDemandForecast();
        const branchForecasts = demandData.filter((f) => f.branch === branchId || !f.branch);

        const hours = Array.from({ length: 12 }, (_, i) => i + 8);
        const forecastData = hours.map((hour) => {
          const forecast = branchForecasts.find((f) => f.hour === hour);
          return {
            hour: `${hour.toString().padStart(2, "0")}:00`,
            predicted: forecast?.predictedDemand || Math.floor(Math.random() * 50) + 30,
            actual: hour <= new Date().getHours() ? Math.floor(Math.random() * 50) + 25 : undefined,
          };
        });

        res.json(forecastData);
      } catch (parseError) {
        const hours = Array.from({ length: 12 }, (_, i) => i + 8);
        const mockData = hours.map((hour) => ({
          hour: `${hour.toString().padStart(2, "0")}:00`,
          predicted: Math.floor(Math.random() * 50) + 30,
          actual: hour <= new Date().getHours() ? Math.floor(Math.random() * 50) + 25 : undefined,
        }));
        res.json(mockData);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  app.get("/api/production-plan/:branchId", async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      
      try {
        const productionPlans = excelParser.parseProductionPlans();
        const branchPlans = productionPlans.filter((p) => p.branch === branchId || !p.branch);

        const products = await storage.getBakeryProducts();
        const productStock = await storage.getProductStock(branchId);

        const recommendations = products.map((product) => {
          const plan = branchPlans.find((p) => 
            p.product.toLowerCase().includes(product.name.toLowerCase()) || 
            product.name.toLowerCase().includes(p.product.toLowerCase())
          );
          
          const stock = productStock.find((s) => s.productId === product.id);
          const currentStock = stock?.quantity || 0;
          const forecastDemand = plan?.recommendedQuantity || Math.floor(Math.random() * 30) + 20;
          const suggestedProduction = Math.max(0, forecastDemand - currentStock);

          return {
            id: product.id,
            name: product.name,
            currentStock,
            forecastDemand,
            suggestedProduction,
            ingredientsAvailable: Math.random() > 0.2,
            shelfLifeHours: product.shelfLifeHours,
          };
        });

        res.json(recommendations);
      } catch (parseError) {
        const products = await storage.getBakeryProducts();
        const productStock = await storage.getProductStock(branchId);

        const mockRecommendations = products.map((product) => {
          const stock = productStock.find((s) => s.productId === product.id);
          const currentStock = stock?.quantity || Math.floor(Math.random() * 20);
          const forecastDemand = Math.floor(Math.random() * 30) + 20;
          const suggestedProduction = Math.max(0, forecastDemand - currentStock);

          return {
            id: product.id,
            name: product.name,
            currentStock,
            forecastDemand,
            suggestedProduction,
            ingredientsAvailable: Math.random() > 0.2,
            shelfLifeHours: product.shelfLifeHours,
          };
        });

        res.json(mockRecommendations);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch production plan" });
    }
  });

  app.get("/api/stats/:branchId", async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      
      const ingredientStock = await storage.getIngredientStock(branchId);
      const expiringStock = await storage.getIngredientStockExpiringSoon(branchId, 3);
      const productStock = await storage.getProductStock(branchId);

      const totalIngredients = ingredientStock.length;
      const expiringCount = expiringStock.length;
      const totalProducts = productStock.reduce((sum, s) => sum + s.quantity, 0);

      res.json({
        totalIngredients,
        expiringCount,
        totalProducts,
        salesAmount: Math.floor(Math.random() * 10000) + 35000,
        salesTrend: Math.floor(Math.random() * 20) + 5,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/forecasts/import", async (req: Request, res: Response) => {
    try {
      const { forecastDate, branches } = req.body;

      const importedForecasts = [];
      
      for (const branch of branches) {
        const branchForecast = await storage.addBranchForecast({
          branchId: branch.branchId,
          branchName: branch.branchName,
          forecastDate,
          totalForecast: branch.totalForecast,
          accuracy: branch.accuracy ? branch.accuracy.toString() : null,
        });

        for (const product of branch.products) {
          await storage.addProductForecast({
            branchForecastId: branchForecast.id,
            productId: product.productId || null,
            productCode: product.productCode,
            productName: product.productName,
            forecastQuantity: product.forecastQuantity,
            minQuantity: product.minQuantity,
            maxQuantity: product.maxQuantity,
            accuracy: product.accuracy ? product.accuracy.toString() : null,
            modelType: product.modelType,
          });
        }

        importedForecasts.push(branchForecast);
      }

      io.emit("forecast-updated", { date: forecastDate });

      res.json({
        success: true,
        count: importedForecasts.length,
        forecasts: importedForecasts,
      });
    } catch (error) {
      console.error("Failed to import forecasts:", error);
      res.status(500).json({ error: "Failed to import forecasts" });
    }
  });

  app.get("/api/forecasts/:date", async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const forecasts = await storage.getBranchForecasts(date);

      const forecastsWithProducts = await Promise.all(
        forecasts.map(async (forecast) => {
          const products = await storage.getProductForecasts(forecast.id);
          return { ...forecast, products };
        })
      );

      res.json(forecastsWithProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forecasts" });
    }
  });

  app.get("/api/forecasts/:branchId/:date", async (req: Request, res: Response) => {
    try {
      const { branchId, date } = req.params;
      const forecast = await storage.getBranchForecast(branchId, date);

      if (!forecast) {
        return res.status(404).json({ error: "Forecast not found" });
      }

      res.json(forecast);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  return httpServer;
}
