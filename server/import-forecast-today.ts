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

async function transformAndImportForecast(jsonFilePath: string, targetDate: string) {
  const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
  const forecastData: ForecastItem[] = JSON.parse(rawData);

  const branchMap = new Map<string, TransformedBranch>();

  for (const item of forecastData) {
    const [branchId, branchName] = item.Branch.split(': ');

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
    forecastDate: targetDate,
    branches,
  };

  console.log(`\n📊 สาขาทั้งหมด: ${branches.length}`);
  console.log(`\n📦 ตัวอย่างสาขา 3510:`);
  const branch3510 = branches.find(b => b.branchId === '3510');
  if (branch3510) {
    console.log(`   - จำนวนสินค้า: ${branch3510.products.length}`);
    console.log(`   - สินค้า: ${branch3510.products.map(p => p.productName).join(', ')}`);
  }

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
  console.log(`📅 วันที่: ${targetDate}`);
  
  return result;
}

const today = new Date().toISOString().split('T')[0];
const jsonPath = path.join(process.cwd(), 'attached_assets/Hybrid_Forecast_20250701_1759726961744.json');

console.log(`🚀 เริ่มนำเข้าข้อมูลพยากรณ์สำหรับวันนี้: ${today}`);

transformAndImportForecast(jsonPath, today)
  .then(() => {
    console.log('✨ การนำเข้าเสร็จสมบูรณ์');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  });
