import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, Package, Clock, Percent, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TodayForecastProps {
  selectedBranchId: string;
}

interface ProductForecastWithStock {
  productName: string;
  productCode: string | null;
  forecastQuantity: number;
  minQuantity: number | null;
  maxQuantity: number | null;
  currentStock: number;
  hoursOnShelf: number;
  needsPromotion: boolean;
  shelfLifeHours: number;
  accuracy: string | null;
  modelType: string | null;
}

interface TodayForecastData {
  date: string;
  branchId: string;
  branchName: string;
  totalForecast: number;
  accuracy: string | null;
  products: ProductForecastWithStock[];
}

export default function TodayForecast({ selectedBranchId }: TodayForecastProps) {
  const { data: forecastData, isLoading } = useQuery<TodayForecastData>({
    queryKey: ["/api/today-forecast", selectedBranchId],
    queryFn: async () => {
      const response = await fetch(`/api/today-forecast/${selectedBranchId}`);
      if (!response.ok) throw new Error("Failed to fetch forecast");
      return response.json();
    },
  });

  const today = new Date();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              กำลังโหลดข้อมูล...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const promotionProducts = forecastData?.products.filter((p) => p.needsPromotion) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          พยากรณ์ความต้องการ (วันนี้)
        </h1>
        <p className="text-sm text-muted-foreground">
          {format(today, "d MMMM yyyy", { locale: th })}
        </p>
      </div>

      {promotionProducts.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>แจ้งเตือนโปรโมชั่น:</strong> มีสินค้า {promotionProducts.length} รายการที่อยู่บน shelf เกิน 3 ชั่วโมง ควรทำโปรโมชั่น
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>ยอดพยากรณ์รวม</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-total-forecast">
              {forecastData?.totalForecast || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              ชิ้นทั้งหมด
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>ความแม่นยำ</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-accuracy">
              {forecastData?.accuracy ? `${parseFloat(forecastData.accuracy).toFixed(1)}%` : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Percent className="w-3 h-3" />
              จากการพยากรณ์ก่อนหน้า
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>สินค้าต้องโปรโมชั่น</CardDescription>
            <CardTitle className="text-3xl text-orange-600 dark:text-orange-400" data-testid="text-promotion-count">
              {promotionProducts.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              บน shelf เกิน 3 ชม.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้าที่พยากรณ์</CardTitle>
          <CardDescription>
            แสดงจำนวนที่พยากรณ์และสถานะโปรโมชั่น
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecastData && forecastData.products.length > 0 ? (
              forecastData.products.map((product, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    product.needsPromotion
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "bg-card"
                  }`}
                  data-testid={`product-forecast-${index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold" data-testid={`text-product-name-${index}`}>
                          {product.productName}
                        </h3>
                        {product.productCode && (
                          <Badge variant="outline" className="text-xs">
                            {product.productCode}
                          </Badge>
                        )}
                        {product.needsPromotion && (
                          <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            ต้องทำโปรโมชั่น
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs">จำนวนที่พยากรณ์</div>
                          <div className="font-semibold font-mono" data-testid={`text-forecast-quantity-${index}`}>
                            {product.forecastQuantity} ชิ้น
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground text-xs">ช่วงพยากรณ์</div>
                          <div className="font-semibold font-mono text-xs" data-testid={`text-forecast-range-${index}`}>
                            {product.minQuantity !== null && product.maxQuantity !== null
                              ? `${product.minQuantity} - ${product.maxQuantity} ชิ้น`
                              : "N/A"}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground text-xs">สต็อคปัจจุบัน</div>
                          <div className="font-semibold font-mono flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {product.currentStock} ชิ้น
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground text-xs">อยู่บน shelf</div>
                          <div className={`font-semibold font-mono flex items-center gap-1 ${
                            product.needsPromotion ? "text-orange-600 dark:text-orange-400" : ""
                          }`}>
                            <Clock className="w-3 h-3" />
                            {product.hoursOnShelf.toFixed(1)} ชม.
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground text-xs">อายุสินค้า</div>
                          <div className="font-semibold text-xs">
                            {product.shelfLifeHours} ชั่วโมง
                          </div>
                        </div>
                      </div>

                      {product.needsPromotion && (
                        <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-900/30 rounded border border-orange-300 dark:border-orange-700">
                          <p className="text-xs text-orange-800 dark:text-orange-200 font-medium">
                            💡 คำแนะนำ: สินค้าอยู่บน shelf มา {product.hoursOnShelf.toFixed(1)} ชั่วโมงแล้ว 
                            ควรทำโปรโมชั่นลดราคาหรือแถมเพื่อช่วยขาย
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {product.modelType && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Model: {product.modelType}
                      </Badge>
                      {product.accuracy && (
                        <Badge variant="secondary" className="text-xs">
                          Accuracy: {parseFloat(product.accuracy).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ยังไม่มีข้อมูลพยากรณ์สำหรับวันนี้</p>
                <p className="text-sm mt-1">กรุณานำเข้าข้อมูลจาก Forecast Import</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
