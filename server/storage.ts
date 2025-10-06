import {
  type User,
  type InsertUser,
  type Branch,
  type Ingredient,
  type IngredientStock,
  type BakeryProduct,
  type ProductStock,
  type HourlyCheck,
  type DemandForecast,
  type BranchForecast,
  type ProductForecast,
  type ProductRecipe,
  type ProductionPlan,
  type PromotionRecommendation,
  type DynamicPricingSchedule,
  type ShelfLifeAlert,
  type DailyActionPlan,
  type BranchWasteAnalysis,
  type IngredientDemandForecast,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: Branch): Promise<Branch>;

  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: string): Promise<Ingredient | undefined>;
  createIngredient(ingredient: Omit<Ingredient, "id">): Promise<Ingredient>;

  getIngredientStock(branchId: string): Promise<(IngredientStock & { ingredient: Ingredient })[]>;
  getIngredientStockExpiringSoon(branchId: string, days: number): Promise<(IngredientStock & { ingredient: Ingredient })[]>;
  addIngredientStock(stock: Omit<IngredientStock, "id">): Promise<IngredientStock>;
  updateIngredientStock(id: string, quantity: number): Promise<IngredientStock | undefined>;
  deleteIngredientStock(id: string): Promise<boolean>;

  getBakeryProducts(): Promise<BakeryProduct[]>;
  getBakeryProduct(id: string): Promise<BakeryProduct | undefined>;
  createBakeryProduct(product: Omit<BakeryProduct, "id">): Promise<BakeryProduct>;

  getProductStock(branchId: string): Promise<(ProductStock & { product: BakeryProduct })[]>;
  addProductStock(stock: Omit<ProductStock, "id">): Promise<ProductStock>;
  updateProductStock(id: string, quantity: number): Promise<ProductStock | undefined>;

  addHourlyCheck(check: Omit<HourlyCheck, "id">): Promise<HourlyCheck>;
  getHourlyChecks(branchId: string, date: Date): Promise<HourlyCheck[]>;

  getDemandForecasts(branchId: string, date: Date): Promise<DemandForecast[]>;
  addDemandForecast(forecast: Omit<DemandForecast, "id">): Promise<DemandForecast>;

  getBranchForecasts(date: string): Promise<BranchForecast[]>;
  getBranchForecast(branchId: string, date: string): Promise<(BranchForecast & { products: ProductForecast[] }) | undefined>;
  addBranchForecast(forecast: Omit<BranchForecast, "id" | "createdAt">): Promise<BranchForecast>;
  addProductForecast(forecast: Omit<ProductForecast, "id">): Promise<ProductForecast>;
  getProductForecasts(branchForecastId: string): Promise<ProductForecast[]>;

  getProductRecipes(sku?: string): Promise<ProductRecipe[]>;
  getProductionPlans(branchId?: string): Promise<ProductionPlan[]>;
  getPromotionRecommendations(branchId?: string): Promise<PromotionRecommendation[]>;
  getDynamicPricingSchedules(branchId?: string): Promise<DynamicPricingSchedule[]>;
  getShelfLifeAlerts(branchId?: string): Promise<ShelfLifeAlert[]>;
  getDailyActionPlans(branchId?: string): Promise<DailyActionPlan[]>;
  getBranchWasteAnalysis(branchId?: string): Promise<BranchWasteAnalysis[]>;
  getIngredientDemandForecasts(): Promise<IngredientDemandForecast[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private branches: Map<string, Branch>;
  private ingredients: Map<string, Ingredient>;
  private ingredientStock: Map<string, IngredientStock>;
  private bakeryProducts: Map<string, BakeryProduct>;
  private productStock: Map<string, ProductStock>;
  private hourlyChecks: Map<string, HourlyCheck>;
  private demandForecasts: Map<string, DemandForecast>;
  private branchForecasts: Map<string, BranchForecast>;
  private productForecasts: Map<string, ProductForecast>;

  constructor() {
    this.users = new Map();
    this.branches = new Map();
    this.ingredients = new Map();
    this.ingredientStock = new Map();
    this.bakeryProducts = new Map();
    this.productStock = new Map();
    this.hourlyChecks = new Map();
    this.demandForecasts = new Map();
    this.branchForecasts = new Map();
    this.productForecasts = new Map();
    this.seedData();
  }

  private seedData() {
    const branches = [
      { id: "3510", name: "ชายหาดกมลา 1", location: null },
      { id: "18469", name: "ราไวย์บีช", location: null },
      { id: "18504", name: "ตลาดนัดสามกอง", location: null },
      { id: "8732", name: "ราชพฤกษ์ (บางพลับ)", location: null },
      { id: "15757", name: "The Bliss South Beach Patong", location: null },
      { id: "9146", name: "หมู่บ้านพนาสนธิ์", location: null },
      { id: "9922", name: "ศรีสุดา", location: null },
    ];
    branches.forEach((b) => this.branches.set(b.id, b));

    const ingredients = [
      { id: randomUUID(), name: "แป้งขนมปัง", unit: "กก.", imageUrl: null },
      { id: randomUUID(), name: "นมสด", unit: "ลิตร", imageUrl: null },
      { id: randomUUID(), name: "เนยสด", unit: "กก.", imageUrl: null },
      { id: randomUUID(), name: "ไข่ไก่", unit: "ฟอง", imageUrl: null },
      { id: randomUUID(), name: "น้ำตาล", unit: "กก.", imageUrl: null },
      { id: randomUUID(), name: "เกลือ", unit: "กรัม", imageUrl: null },
    ];
    ingredients.forEach((i) => this.ingredients.set(i.id, i));

    const products = [
      { id: randomUUID(), name: "ครัวซองต์", imageUrl: null, shelfLifeHours: 8 },
      { id: randomUUID(), name: "เดนิช", imageUrl: null, shelfLifeHours: 12 },
      { id: randomUUID(), name: "บัตเตอร์เค้ก", imageUrl: null, shelfLifeHours: 24 },
      { id: randomUUID(), name: "โดนัท", imageUrl: null, shelfLifeHours: 16 },
      { id: randomUUID(), name: "คุกกี้เนย", imageUrl: null, shelfLifeHours: 72 },
      { id: randomUUID(), name: "มัฟฟิน", imageUrl: null, shelfLifeHours: 12 },
    ];
    products.forEach((p) => this.bakeryProducts.set(p.id, p));

    const firstBranch = branches[0].id;
    const flourId = Array.from(this.ingredients.values()).find((i) => i.name === "แป้งขนมปัง")?.id;
    const milkId = Array.from(this.ingredients.values()).find((i) => i.name === "นมสด")?.id;
    
    if (flourId && milkId) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      this.ingredientStock.set(randomUUID(), {
        id: randomUUID(),
        ingredientId: flourId,
        branchId: firstBranch,
        quantity: "25.5",
        expiryDate: tomorrow.toISOString().split("T")[0],
        batchNumber: "BATCH-001",
        receivedDate: new Date(today.setDate(today.getDate() - 2)).toISOString().split("T")[0],
        isFromYesterday: false,
      });

      this.ingredientStock.set(randomUUID(), {
        id: randomUUID(),
        ingredientId: milkId,
        branchId: firstBranch,
        quantity: "15",
        expiryDate: today.toISOString().split("T")[0],
        batchNumber: "BATCH-002",
        receivedDate: new Date(today.setDate(today.getDate() - 1)).toISOString().split("T")[0],
        isFromYesterday: false,
      });
    }

    const croissantId = Array.from(this.bakeryProducts.values()).find((p) => p.name === "ครัวซองต์")?.id;
    const cookieId = Array.from(this.bakeryProducts.values()).find((p) => p.name === "คุกกี้เนย")?.id;
    const muffinId = Array.from(this.bakeryProducts.values()).find((p) => p.name === "มัฟฟิน")?.id;
    
    if (croissantId && cookieId && muffinId) {
      const now = new Date();
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

      this.productStock.set(randomUUID(), {
        id: randomUUID(),
        productId: croissantId,
        branchId: firstBranch,
        quantity: 8,
        productionTime: fiveHoursAgo,
      });

      this.productStock.set(randomUUID(), {
        id: randomUUID(),
        productId: cookieId,
        branchId: firstBranch,
        quantity: 3,
        productionTime: twoHoursAgo,
      });

      this.productStock.set(randomUUID(), {
        id: randomUUID(),
        productId: muffinId,
        branchId: firstBranch,
        quantity: 4,
        productionTime: fourHoursAgo,
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async createBranch(branch: Branch): Promise<Branch> {
    this.branches.set(branch.id, branch);
    return branch;
  }

  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async createIngredient(ingredient: Omit<Ingredient, "id">): Promise<Ingredient> {
    const id = randomUUID();
    const newIngredient: Ingredient = { ...ingredient, id };
    this.ingredients.set(id, newIngredient);
    return newIngredient;
  }

  async getIngredientStock(branchId: string): Promise<(IngredientStock & { ingredient: Ingredient })[]> {
    const stocks = Array.from(this.ingredientStock.values()).filter((s) => s.branchId === branchId);
    return stocks.map((stock) => ({
      ...stock,
      ingredient: this.ingredients.get(stock.ingredientId)!,
    })).filter((s) => s.ingredient);
  }

  async getIngredientStockExpiringSoon(
    branchId: string,
    days: number
  ): Promise<(IngredientStock & { ingredient: Ingredient })[]> {
    const stocks = await this.getIngredientStock(branchId);
    const today = new Date();
    return stocks.filter((stock) => {
      const expiryDate = new Date(stock.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= days;
    });
  }

  async addIngredientStock(stock: Omit<IngredientStock, "id">): Promise<IngredientStock> {
    const id = randomUUID();
    const newStock: IngredientStock = { ...stock, id };
    this.ingredientStock.set(id, newStock);
    return newStock;
  }

  async updateIngredientStock(id: string, quantity: number): Promise<IngredientStock | undefined> {
    const stock = this.ingredientStock.get(id);
    if (!stock) return undefined;
    stock.quantity = quantity.toString();
    this.ingredientStock.set(id, stock);
    return stock;
  }

  async deleteIngredientStock(id: string): Promise<boolean> {
    return this.ingredientStock.delete(id);
  }

  async getBakeryProducts(): Promise<BakeryProduct[]> {
    return Array.from(this.bakeryProducts.values());
  }

  async getBakeryProduct(id: string): Promise<BakeryProduct | undefined> {
    return this.bakeryProducts.get(id);
  }

  async createBakeryProduct(product: Omit<BakeryProduct, "id">): Promise<BakeryProduct> {
    const id = randomUUID();
    const newProduct: BakeryProduct = { ...product, id };
    this.bakeryProducts.set(id, newProduct);
    return newProduct;
  }

  async getProductStock(branchId: string): Promise<(ProductStock & { product: BakeryProduct })[]> {
    const stocks = Array.from(this.productStock.values()).filter((s) => s.branchId === branchId);
    return stocks.map((stock) => ({
      ...stock,
      product: this.bakeryProducts.get(stock.productId)!,
    })).filter((s) => s.product);
  }

  async addProductStock(stock: Omit<ProductStock, "id">): Promise<ProductStock> {
    const id = randomUUID();
    const newStock: ProductStock = { ...stock, id };
    this.productStock.set(id, newStock);
    return newStock;
  }

  async updateProductStock(id: string, quantity: number): Promise<ProductStock | undefined> {
    const stock = this.productStock.get(id);
    if (!stock) return undefined;
    stock.quantity = quantity;
    this.productStock.set(id, stock);
    return stock;
  }

  async addHourlyCheck(check: Omit<HourlyCheck, "id">): Promise<HourlyCheck> {
    const id = randomUUID();
    const newCheck: HourlyCheck = { ...check, id };
    this.hourlyChecks.set(id, newCheck);
    return newCheck;
  }

  async getHourlyChecks(branchId: string, date: Date): Promise<HourlyCheck[]> {
    const dateStr = date.toISOString().split("T")[0];
    return Array.from(this.hourlyChecks.values()).filter((check) => {
      const checkDate = new Date(check.checkTime).toISOString().split("T")[0];
      return check.branchId === branchId && checkDate === dateStr;
    });
  }

  async getDemandForecasts(branchId: string, date: Date): Promise<DemandForecast[]> {
    const dateStr = date.toISOString().split("T")[0];
    return Array.from(this.demandForecasts.values()).filter((forecast) => {
      return forecast.branchId === branchId && forecast.forecastDate === dateStr;
    });
  }

  async addDemandForecast(forecast: Omit<DemandForecast, "id">): Promise<DemandForecast> {
    const id = randomUUID();
    const newForecast: DemandForecast = { ...forecast, id };
    this.demandForecasts.set(id, newForecast);
    return newForecast;
  }

  async getBranchForecasts(date: string): Promise<BranchForecast[]> {
    return Array.from(this.branchForecasts.values()).filter((f) => f.forecastDate === date);
  }

  async getBranchForecast(branchId: string, date: string): Promise<(BranchForecast & { products: ProductForecast[] }) | undefined> {
    const branchForecast = Array.from(this.branchForecasts.values()).find(
      (f) => f.branchId === branchId && f.forecastDate === date
    );
    if (!branchForecast) return undefined;

    const products = await this.getProductForecasts(branchForecast.id);
    return { ...branchForecast, products };
  }

  async addBranchForecast(forecast: Omit<BranchForecast, "id" | "createdAt">): Promise<BranchForecast> {
    const id = randomUUID();
    const newForecast: BranchForecast = { 
      ...forecast, 
      id,
      createdAt: new Date(),
    };
    this.branchForecasts.set(id, newForecast);
    return newForecast;
  }

  async addProductForecast(forecast: Omit<ProductForecast, "id">): Promise<ProductForecast> {
    const id = randomUUID();
    const newForecast: ProductForecast = { ...forecast, id };
    this.productForecasts.set(id, newForecast);
    return newForecast;
  }

  async getProductForecasts(branchForecastId: string): Promise<ProductForecast[]> {
    return Array.from(this.productForecasts.values()).filter((f) => f.branchForecastId === branchForecastId);
  }

  async getProductRecipes(sku?: string): Promise<ProductRecipe[]> {
    return [];
  }

  async getProductionPlans(branchId?: string): Promise<ProductionPlan[]> {
    return [];
  }

  async getPromotionRecommendations(branchId?: string): Promise<PromotionRecommendation[]> {
    return [];
  }

  async getDynamicPricingSchedules(branchId?: string): Promise<DynamicPricingSchedule[]> {
    return [];
  }

  async getShelfLifeAlerts(branchId?: string): Promise<ShelfLifeAlert[]> {
    return [];
  }

  async getDailyActionPlans(branchId?: string): Promise<DailyActionPlan[]> {
    return [];
  }

  async getBranchWasteAnalysis(branchId?: string): Promise<BranchWasteAnalysis[]> {
    return [];
  }

  async getIngredientDemandForecasts(): Promise<IngredientDemandForecast[]> {
    return [];
  }
}

import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import * as schema from "@shared/schema";

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({ where: eq(schema.users.username, username) });
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async getBranches(): Promise<Branch[]> {
    return db.query.branches.findMany();
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    return db.query.branches.findFirst({ where: eq(schema.branches.id, id) });
  }

  async createBranch(branch: Branch): Promise<Branch> {
    const [newBranch] = await db.insert(schema.branches).values(branch).returning();
    return newBranch;
  }

  async getIngredients(): Promise<Ingredient[]> {
    return db.query.ingredients.findMany();
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    return db.query.ingredients.findFirst({ where: eq(schema.ingredients.id, id) });
  }

  async createIngredient(ingredient: Omit<Ingredient, "id">): Promise<Ingredient> {
    const [newIngredient] = await db.insert(schema.ingredients).values(ingredient).returning();
    return newIngredient;
  }

  async getIngredientStock(branchId: string): Promise<(IngredientStock & { ingredient: Ingredient })[]> {
    const result = await db.query.ingredientStock.findMany({
      where: eq(schema.ingredientStock.branchId, branchId),
      with: { ingredient: true },
    });
    return result as (IngredientStock & { ingredient: Ingredient })[];
  }

  async getIngredientStockExpiringSoon(branchId: string, days: number): Promise<(IngredientStock & { ingredient: Ingredient })[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    const result = await db.query.ingredientStock.findMany({
      where: and(
        eq(schema.ingredientStock.branchId, branchId),
        lte(schema.ingredientStock.expiryDate, futureDate.toISOString().split('T')[0])
      ),
      with: { ingredient: true },
    });
    return result as (IngredientStock & { ingredient: Ingredient })[];
  }

  async addIngredientStock(stock: Omit<IngredientStock, "id">): Promise<IngredientStock> {
    const [newStock] = await db.insert(schema.ingredientStock).values(stock).returning();
    return newStock;
  }

  async updateIngredientStock(id: string, quantity: number): Promise<IngredientStock | undefined> {
    const [updated] = await db.update(schema.ingredientStock)
      .set({ quantity: quantity.toString() })
      .where(eq(schema.ingredientStock.id, id))
      .returning();
    return updated;
  }

  async deleteIngredientStock(id: string): Promise<boolean> {
    const result = await db.delete(schema.ingredientStock).where(eq(schema.ingredientStock.id, id));
    return true;
  }

  async getBakeryProducts(): Promise<BakeryProduct[]> {
    return db.query.bakeryProducts.findMany();
  }

  async getBakeryProduct(id: string): Promise<BakeryProduct | undefined> {
    return db.query.bakeryProducts.findFirst({ where: eq(schema.bakeryProducts.id, id) });
  }

  async createBakeryProduct(product: Omit<BakeryProduct, "id">): Promise<BakeryProduct> {
    const [newProduct] = await db.insert(schema.bakeryProducts).values(product).returning();
    return newProduct;
  }

  async getProductStock(branchId: string): Promise<(ProductStock & { product: BakeryProduct })[]> {
    const result = await db.query.productStock.findMany({
      where: eq(schema.productStock.branchId, branchId),
      with: { product: true },
    });
    return result as (ProductStock & { product: BakeryProduct })[];
  }

  async addProductStock(stock: Omit<ProductStock, "id">): Promise<ProductStock> {
    const [newStock] = await db.insert(schema.productStock).values(stock).returning();
    return newStock;
  }

  async updateProductStock(id: string, quantity: number): Promise<ProductStock | undefined> {
    const [updated] = await db.update(schema.productStock)
      .set({ quantity })
      .where(eq(schema.productStock.id, id))
      .returning();
    return updated;
  }

  async addHourlyCheck(check: Omit<HourlyCheck, "id">): Promise<HourlyCheck> {
    const [newCheck] = await db.insert(schema.hourlyChecks).values(check).returning();
    return newCheck;
  }

  async getHourlyChecks(branchId: string, date: Date): Promise<HourlyCheck[]> {
    const dateStr = date.toISOString().split("T")[0];
    return db.query.hourlyChecks.findMany({
      where: and(
        eq(schema.hourlyChecks.branchId, branchId),
        gte(schema.hourlyChecks.checkTime, dateStr)
      ),
    });
  }

  async getDemandForecasts(branchId: string, date: Date): Promise<DemandForecast[]> {
    const dateStr = date.toISOString().split("T")[0];
    return db.query.demandForecasts.findMany({
      where: and(
        eq(schema.demandForecasts.branchId, branchId),
        eq(schema.demandForecasts.forecastDate, dateStr)
      ),
    });
  }

  async addDemandForecast(forecast: Omit<DemandForecast, "id">): Promise<DemandForecast> {
    const [newForecast] = await db.insert(schema.demandForecasts).values(forecast).returning();
    return newForecast;
  }

  async getBranchForecasts(date: string): Promise<BranchForecast[]> {
    return db.query.branchForecasts.findMany({
      where: eq(schema.branchForecasts.forecastDate, date),
    });
  }

  async getBranchForecast(branchId: string, date: string): Promise<(BranchForecast & { products: ProductForecast[] }) | undefined> {
    const branchForecast = await db.query.branchForecasts.findFirst({
      where: and(
        eq(schema.branchForecasts.branchId, branchId),
        eq(schema.branchForecasts.forecastDate, date)
      ),
      with: {
        products: true,
      },
    });
    if (!branchForecast) return undefined;
    
    const products = await this.getProductForecasts(branchForecast.id);
    return { ...branchForecast, products };
  }

  async addBranchForecast(forecast: Omit<BranchForecast, "id" | "createdAt">): Promise<BranchForecast> {
    const [newForecast] = await db.insert(schema.branchForecasts).values(forecast).returning();
    return newForecast;
  }

  async addProductForecast(forecast: Omit<ProductForecast, "id">): Promise<ProductForecast> {
    const [newForecast] = await db.insert(schema.productForecasts).values(forecast).returning();
    return newForecast;
  }

  async getProductForecasts(branchForecastId: string): Promise<ProductForecast[]> {
    return db.query.productForecasts.findMany({
      where: eq(schema.productForecasts.branchForecastId, branchForecastId),
    });
  }

  async getProductRecipes(sku?: string): Promise<ProductRecipe[]> {
    if (sku) {
      return db.query.productRecipes.findMany({
        where: eq(schema.productRecipes.sku, sku),
      });
    }
    return db.query.productRecipes.findMany();
  }

  async getProductionPlans(branchId?: string): Promise<ProductionPlan[]> {
    if (branchId) {
      return db.query.productionPlans.findMany({
        where: eq(schema.productionPlans.branch, branchId),
      });
    }
    return db.query.productionPlans.findMany();
  }

  async getPromotionRecommendations(branchId?: string): Promise<PromotionRecommendation[]> {
    if (branchId) {
      return db.query.promotionRecommendations.findMany({
        where: eq(schema.promotionRecommendations.store, branchId),
      });
    }
    return db.query.promotionRecommendations.findMany();
  }

  async getDynamicPricingSchedules(branchId?: string): Promise<DynamicPricingSchedule[]> {
    if (branchId) {
      return db.query.dynamicPricingSchedules.findMany({
        where: eq(schema.dynamicPricingSchedules.branch, branchId),
      });
    }
    return db.query.dynamicPricingSchedules.findMany();
  }

  async getShelfLifeAlerts(branchId?: string): Promise<ShelfLifeAlert[]> {
    if (branchId) {
      return db.query.shelfLifeAlerts.findMany({
        where: eq(schema.shelfLifeAlerts.branch, branchId),
      });
    }
    return db.query.shelfLifeAlerts.findMany();
  }

  async getDailyActionPlans(branchId?: string): Promise<DailyActionPlan[]> {
    if (branchId) {
      return db.query.dailyActionPlans.findMany({
        where: eq(schema.dailyActionPlans.branch, branchId),
      });
    }
    return db.query.dailyActionPlans.findMany();
  }

  async getBranchWasteAnalysis(branchId?: string): Promise<BranchWasteAnalysis[]> {
    if (branchId) {
      return db.query.branchWasteAnalysis.findMany({
        where: eq(schema.branchWasteAnalysis.store, branchId),
      });
    }
    return db.query.branchWasteAnalysis.findMany();
  }

  async getIngredientDemandForecasts(): Promise<IngredientDemandForecast[]> {
    return db.query.ingredientDemandForecasts.findMany();
  }
}

export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
