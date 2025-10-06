import { StatCard } from "@/components/StatCard";
import { AlertList } from "@/components/AlertList";
import { ForecastChart } from "@/components/ForecastChart";
import { ForecastPanel } from "@/components/ForecastPanel";
import { ProductionRecommendation } from "@/components/ProductionRecommendation";
import { IngredientEntryForm } from "@/components/IngredientEntryForm";
import { HourlyCheckModal } from "@/components/HourlyCheckModal";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Package, AlertTriangle, TrendingUp, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  selectedBranchId: string;
}

export default function Dashboard({ selectedBranchId }: DashboardProps) {
  const [showHourlyCheck, setShowHourlyCheck] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [forecastDate, setForecastDate] = useState(new Date().toISOString().split("T")[0]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">ภาพรวมสาขาของคุณ</p>
        </div>
        <Button onClick={() => setShowDateTimePicker(true)} variant="outline" data-testid="button-adjust-datetime">
          ตรวจสอบวันเวลา
        </Button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ForecastChart data={forecastData} currentHour={new Date().getHours().toString()} />
          <IngredientEntryForm ingredients={ingredients} onSubmit={handleIngredientSubmit} />
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
