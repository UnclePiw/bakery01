import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const branches = pgTable("branches", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
});

export const ingredients = pgTable("ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  imageUrl: text("image_url"),
});

export const ingredientStock = pgTable("ingredient_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ingredientId: varchar("ingredient_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  expiryDate: date("expiry_date").notNull(),
  batchNumber: text("batch_number"),
  receivedDate: date("received_date").notNull(),
  isFromYesterday: boolean("is_from_yesterday").notNull().default(false),
});

export const bakeryProducts = pgTable("bakery_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  shelfLifeHours: integer("shelf_life_hours").notNull(),
});

export const productStock = pgTable("product_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  quantity: integer("quantity").notNull(),
  productionTime: timestamp("production_time").notNull(),
});

export const hourlyChecks = pgTable("hourly_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").notNull(),
  productId: varchar("product_id").notNull(),
  checkTime: text("check_time").notNull(),
  countedQuantity: integer("counted_quantity").notNull(),
  systemQuantity: integer("system_quantity").notNull(),
  variance: integer("variance").notNull(),
});

export const demandForecasts = pgTable("demand_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").notNull(),
  productId: varchar("product_id").notNull(),
  forecastDate: date("forecast_date").notNull(),
  hour: integer("hour").notNull(),
  predictedDemand: integer("predicted_demand").notNull(),
});

export const branchForecasts = pgTable("branch_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").notNull(),
  branchName: text("branch_name").notNull(),
  forecastDate: date("forecast_date").notNull(),
  totalForecast: integer("total_forecast").notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const productForecasts = pgTable("product_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchForecastId: varchar("branch_forecast_id").notNull(),
  productId: varchar("product_id").notNull(),
  productCode: text("product_code"),
  productName: text("product_name").notNull(),
  forecastQuantity: integer("forecast_quantity").notNull(),
  minQuantity: integer("min_quantity"),
  maxQuantity: integer("max_quantity"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  modelType: text("model_type"),
});

export const productRecipes = pgTable("product_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull(),
  shelfLifeDays: integer("shelf_life_days").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  ingredientCode: text("ingredient_code").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  hasSubstitute: boolean("has_substitute").notNull(),
});

export const productionPlans = pgTable("production_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branch: text("branch").notNull(),
  productCode: text("product_code").notNull(),
  product: text("product").notNull(),
  forecast: integer("forecast").notNull(),
  optimalProduction: integer("optimal_production").notNull(),
  adjustment: text("adjustment").notNull(),
  reasoning: text("reasoning").notNull(),
  shelfLifeDays: integer("shelf_life_days").notNull(),
  wasteRate: decimal("waste_rate", { precision: 10, scale: 2 }).notNull(),
});

export const promotionRecommendations = pgTable("promotion_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  store: text("store").notNull(),
  productCode: text("product_code").notNull(),
  qtySold: integer("qty_sold").notNull(),
  wasteQty: integer("waste_qty").notNull(),
  wasteRate: decimal("waste_rate", { precision: 10, scale: 2 }).notNull(),
  wasteCost: decimal("waste_cost", { precision: 10, scale: 2 }).notNull(),
  totalVolume: integer("total_volume").notNull(),
});

export const dynamicPricingSchedules = pgTable("dynamic_pricing_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branch: text("branch").notNull(),
  productCode: text("product_code").notNull(),
  product: text("product").notNull(),
  forecastQty: integer("forecast_qty").notNull(),
  time: text("time").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  action: text("action").notNull(),
  reason: text("reason").notNull(),
  priority: integer("priority").notNull(),
  wasteRate: decimal("waste_rate", { precision: 10, scale: 2 }).notNull(),
});

export const shelfLifeAlerts = pgTable("shelf_life_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branch: text("branch").notNull(),
  product: text("product").notNull(),
  productCode: text("product_code").notNull(),
  shelfLife: integer("shelf_life").notNull(),
  time: text("time").notNull(),
  alertType: text("alert_type").notNull(),
  message: text("message").notNull(),
  action: text("action").notNull(),
  urgency: text("urgency").notNull(),
});

export const dailyActionPlans = pgTable("daily_action_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branch: text("branch").notNull(),
  product: text("product").notNull(),
  morningAction: text("morning_action").notNull(),
  afternoonAction: text("afternoon_action").notNull(),
  eveningAction: text("evening_action").notNull(),
  shelfLife: integer("shelf_life").notNull(),
});

export const branchWasteAnalysis = pgTable("branch_waste_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  store: text("store").notNull(),
  qtySold: integer("qty_sold").notNull(),
  wasteQty: integer("waste_qty").notNull(),
  wasteCost: decimal("waste_cost", { precision: 10, scale: 2 }).notNull(),
  wasteRate: decimal("waste_rate", { precision: 10, scale: 2 }).notNull(),
  totalVolume: integer("total_volume").notNull(),
});

export const ingredientDemandForecasts = pgTable("ingredient_demand_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ingredientCode: text("ingredient_code").notNull(),
  totalDemand: decimal("total_demand", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  numSkus: integer("num_skus").notNull(),
  numBranches: integer("num_branches").notNull(),
  hasSubstitute: boolean("has_substitute").notNull(),
  numSubstitutes: integer("num_substitutes").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBranchSchema = createInsertSchema(branches);
export const insertIngredientSchema = createInsertSchema(ingredients).omit({ id: true });
export const insertIngredientStockSchema = createInsertSchema(ingredientStock).omit({ id: true });
export const insertBakeryProductSchema = createInsertSchema(bakeryProducts).omit({ id: true });
export const insertProductStockSchema = createInsertSchema(productStock).omit({ id: true });
export const insertHourlyCheckSchema = createInsertSchema(hourlyChecks).omit({ id: true });
export const insertDemandForecastSchema = createInsertSchema(demandForecasts).omit({ id: true });
export const insertBranchForecastSchema = createInsertSchema(branchForecasts).omit({ id: true, createdAt: true });
export const insertProductForecastSchema = createInsertSchema(productForecasts).omit({ id: true });
export const insertProductRecipeSchema = createInsertSchema(productRecipes).omit({ id: true });
export const insertProductionPlanSchema = createInsertSchema(productionPlans).omit({ id: true });
export const insertPromotionRecommendationSchema = createInsertSchema(promotionRecommendations).omit({ id: true });
export const insertDynamicPricingScheduleSchema = createInsertSchema(dynamicPricingSchedules).omit({ id: true });
export const insertShelfLifeAlertSchema = createInsertSchema(shelfLifeAlerts).omit({ id: true });
export const insertDailyActionPlanSchema = createInsertSchema(dailyActionPlans).omit({ id: true });
export const insertBranchWasteAnalysisSchema = createInsertSchema(branchWasteAnalysis).omit({ id: true });
export const insertIngredientDemandForecastSchema = createInsertSchema(ingredientDemandForecasts).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
export type IngredientStock = typeof ingredientStock.$inferSelect;
export type BakeryProduct = typeof bakeryProducts.$inferSelect;
export type ProductStock = typeof productStock.$inferSelect;
export type HourlyCheck = typeof hourlyChecks.$inferSelect;
export type DemandForecast = typeof demandForecasts.$inferSelect;
export type BranchForecast = typeof branchForecasts.$inferSelect;
export type ProductForecast = typeof productForecasts.$inferSelect;
export type ProductRecipe = typeof productRecipes.$inferSelect;
export type ProductionPlan = typeof productionPlans.$inferSelect;
export type PromotionRecommendation = typeof promotionRecommendations.$inferSelect;
export type DynamicPricingSchedule = typeof dynamicPricingSchedules.$inferSelect;
export type ShelfLifeAlert = typeof shelfLifeAlerts.$inferSelect;
export type DailyActionPlan = typeof dailyActionPlans.$inferSelect;
export type BranchWasteAnalysis = typeof branchWasteAnalysis.$inferSelect;
export type IngredientDemandForecast = typeof ingredientDemandForecasts.$inferSelect;
