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
