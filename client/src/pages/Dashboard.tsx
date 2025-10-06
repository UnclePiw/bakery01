import { StatCard } from "@/components/StatCard";
import { AlertList } from "@/components/AlertList";
import { ForecastChart } from "@/components/ForecastChart";
import { ForecastPanel } from "@/components/ForecastPanel";
import { ProductionRecommendation } from "@/components/ProductionRecommendation";
import { IngredientEntryForm } from "@/components/IngredientEntryForm";
import { HourlyCheckModal } from "@/components/HourlyCheckModal";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Package, AlertTriangle, TrendingUp, ShoppingBag, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useLocation } from "wouter";

interface DashboardProps {
  selectedBranchId: string;
}

export default function Dashboard({ selectedBranchId }: DashboardProps) {
  const [showHourlyCheck, setShowHourlyCheck] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [forecastDate, setForecastDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateTimeConfirmed, setDateTimeConfirmed] = useState(false);
  const [ingredientsEntered, setIngredientsEntered] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", selectedBranchId],
    queryFn: () => api.getStats(selectedBranchId),
  });

  const { data: expiringIngredients = [] } = useQuery({
    queryKey: ["/api/ingredients/expiring", selectedBranchId],
    queryFn: () => api.getExpiringIngredients(selectedBranchId, 7),
  });

  const { data: forecastData = [] } = useQuery({
    queryKey: ["/api/forecast", selectedBranchId],
    queryFn: () => api.getForecast(selectedBranchId),
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ["/api/ingredients"],
    queryFn: () => api.getIngredients(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const { data: productStock = [] } = useQuery({
    queryKey: ["/api/products/stock", selectedBranchId],
    queryFn: () => api.getProductStock(selectedBranchId),
  });

  const { data: productionPlan = [] } = useQuery({
    queryKey: ["/api/production-plan", selectedBranchId],
    queryFn: () => api.getProductionPlan(selectedBranchId),
  });

  const { data: ingredientStock = [] } = useQuery({
    queryKey: ["/api/ingredients/stock", selectedBranchId],
    queryFn: () => api.getIngredientStock(selectedBranchId),
  });

  const addIngredientBatchMutation = useMutation({
    mutationFn: ({ entries, type }: { entries: any[]; type: "yesterday" | "today" }) =>
      api.addIngredientStockBatch(selectedBranchId, entries, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients/stock", selectedBranchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients/expiring", selectedBranchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", selectedBranchId] });
      toast({
        title: "สำเร็จ",
        description: "บันทึกข้อมูลวัตถุดิบเรียบร้อยแล้ว",
        action: (
          <ToastAction altText="ดูรายการ" onClick={() => setLocation("/ingredients")}>
            ดูรายการ
          </ToastAction>
        ),
      });
      setLocation("/ingredients");
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const hourlyCheckMutation = useMutation({
    mutationFn: (checks: any[]) => api.submitHourlyCheck(selectedBranchId, checks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/stock", selectedBranchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", selectedBranchId] });
      toast({
        title: "สำเร็จ",
        description: "บันทึกการตรวจนับเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตรวจนับได้",
        variant: "destructive",
      });
    },
  });

  const alerts = expiringIngredients.slice(0, 5).map((ing: any, index: number) => ({
    id: ing.id || `alert-${index}`,
    type: ing.daysUntilExpiry === 0 ? ("critical" as const) : ing.daysUntilExpiry <= 3 ? ("warning" as const) : ("info" as const),
    message: `${ing.ingredientName} ${ing.daysUntilExpiry === 0 ? "หมดอายุวันนี้" : `จะหมดอายุใน ${ing.daysUntilExpiry} วัน`} (${ing.quantity} ${ing.unit})`,
    timestamp: new Date().toLocaleString("th-TH"),
    actionLabel: "ดูรายละเอียด",
  }));

  const handleDateTimeConfirm = (date: string, time: string) => {
    console.log("Confirmed date and time:", { date, time });
    setShowDateTimePicker(false);
    setDateTimeConfirmed(true);
    toast({
      title: "ยืนยันวันเวลาแล้ว",
      description: "คุณสามารถดำเนินการขั้นตอนถัดไปได้",
    });
  };

  const handleIngredientSubmit = (entries: any[], type: "yesterday" | "today") => {
    if (entries.length === 0) {
      toast({
        title: "ไม่มีข้อมูล",
        description: "กรุณาเพิ่มรายการวัตถุดิบ",
        variant: "destructive",
      });
      return;
    }

    const validEntries = entries.filter(
      (e) => e.ingredientId && e.quantity > 0 && e.expiryDate
    );

    if (validEntries.length === 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    addIngredientBatchMutation.mutate({ entries: validEntries, type });
    setIngredientsEntered(true);
  };

  const handleHourlyCheckSubmit = (checks: any[]) => {
    hourlyCheckMutation.mutate(checks);
    setShowHourlyCheck(false);
  };

  const handleProductionStart = (plan: any[]) => {
    console.log("Starting production:", plan);
    toast({
      title: "เริ่มการผลิต",
      description: `กำลังผลิต ${plan.length} รายการ`,
    });
  };

  const handleAlertDismiss = (id: string) => {
    console.log("Dismiss alert:", id);
  };

  const handleAlertAction = (id: string) => {
    console.log("Alert action:", id);
  };

  const productsForHourlyCheck = productStock.map((ps: any) => ({
    id: ps.productId,
    name: ps.product.name,
    systemQuantity: ps.quantity,
  }));

  const getExpiryBadge = (days: number) => {
    if (days <= 1) return { variant: "destructive" as const, text: "หมดอายุวันนี้" };
    if (days <= 3) return { variant: "destructive" as const, text: `${days} วัน` };
    if (days <= 7) return { variant: "default" as const, text: `${days} วัน` };
    return { variant: "secondary" as const, text: `${days} วัน` };
  };

  const recentIngredients = ingredientStock
    .sort((a: any, b: any) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    .slice(0, 5);

  const workflowSteps = [
    {
      id: 1,
      title: "เช็ควันเวลา",
      description: "ตรวจสอบและปรับวันเวลาให้ตรงกับปัจจุบัน",
      completed: dateTimeConfirmed,
      action: () => setShowDateTimePicker(true),
      buttonText: dateTimeConfirmed ? "เช็คอีกครั้ง" : "เริ่มเช็ค",
    },
    {
      id: 2,
      title: "กรอกวัตถุดิบ",
      description: "บันทึกวัตถุดิบเหลือจากเมื่อวาน และรับเข้าวันนี้",
      completed: ingredientsEntered,
      disabled: !dateTimeConfirmed,
      info: "กรอกข้อมูลด้านล่าง",
    },
    {
      id: 3,
      title: "ดู Forecast",
      description: "พิจารณาการผลิตจากพยากรณ์ความต้องการ",
      completed: false,
      disabled: !ingredientsEntered,
      action: () => setLocation("/today-forecast"),
      buttonText: "ดูพยากรณ์",
    },
    {
      id: 4,
      title: "ตรวจนับรายชั่วโมง",
      description: "ตรวจนับสต๊อกเบเกอรี่ทุกชั่วโมง",
      completed: false,
      action: () => setShowHourlyCheck(true),
      buttonText: "เริ่มตรวจนับ",
      recurring: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">ทำงานตามขั้นตอนเพื่อเริ่มต้นวันใหม่</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">ขั้นตอนการทำงานประจำวัน</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                step.completed
                  ? "border-primary bg-primary/5"
                  : step.disabled
                  ? "border-muted bg-muted/30 opacity-60"
                  : "border-border hover-elevate"
              }`}
              data-testid={`workflow-step-${step.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      step.completed
                        ? "bg-primary text-primary-foreground"
                        : step.disabled
                        ? "bg-muted text-muted-foreground"
                        : "bg-card border-2 border-primary text-primary"
                    }`}
                  >
                    {step.completed ? "✓" : step.id}
                  </div>
                  {step.recurring && (
                    <Badge variant="secondary" className="text-xs">ทุกชั่วโมง</Badge>
                  )}
                </div>
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
              {step.action && (
                <Button
                  size="sm"
                  variant={step.completed ? "outline" : "default"}
                  className="w-full"
                  onClick={step.action}
                  disabled={step.disabled}
                  data-testid={`button-workflow-${step.id}`}
                >
                  {step.buttonText}
                </Button>
              )}
              {step.info && (
                <p className="text-xs text-primary font-medium">{step.info}</p>
              )}
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 translate-x-full">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {showDateTimePicker && (
        <DateTimePicker
          currentDate={new Date().toISOString().split("T")[0]}
          currentTime={new Date().toTimeString().slice(0, 5)}
          onConfirm={handleDateTimeConfirm}
          onCancel={() => setShowDateTimePicker(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="วัตถุดิบคงเหลือ"
          value={stats?.totalIngredients || 0}
          icon={Package}
          trend="+5 จากเมื่อวาน"
          status="success"
        />
        <StatCard
          title="ใกล้หมดอายุ"
          value={stats?.expiringCount || 0}
          icon={AlertTriangle}
          trend="ภายใน 3 วัน"
          status={stats?.expiringCount > 5 ? "warning" : "success"}
        />
        <StatCard
          title="เบเกอรี่วันนี้"
          value={stats?.totalProducts || 0}
          icon={ShoppingBag}
          trend="85% ของเป้าหมาย"
          status="success"
        />
        <StatCard
          title="ยอดขาย"
          value={stats?.salesAmount?.toLocaleString() || "0"}
          icon={TrendingUp}
          trend={`+${stats?.salesTrend || 0}% จากเมื่อวาน`}
          status="default"
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">วัตถุดิบที่เพิ่มล่าสุด</h2>
            <p className="text-sm text-muted-foreground">รายการวัตถุดิบที่เพิ่มเข้ามาล่าสุด 5 รายการ</p>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/ingredients")} data-testid="button-view-all-ingredients">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        <div className="space-y-3">
          {recentIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>ยังไม่มีรายการวัตถุดิบ</p>
            </div>
          ) : (
            recentIngredients.map((item: any) => {
              const expiryBadge = getExpiryBadge(item.daysUntilExpiry);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-md border hover-elevate"
                  data-testid={`recent-ingredient-${item.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.ingredient?.name || item.name}</p>
                      {item.isFromYesterday && (
                        <Badge variant="secondary" className="text-xs">จากเมื่อวาน</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      จำนวน: {item.quantity} {item.ingredient?.unit || item.unit}
                      {item.batchNumber && ` • แบตช์: ${item.batchNumber}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.expiryDate).toLocaleDateString("th-TH")}</span>
                      </div>
                      <Badge variant={expiryBadge.variant} className="mt-1">
                        {expiryBadge.text}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h2 className="text-lg font-semibold">กรอกข้อมูลวัตถุดิบ</h2>
            <p className="text-sm text-muted-foreground">บันทึกวัตถุดิบเหลือจากเมื่อวาน และวัตถุดิบที่รับเข้าวันนี้</p>
          </div>
        </div>
        {!dateTimeConfirmed ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>กรุณาเช็ควันเวลาก่อนกรอกข้อมูลวัตถุดิบ</p>
          </div>
        ) : (
          <IngredientEntryForm ingredients={ingredients} onSubmit={handleIngredientSubmit} />
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-lg font-semibold">พยากรณ์ความต้องการวันนี้</h2>
                <p className="text-sm text-muted-foreground">ดูข้อมูลพยากรณ์เพื่อวางแผนการผลิต</p>
              </div>
            </div>
            <ForecastChart data={forecastData} currentHour={new Date().getHours().toString()} />
          </Card>
        </div>
        <div className="space-y-6">
          <AlertList alerts={alerts} onDismiss={handleAlertDismiss} onAction={handleAlertAction} />
          <ProductionRecommendation items={productionPlan} onStartProduction={handleProductionStart} />
        </div>
      </div>

      <ForecastPanel selectedBranch={selectedBranchId} selectedDate={forecastDate} />

      <HourlyCheckModal
        open={showHourlyCheck}
        onClose={() => setShowHourlyCheck(false)}
        products={productsForHourlyCheck}
        onSubmit={handleHourlyCheckSubmit}
      />
    </div>
  );
}
