import { HourlyCheckModal } from "../HourlyCheckModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HourlyCheckModalExample() {
  const [open, setOpen] = useState(false);

  const mockProducts = [
    { id: "1", name: "ครัวซองต์", systemQuantity: 25 },
    { id: "2", name: "เดนิช", systemQuantity: 18 },
    { id: "3", name: "บัตเตอร์เค้ก", systemQuantity: 32 },
    { id: "4", name: "โดนัท", systemQuantity: 40 },
    { id: "5", name: "คุกกี้", systemQuantity: 55 },
    { id: "6", name: "แซนด์วิช", systemQuantity: 12 },
  ];

  const handleSubmit = (checks: any[]) => {
    console.log("Hourly check submitted:", checks);
  };

  return (
    <div className="p-6 bg-background">
      <Button onClick={() => setOpen(true)} data-testid="button-open-modal">
        เปิดหน้าต่างตรวจนับ
      </Button>
      <HourlyCheckModal
        open={open}
        onClose={() => setOpen(false)}
        products={mockProducts}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
