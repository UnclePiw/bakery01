import { AlertList } from "../AlertList";
import { useState } from "react";

export default function AlertListExample() {
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
    {
      id: "4",
      type: "warning" as const,
      message: "เนยสดจะหมดอายุใน 2 วัน (3 กก.)",
      timestamp: "1 ชั่วโมงที่แล้ว",
    },
  ]);

  const handleDismiss = (id: string) => {
    console.log("Dismiss alert:", id);
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleAction = (id: string) => {
    console.log("Action triggered for alert:", id);
  };

  return (
    <div className="p-6 bg-background">
      <AlertList
        alerts={alerts}
        onDismiss={handleDismiss}
        onAction={handleAction}
      />
    </div>
  );
}
