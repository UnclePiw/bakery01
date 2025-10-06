import * as XLSX from 'xlsx';
import { join } from 'path';

export interface SkuRecipe {
  sku: string;
  productName: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface DemandForecast {
  date: string;
  hour: number;
  branch: string;
  product: string;
  predictedDemand: number;
}

export interface ShelfLifeAlert {
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysUntilExpiry: number;
  branch: string;
  suggestedAction: string;
}

export interface ProductionPlan {
  product: string;
  recommendedQuantity: number;
  branch: string;
  timeSlot: string;
}

export interface PricingSchedule {
  product: string;
  hour: number;
  discountPercentage: number;
  reason: string;
}

export class ExcelParser {
  private basePath = join(process.cwd(), 'attached_assets');

  parseSkuRecipes(): SkuRecipe[] {
    try {
      const workbook = XLSX.readFile(join(this.basePath, 'Ingredient_Report_1_SKU_Recipes_1759710915096.xlsx'));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      return data.map((row: any) => ({
        sku: String(row['SKU'] || row['sku'] || ''),
        productName: String(row['Product'] || row['product'] || row['Product Name'] || ''),
        ingredientName: String(row['Ingredient'] || row['ingredient'] || row['Ingredient Name'] || ''),
        quantity: parseFloat(row['Quantity'] || row['quantity'] || 0),
        unit: String(row['Unit'] || row['unit'] || ''),
      }));
    } catch (error) {
      console.error('Error parsing SKU recipes:', error);
      return [];
    }
  }

  parseDemandForecast(): DemandForecast[] {
    try {
      const workbook = XLSX.readFile(join(this.basePath, 'Ingredient_Report_3_Demand_Forecast_1759710915097.xlsx'));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      return data.map((row: any) => ({
        date: String(row['Date'] || row['date'] || ''),
        hour: parseInt(row['Hour'] || row['hour'] || 0),
        branch: String(row['Branch'] || row['branch'] || ''),
        product: String(row['Product'] || row['product'] || ''),
        predictedDemand: parseFloat(row['Predicted Demand'] || row['predicted_demand'] || row['Demand'] || 0),
      }));
    } catch (error) {
      console.error('Error parsing demand forecast:', error);
      return [];
    }
  }

  parseShelfLifeAlerts(): ShelfLifeAlert[] {
    try {
      const workbook = XLSX.readFile(join(this.basePath, 'Optimization_3_Shelf_Life_Alerts_1759710915097.xlsx'));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      return data.map((row: any) => ({
        ingredientName: String(row['Ingredient'] || row['ingredient'] || row['Ingredient Name'] || ''),
        quantity: parseFloat(row['Quantity'] || row['quantity'] || 0),
        unit: String(row['Unit'] || row['unit'] || ''),
        expiryDate: String(row['Expiry Date'] || row['expiry_date'] || row['ExpiryDate'] || ''),
        daysUntilExpiry: parseInt(row['Days Until Expiry'] || row['days_until_expiry'] || row['DaysRemaining'] || 0),
        branch: String(row['Branch'] || row['branch'] || ''),
        suggestedAction: String(row['Suggested Action'] || row['suggested_action'] || row['Action'] || ''),
      }));
    } catch (error) {
      console.error('Error parsing shelf life alerts:', error);
      return [];
    }
  }

  parseProductionPlans(): ProductionPlan[] {
    try {
      const workbook = XLSX.readFile(join(this.basePath, 'Optimization_2_Production_Plans_1759710915098.xlsx'));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      return data.map((row: any) => ({
        product: String(row['Product'] || row['product'] || ''),
        recommendedQuantity: parseFloat(row['Recommended Quantity'] || row['recommended_quantity'] || row['Quantity'] || 0),
        branch: String(row['Branch'] || row['branch'] || ''),
        timeSlot: String(row['Time Slot'] || row['time_slot'] || row['Time'] || ''),
      }));
    } catch (error) {
      console.error('Error parsing production plans:', error);
      return [];
    }
  }

  parsePricingSchedule(): PricingSchedule[] {
    try {
      const workbook = XLSX.readFile(join(this.basePath, 'Optimization_1_Dynamic_Pricing_Schedule_1759710915099.xlsx'));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      return data.map((row: any) => ({
        product: String(row['Product'] || row['product'] || ''),
        hour: parseInt(row['Hour'] || row['hour'] || 0),
        discountPercentage: parseFloat(row['Discount'] || row['discount'] || row['Discount %'] || 0),
        reason: String(row['Reason'] || row['reason'] || ''),
      }));
    } catch (error) {
      console.error('Error parsing pricing schedule:', error);
      return [];
    }
  }
}

export const excelParser = new ExcelParser();
