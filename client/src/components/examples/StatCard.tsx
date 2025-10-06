import { StatCard } from "../StatCard";
import { Package, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-background">
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
        icon={CheckCircle}
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
  );
}
