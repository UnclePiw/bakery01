import * as fs from 'fs';
import * as path from 'path';

interface ForecastItem {
  Branch: string;
  Product_Code: string;
  Product: string;
  Date: string;
  Forecast: number;
  Lower: number;
  Upper: number;
  "Accuracy_%": number;
  Method: string;
}

interface TransformedBranch {
  branchId: string;
  branchName: string;
  totalForecast: number;
  accuracy: number;
  products: {
    productCode: string;
    productName: string;
    forecastQuantity: number;
    minQuantity: number;
    maxQuantity: number;
    accuracy: number;
    modelType: string;
  }[];
}

async function transformAndImportForecast(jsonFilePath: string) {
  const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
  const forecastData: ForecastItem[] = JSON.parse(rawData);

  const branchMap = new Map<string, TransformedBranch>();
  let forecastDate = '';

  for (const item of forecastData) {
    const [branchId, branchName] = item.Branch.split(': ');
    
    if (!forecastDate) {
      forecastDate = item.Date;
    }

    if (!branchMap.has(branchId)) {
      branchMap.set(branchId, {
        branchId,
        branchName,
        totalForecast: 0,
        accuracy: 0,
        products: [],
      });
    }

    const branch = branchMap.get(branchId)!;
    branch.totalForecast += item.Forecast;
    
    branch.products.push({
      productCode: item.Product_Code,
      productName: item.Product,
      forecastQuantity: item.Forecast,
      minQuantity: item.Lower,
      maxQuantity: item.Upper,
      accuracy: item["Accuracy_%"],
      modelType: item.Method,
    });
  }

  const branches = Array.from(branchMap.values());
  for (const branch of branches) {
    const totalAccuracy = branch.products.reduce((sum: number, p) => sum + p.accuracy, 0);
    branch.accuracy = parseFloat((totalAccuracy / branch.products.length).toFixed(2));
  }

  const transformedData = {
    forecastDate,
    branches,
  };

  const response = await fetch('http://localhost:5000/api/forecasts/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformedData),
  });

  if (!response.ok) {
    throw new Error(`Failed to import: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ สำเร็จ! นำเข้าข้อมูลพยากรณ์ ${result.count} สาขาเรียบร้อยแล้ว`);
  console.log(`📅 วันที่: ${forecastDate}`);
  
  return result;
}

const jsonPath = path.join(process.cwd(), 'attached_assets/Hybrid_Forecast_20250701_1759726961744.json');
transformAndImportForecast(jsonPath)
  .then(() => {
    console.log('✨ การนำเข้าเสร็จสมบูรณ์');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  });
