import { StatCard } from "@/components/StatCard";
import { AlertList } from "@/components/AlertList";
import { ForecastChart } from "@/components/ForecastChart";
import { ProductionRecommendation } from "@/components/ProductionRecommendation";
import { IngredientEntryForm } from "@/components/IngredientEntryForm";
import { HourlyCheckModal } from "@/components/HourlyCheckModal";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Package, AlertTriangle, TrendingUp, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [showHourlyCheck, setShowHourlyCheck] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      type: "critical" as const,
      message: "แป้งขนมปังจะหมดอายุวันนี้ (5 กก.)",
      timestamp: "10 นาทีที่แล้ว",
      actionLabel: "ดูรายละเอียด",
    },
    {
      id: "2",
      type: "warning" as const,
      message: "นมสดเหลือน้อย (2 ลิตร) - ควรสั่งเพิ่ม",
      timestamp: "30 นาทีที่แล้ว",
      actionLabel: "สั่งซื้อ",
    },
    {
      id: "3",
      type: "info" as const,
      message: "ถึงเวลาตรวจเช็คสต๊อกชั่วโมง 14:00",
      timestamp: "5 นาทีที่แล้ว",
      actionLabel: "ตรวจเช็คเลย",
    },
  ]);

  const mockForecastData = [
    { hour: "08:00", predicted: 45, actual: 42 },
    { hour: "09:00", predicted: 65, actual: 68 },
    { hour: "10:00", predicted: 85, actual: 82 },
    { hour: "11:00", predicted: 95, actual: 90 },
    { hour: "12:00", predicted: 120, actual: 115 },
    { hour: "13:00", predicted: 100, actual: 105 },
    { hour: "14:00", predicted: 75 },
    { hour: "15:00", predicted: 60 },
    { hour: "16:00", predicted: 80 },
  ];

  const mockIngredients = [
    { id: "1", name: "แป้งขนมปัง", unit: "กก." },
    { id: "2", name: "นมสด", unit: "ลิตร" },
    { id: "3", name: "เนยสด", unit: "กก." },
    { id: "4", name: "ไข่ไก่", unit: "ฟอง" },
    { id: "5", name: "น้ำตาล", unit: "กก." },
  ];

  const mockProducts = [
    { id: "1", name: "ครัวซองต์", systemQuantity: 25 },
    { id: "2", name: "เดนิช", systemQuantity: 18 },
    { id: "3", name: "บัตเตอร์เค้ก", systemQuantity: 32 },
    { id: "4", name: "โดนัท", systemQuantity: 40 },
  ];

  const mockProductionItems = [
    {
      id: "1",
      name: "ครัวซองต์",
      currentStock: 15,
      forecastDemand: 45,
      suggestedProduction: 35,
      ingredientsAvailable: true,
      shelfLifeHours: 8,
    },
    {
      id: "2",
      name: "เดนิช",
      currentStock: 8,
      forecastDemand: 30,
      suggestedProduction: 25,
      ingredientsAvailable: true,
      shelfLifeHours: 12,
    },
    {
      id: "3",
      name: "บัตเตอร์เค้ก",
      currentStock: 20,
      forecastDemand: 28,
      suggestedProduction: 10,
      ingredientsAvailable: false,
      shelfLifeHours: 24,
    },
  ];

  const handleDateTimeConfirm = (date: string, time: string) => {
    console.log("Confirmed date and time:", { date, time });
    setShowDateTimePicker(false);
  };

  const handleIngredientSubmit = (entries: any[], type: "yesterday" | "today") => {
    console.log(`Submitting ${type} entries:`, entries);
  };

  const handleHourlyCheckSubmit = (checks: any[]) => {
    console.log("Hourly check submitted:", checks);
    setShowHourlyCheck(false);
  };

  const handleProductionStart = (plan: any[]) => {
    console.log("Starting production:", plan);
  };

  const handleAlertDismiss = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleAlertAction = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (alert?.actionLabel === "ตรวจเช็คเลย") {
      setShowHourlyCheck(true);
    }
    console.log("Alert action:", id);
  };

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
          value="87"
          icon={Package}
          trend="+5 จากเมื่อวาน"
          status="success"
        />
        <StatCard
          title="ใกล้หมดอายุ"
          value="12"
          icon={AlertTriangle}
          trend="ภายใน 3 วัน"
          status="warning"
        />
        <StatCard
          title="เบเกอรี่วันนี้"
          value="245"
          icon={ShoppingBag}
          trend="85% ของเป้าหมาย"
          status="success"
        />
        <StatCard
          title="ยอดขาย"
          value="45,200"
          icon={TrendingUp}
          trend="+12% จากเมื่อวาน"
          status="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ForecastChart data={mockForecastData} currentHour="14:00" />
          <IngredientEntryForm ingredients={mockIngredients} onSubmit={handleIngredientSubmit} />
        </div>
        <div className="space-y-6">
          <AlertList alerts={alerts} onDismiss={handleAlertDismiss} onAction={handleAlertAction} />
          <ProductionRecommendation items={mockProductionItems} onStartProduction={handleProductionStart} />
        </div>
      </div>

      <HourlyCheckModal
        open={showHourlyCheck}
        onClose={() => setShowHourlyCheck(false)}
        products={mockProducts}
        onSubmit={handleHourlyCheckSubmit}
      />
    </div>
  );
}
