import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Check, X } from "lucide-react";
import { useState } from "react";

interface DateTimePickerProps {
  currentDate: string;
  currentTime: string;
  onConfirm: (date: string, time: string) => void;
  onCancel: () => void;
}

export function DateTimePicker({ currentDate, currentTime, onConfirm, onCancel }: DateTimePickerProps) {
  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">ตรวจสอบและปรับวันเวลา</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>วันที่ปัจจุบัน</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {new Date(currentDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-date"
            />
          </div>
          <div>
            <Label>เวลาปัจจุบัน</Label>
            <div className="text-sm text-muted-foreground mb-2">{currentTime}</div>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              data-testid="input-time"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-testid="button-cancel-datetime"
          >
            <X className="h-4 w-4 mr-2" />
            ยกเลิก
          </Button>
          <Button
            onClick={() => onConfirm(date, time)}
            className="flex-1"
            data-testid="button-confirm-datetime"
          >
            <Check className="h-4 w-4 mr-2" />
            ยืนยัน
          </Button>
        </div>
      </div>
    </Card>
  );
}
