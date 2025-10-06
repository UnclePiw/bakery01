import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, AlertCircle, Info, Calendar, Package } from "lucide-react";
import { useState } from "react";

interface ExpirationAlert {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysUntilExpiry: number;
  suggestedAction: string;
}

export default function Alerts() {
  const mockAlerts: ExpirationAlert[] = [
    {
      id: "1",
      ingredientName: "แป้งขนมปัง",
      quantity: 5,
      unit: "กก.",
      expiryDate: "2025-10-06",
      daysUntilExpiry: 0,
      suggestedAction: "ใช้ทันที - ผลิตขนมปัง",
    },
    {
      id: "2",
      ingredientName: "นมสด",
      quantity: 2,
      unit: "ลิตร",
      expiryDate: "2025-10-07",
      daysUntilExpiry: 1,
      suggestedAction: "ใช้ในการผลิตวันนี้",
    },
    {
      id: "3",
      ingredientName: "เนยสด",
      quantity: 3,
      unit: "กก.",
      expiryDate: "2025-10-08",
      daysUntilExpiry: 2,
      suggestedAction: "วางแผนใช้ภายใน 2 วัน",
    },
    {
      id: "4",
      ingredientName: "ไข่ไก่",
      quantity: 24,
      unit: "ฟอง",
      expiryDate: "2025-10-10",
      daysUntilExpiry: 4,
      suggestedAction: "ใช้ในการผลิตสัปดาห์นี้",
    },
    {
      id: "5",
      ingredientName: "ครีมสด",
      quantity: 1.5,
      unit: "ลิตร",
      expiryDate: "2025-10-12",
      daysUntilExpiry: 6,
      suggestedAction: "ผลิตเค้กครีม",
    },
  ];

  const [alerts, setAlerts] = useState(mockAlerts);

  const todayAlerts = alerts.filter((a) => a.daysUntilExpiry === 0);
  const thisWeekAlerts = alerts.filter((a) => a.daysUntilExpiry > 0 && a.daysUntilExpiry <= 3);
  const nextWeekAlerts = alerts.filter((a) => a.daysUntilExpiry > 3 && a.daysUntilExpiry <= 7);

  const getAlertColor = (days: number) => {
    if (days === 0) return "border-l-critical bg-critical/5";
    if (days <= 3) return "border-l-warning bg-warning/5";
    return "border-l-primary bg-primary/5";
  };

  const renderAlertList = (alertList: ExpirationAlert[]) => {
    if (alertList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>ไม่มีการแจ้งเตือนในหมวดนี้</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {alertList.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 border-l-4 ${getAlertColor(alert.daysUntilExpiry)}`}
            data-testid={`alert-${alert.id}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {alert.daysUntilExpiry === 0 ? (
                    <AlertCircle className="h-5 w-5 text-critical" />
                  ) : alert.daysUntilExpiry <= 3 ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : (
                    <Info className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="font-semibold">{alert.ingredientName}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                  <div>
                    จำนวน:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {alert.quantity} {alert.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(alert.expiryDate).toLocaleDateString("th-TH")}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={
                      alert.daysUntilExpiry === 0
                        ? "destructive"
                        : alert.daysUntilExpiry <= 3
                          ? "default"
                          : "secondary"
                    }
                  >
                    {alert.daysUntilExpiry === 0
                      ? "หมดอายุวันนี้"
                      : `เหลือ ${alert.daysUntilExpiry} วัน`}
                  </Badge>
                </div>
                <div className="text-sm bg-card rounded-md p-2 border">
                  <span className="font-medium">คำแนะนำ:</span> {alert.suggestedAction}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" data-testid={`button-use-${alert.id}`}>
                  ใช้เลย
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
                  data-testid={`button-dismiss-${alert.id}`}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>
        <p className="text-sm text-muted-foreground">
          ติดตามวัตถุดิบที่ใกล้หมดอายุและรับคำแนะนำ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-critical">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">หมดอายุวันนี้</p>
              <p className="text-2xl font-mono font-bold">{todayAlerts.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-critical" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ภายใน 3 วัน</p>
              <p className="text-2xl font-mono font-bold">{thisWeekAlerts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">สัปดาห์หน้า</p>
              <p className="text-2xl font-mono font-bold">{nextWeekAlerts.length}</p>
            </div>
            <Info className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" data-testid="tab-today">
              หมดอายุวันนี้ ({todayAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="thisweek" data-testid="tab-thisweek">
              ภายใน 3 วัน ({thisWeekAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="nextweek" data-testid="tab-nextweek">
              สัปดาห์หน้า ({nextWeekAlerts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-6">
            {renderAlertList(todayAlerts)}
          </TabsContent>
          <TabsContent value="thisweek" className="mt-6">
            {renderAlertList(thisWeekAlerts)}
          </TabsContent>
          <TabsContent value="nextweek" className="mt-6">
            {renderAlertList(nextWeekAlerts)}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
