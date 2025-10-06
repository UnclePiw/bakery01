import fs from 'fs/promises';
import path from 'path';
import { db } from './db';
import * as schema from '@shared/schema';

async function importData() {
  try {
    const dataDir = path.join(process.cwd(), 'attached_assets', 'converted_files');

    console.log('Starting data import...');

    console.log('Importing product recipes...');
    const recipesData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Ingredient_Report_1_SKU_Recipes.json'), 'utf-8')
    );
    await db.delete(schema.productRecipes);
    const recipeValues = recipesData.map((item: any) => ({
      sku: item.SKU,
      shelfLifeDays: item.Shelf_Life_Days,
      totalCost: item.Total_Cost.toString(),
      ingredientCode: item.Ingredient_Code,
      quantity: item.Quantity.toString(),
      unit: item.Unit,
      price: item.Price.toString(),
      cost: item.Cost.toString(),
      hasSubstitute: item.Has_Substitute,
    }));
    await db.insert(schema.productRecipes).values(recipeValues);
    console.log(`✓ Imported ${recipesData.length} product recipes`);

    console.log('Importing production plans...');
    const productionPlansData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Optimization_2_Production_Plans.json'), 'utf-8')
    );
    await db.delete(schema.productionPlans);
    const productionValues = productionPlansData.map((item: any) => ({
      branch: item.Branch,
      productCode: item.Product_Code.toString(),
      product: item.Product,
      forecast: item.Forecast,
      optimalProduction: item.Optimal_Production,
      adjustment: item.Adjustment,
      reasoning: item.Reasoning,
      shelfLifeDays: item.Shelf_Life_Days,
      wasteRate: item.Waste_Rate.toString(),
    }));
    await db.insert(schema.productionPlans).values(productionValues);
    console.log(`✓ Imported ${productionPlansData.length} production plans`);

    console.log('Importing promotion recommendations...');
    const promotionsData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Report_3_Promotion_Recommendations.json'), 'utf-8')
    );
    await db.delete(schema.promotionRecommendations);
    const promotionValues = promotionsData.map((item: any) => ({
      store: item.store,
      productCode: item.product_code,
      qtySold: item.qty_sold,
      wasteQty: item.waste_qty,
      wasteRate: item.waste_rate.toString(),
      wasteCost: item.waste_cost.toString(),
      totalVolume: item.total_volume,
    }));
    await db.insert(schema.promotionRecommendations).values(promotionValues);
    console.log(`✓ Imported ${promotionsData.length} promotion recommendations`);

    console.log('Importing dynamic pricing schedules...');
    const pricingData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Optimization_1_Dynamic_Pricing_Schedule.json'), 'utf-8')
    );
    await db.delete(schema.dynamicPricingSchedules);
    const pricingValues = pricingData.map((item: any) => ({
      branch: item.Branch,
      productCode: item.Product_Code.toString(),
      product: item.Product,
      forecastQty: item.Forecast_Qty,
      time: item.Time,
      discountPercent: item['Discount_%'],
      action: item.Action,
      reason: item.Reason,
      priority: item.Priority,
      wasteRate: item.Waste_Rate.toString(),
    }));
    await db.insert(schema.dynamicPricingSchedules).values(pricingValues);
    console.log(`✓ Imported ${pricingData.length} dynamic pricing schedules`);

    console.log('Importing shelf life alerts...');
    const alertsData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Optimization_3_Shelf_Life_Alerts.json'), 'utf-8')
    );
    await db.delete(schema.shelfLifeAlerts);
    const alertValues = alertsData.map((item: any) => ({
      branch: item.Branch,
      product: item.Product,
      productCode: item.Product_Code.toString(),
      shelfLife: item.Shelf_Life,
      time: item.Time,
      alertType: item.Alert_Type,
      message: item.Message,
      action: item.Action,
      urgency: item.Urgency,
    }));
    await db.insert(schema.shelfLifeAlerts).values(alertValues);
    console.log(`✓ Imported ${alertsData.length} shelf life alerts`);

    console.log('Importing daily action plans...');
    const actionPlansData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Optimization_4_Daily_Action_Plan.json'), 'utf-8')
    );
    await db.delete(schema.dailyActionPlans);
    const actionValues = actionPlansData.map((item: any) => ({
      branch: item.Branch,
      product: item.Product,
      morningAction: item.Morning_Action,
      afternoonAction: item.Afternoon_Action,
      eveningAction: item.Evening_Action,
      shelfLife: item.Shelf_Life,
    }));
    await db.insert(schema.dailyActionPlans).values(actionValues);
    console.log(`✓ Imported ${actionPlansData.length} daily action plans`);

    console.log('Importing branch waste analysis...');
    const wasteAnalysisData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Report_2_Branch_Waste_Analysis.json'), 'utf-8')
    );
    await db.delete(schema.branchWasteAnalysis);
    const wasteValues = wasteAnalysisData.map((item: any) => ({
      store: item.store,
      qtySold: item.qty_sold,
      wasteQty: item.waste_qty,
      wasteCost: item.waste_cost.toString(),
      wasteRate: item.waste_rate.toString(),
      totalVolume: item.total_volume,
    }));
    await db.insert(schema.branchWasteAnalysis).values(wasteValues);
    console.log(`✓ Imported ${wasteAnalysisData.length} branch waste analysis records`);

    console.log('Importing ingredient demand forecasts...');
    const demandData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'Ingredient_Report_3_Demand_Forecast.json'), 'utf-8')
    );
    await db.delete(schema.ingredientDemandForecasts);
    const demandValues = demandData.map((item: any) => ({
      ingredientCode: item.Ingredient_Code,
      totalDemand: item.Total_Demand.toString(),
      unit: item.Unit,
      numSkus: item.Num_SKUs,
      numBranches: item.Num_Branches,
      hasSubstitute: item.Has_Substitute,
      numSubstitutes: item.Num_Substitutes,
    }));
    await db.insert(schema.ingredientDemandForecasts).values(demandValues);
    console.log(`✓ Imported ${demandData.length} ingredient demand forecasts`);

    console.log('\n✅ Data import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importData();
