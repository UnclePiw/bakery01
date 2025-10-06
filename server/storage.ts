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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: Omit<Branch, "id">): Promise<Branch>;

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
      { id: randomUUID(), name: "สาขาสยาม", location: "สยามพารากอน" },
      { id: randomUUID(), name: "สาขาอโศก", location: "เทอมินอล 21" },
      { id: randomUUID(), name: "สาขาสีลม", location: "ซิลม คอมเพล็กซ์" },
      { id: randomUUID(), name: "สาขาเซ็นทรัล", location: "เซ็นทรัลเวิลด์" },
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
      { id: randomUUID(), name: "คุกกี้", imageUrl: null, shelfLifeHours: 72 },
      { id: randomUUID(), name: "แซนด์วิช", imageUrl: null, shelfLifeHours: 6 },
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

  async createBranch(branch: Omit<Branch, "id">): Promise<Branch> {
    const id = randomUUID();
    const newBranch: Branch = { ...branch, id };
    this.branches.set(id, newBranch);
    return newBranch;
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
}

export const storage = new MemStorage();
