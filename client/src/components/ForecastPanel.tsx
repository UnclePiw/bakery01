import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, Sparkles, Calendar, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import type { BranchForecast, ProductForecast } from "@shared/schema";

interface ForecastPanelProps {
  selectedBranch: string;
  selectedDate: string;
}

export function ForecastPanel({ selectedBranch, selectedDate }: ForecastPanelProps) {
  const { data: allForecasts, isLoading: loadingAll } = useQuery<(BranchForecast & { products: ProductForecast[] })[]>({
    queryKey: ["/api/forecasts", selectedDate],
    enabled: !!selectedDate,
  });

  const { data: branchForecast, isLoading: loadingBranch } = useQuery<BranchForecast & { products: ProductForecast[] }>({
    queryKey: ["/api/forecasts", selectedBranch, selectedDate],
    enabled: !!selectedBranch && !!selectedDate,
  });

  if (loadingAll && loadingBranch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            กำลังโหลดข้อมูลการพยากรณ์...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const overallAccuracy = allForecasts && allForecasts.length > 0
    ? allForecasts.reduce((sum, f) => sum + parseFloat(f.accuracy || "0"), 0) / allForecasts.length
    : 0;

  const branchAccuracy = branchForecast?.accuracy ? parseFloat(branchForecast.accuracy) : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            ข้อมูลการพยากรณ์จาก Hybrid Bakery Forecast System
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            วันที่: {selectedDate ? format(new Date(selectedDate), "d MMMM yyyy", { locale: th }) : "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">สาขาทั้งหมด</span>
                <Target className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-total-branches">
                {allForecasts?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">สาขาที่มีการพยากรณ์</p>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ความแม่นยำเฉลี่ย</span>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold" data-testid="text-overall-accuracy">
                  {overallAccuracy.toFixed(2)}%
                </div>
                {overallAccuracy >= 60 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">จากทุกสาขา</p>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ความแม่นยำสาขานี้</span>
                <Target className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-branch-accuracy">
                {branchAccuracy !== null ? `${branchAccuracy.toFixed(2)}%` : "-"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {branchForecast?.branchName || "กรุณาเลือกสาขา"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {branchForecast && (
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" data-testid="tab-products">
              รายการสินค้า
            </TabsTrigger>
            <TabsTrigger value="chart" data-testid="tab-chart">
              กราฟเปรียบเทียบ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>การพยากรณ์ตามผลิตภัณฑ์</CardTitle>
                <CardDescription>
                  พยากรณ์ความต้องการสินค้าแต่ละช้นสำหรับ {branchForecast.branchName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branchForecast.products.map((product) => {
                    const productAccuracy = parseFloat(product.accuracy || "0");
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                        data-testid={`product-forecast-${product.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{product.productName}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.productCode}
                            </Badge>
                            <Badge
                              variant={productAccuracy >= 60 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {productAccuracy.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>พยากรณ์: {product.forecastQuantity} ชิ้น</span>
                            <span>ต่ำสุด: {product.minQuantity}</span>
                            <span>สูงสุด: {product.maxQuantity}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.modelType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>กราฟเปรียบเทียบการพยากรณ์</CardTitle>
                <CardDescription>
                  ความแม่นยำและปริมาณพยากรณ์แต่ละผลิตภัณฑ์
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={branchForecast.products}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productCode"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-2">{data.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              พยากรณ์: {data.forecastQuantity} ชิ้น
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ความแม่นยำ: {parseFloat(data.accuracy || "0").toFixed(2)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ช่วง: {data.minQuantity} - {data.maxQuantity}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="forecastQuantity"
                      name="ปริมาณพยากรณ์"
                      fill="hsl(var(--primary))"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey={(data: ProductForecast) => parseFloat(data.accuracy || "0")}
                      name="ความแม่นยำ (%)"
                      fill="hsl(var(--chart-2))"
                    >
                      {branchForecast.products.map((entry, index) => {
                        const accuracy = parseFloat(entry.accuracy || "0");
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={accuracy >= 60 ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))"}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {allForecasts && allForecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>สรุปความแม่นยำทุกสาขา</CardTitle>
            <CardDescription>เปรียบเทียบความแม่นยำการพยากรณ์ระหว่างสาขา</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={allForecasts.map((f) => ({
                  branchName: f.branchName,
                  accuracy: parseFloat(f.accuracy || "0"),
                  totalForecast: f.totalForecast,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-1">{data.branchName}</p>
                        <p className="text-sm text-muted-foreground">
                          ความแม่นยำ: {data.accuracy.toFixed(2)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ยอดรวม: {data.totalForecast} ชิ้น
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="accuracy" name="ความแม่นยำ (%)" fill="hsl(var(--primary))">
                  {allForecasts.map((entry, index) => {
                    const accuracy = parseFloat(entry.accuracy || "0");
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          accuracy >= 70
                            ? "hsl(var(--chart-1))"
                            : accuracy >= 50
                            ? "hsl(var(--chart-2))"
                            : "hsl(var(--chart-3))"
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
