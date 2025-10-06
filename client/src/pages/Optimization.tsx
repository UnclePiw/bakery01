import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, AlertCircle, Calendar } from "lucide-react";
import type {
  ProductionPlan,
  PromotionRecommendation,
  DynamicPricingSchedule,
  DailyActionPlan,
} from "@shared/schema";

interface OptimizationProps {
  selectedBranchId: string;
}

export default function Optimization({ selectedBranchId }: OptimizationProps) {
  const { data: productionPlans = [], isLoading: isLoadingPlans } = useQuery<ProductionPlan[]>({
    queryKey: ["/api/optimization/production-plans", { branchId: selectedBranchId }],
  });

  const { data: promotions = [], isLoading: isLoadingPromotions } = useQuery<PromotionRecommendation[]>({
    queryKey: ["/api/optimization/promotions", { branchId: selectedBranchId }],
  });

  const { data: pricingSchedules = [], isLoading: isLoadingPricing } = useQuery<DynamicPricingSchedule[]>({
    queryKey: ["/api/optimization/pricing-schedules", { branchId: selectedBranchId }],
  });

  const { data: dailyActions = [], isLoading: isLoadingActions } = useQuery<DailyActionPlan[]>({
    queryKey: ["/api/optimization/daily-actions", { branchId: selectedBranchId }],
  });

  if (isLoadingPlans || isLoadingPromotions || isLoadingPricing || isLoadingActions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-optimization">การเพิ่มประสิทธิภาพ</h1>
        <p className="text-muted-foreground">แผนการผลิต โปรโมชั่น และการกำหนดราคาแบบไดนามิก</p>
      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="production" data-testid="tab-production">
            <TrendingUp className="h-4 w-4 mr-2" />
            แผนการผลิต
          </TabsTrigger>
          <TabsTrigger value="promotions" data-testid="tab-promotions">
            <AlertCircle className="h-4 w-4 mr-2" />
            โปรโมชั่น
          </TabsTrigger>
          <TabsTrigger value="pricing" data-testid="tab-pricing">
            <Clock className="h-4 w-4 mr-2" />
            กำหนดราคา
          </TabsTrigger>
          <TabsTrigger value="actions" data-testid="tab-actions">
            <Calendar className="h-4 w-4 mr-2" />
            แผนประจำวัน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แผนการผลิตที่เหมาะสม</CardTitle>
              <CardDescription>ปริมาณการผลิตที่แนะนำตามพยากรณ์และอัตราของเสีย</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productionPlans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูลแผนการผลิต</p>
                ) : (
                  productionPlans.map((plan) => (
                    <Card key={plan.id} data-testid={`production-plan-${plan.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{plan.product}</CardTitle>
                            <CardDescription>รหัส: {plan.productCode}</CardDescription>
                          </div>
                          <Badge variant={plan.adjustment === "Reduce" ? "destructive" : "default"}>
                            {plan.adjustment}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">พยากรณ์</p>
                            <p className="font-semibold">{plan.forecast} ชิ้น</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ควรผลิต</p>
                            <p className="font-semibold text-primary">{plan.optimalProduction} ชิ้น</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">อัตราของเสีย</p>
                            <p className="font-semibold">{parseFloat(plan.wasteRate).toFixed(2)}%</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">เหตุผล:</p>
                          <p className="text-sm">{plan.reasoning}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>คำแนะนำโปรโมชั่น</CardTitle>
              <CardDescription>สินค้าที่มีอัตราของเสียสูงควรทำโปรโมชั่น</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promotions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูลโปรโมชั่น</p>
                ) : (
                  promotions
                    .sort((a, b) => parseFloat(b.wasteRate) - parseFloat(a.wasteRate))
                    .map((promo) => (
                      <Card key={promo.id} data-testid={`promotion-${promo.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">รหัสสินค้า: {promo.productCode}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">ขายได้</p>
                                  <p className="font-semibold">{promo.qtySold} ชิ้น</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ของเสีย</p>
                                  <p className="font-semibold text-destructive">{promo.wasteQty} ชิ้น</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">อัตราของเสีย</p>
                                  <p className="font-semibold">{parseFloat(promo.wasteRate).toFixed(2)}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ต้นทุนของเสีย</p>
                                  <p className="font-semibold">฿{parseFloat(promo.wasteCost).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={parseFloat(promo.wasteRate) > 10 ? "destructive" : "secondary"}
                              className="ml-4"
                            >
                              {parseFloat(promo.wasteRate) > 10 ? "ด่วน" : "ปกติ"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ตารางการลดราคาแบบไดนามิก</CardTitle>
              <CardDescription>กำหนดเวลาและอัตราส่วนลดตามช่วงเวลา</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingSchedules.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูลการกำหนดราคา</p>
                ) : (
                  pricingSchedules
                    .sort((a, b) => a.priority - b.priority)
                    .map((schedule) => (
                      <Card key={schedule.id} data-testid={`pricing-${schedule.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{schedule.product}</h3>
                                <Badge variant="outline">{schedule.time}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">พยากรณ์</p>
                                  <p className="font-semibold">{schedule.forecastQty} ชิ้น</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ส่วนลด</p>
                                  <p className="font-semibold text-primary">{schedule.discountPercent}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">การดำเนินการ</p>
                                  <p className="font-semibold">{schedule.action}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ลำดับความสำคัญ</p>
                                  <p className="font-semibold">#{schedule.priority}</p>
                                </div>
                              </div>
                              <div className="mt-3 p-2 bg-muted rounded-md">
                                <p className="text-sm">{schedule.reason}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แผนการดำเนินการประจำวัน</CardTitle>
              <CardDescription>กิจกรรมที่แนะนำสำหรับแต่ละช่วงเวลา</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyActions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูลแผนประจำวัน</p>
                ) : (
                  dailyActions.map((action) => (
                    <Card key={action.id} data-testid={`action-${action.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{action.product}</CardTitle>
                          <Badge variant="outline">อายุ {action.shelfLife} วัน</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded-md">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">เช้า (08:00-12:00)</p>
                              <p className="text-sm text-muted-foreground">{action.morningAction}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-orange-500/10 text-orange-500 p-2 rounded-md">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">บ่าย (12:00-17:00)</p>
                              <p className="text-sm text-muted-foreground">{action.afternoonAction}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-md">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">เย็น (17:00-20:00)</p>
                              <p className="text-sm text-muted-foreground">{action.eveningAction}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
