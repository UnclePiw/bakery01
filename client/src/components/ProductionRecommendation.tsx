import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";

interface ProductionItem {
  id: string;
  name: string;
  currentStock: number;
  forecastDemand: number;
  suggestedProduction: number;
  ingredientsAvailable: boolean;
  shelfLifeHours: number;
}

interface ProductionRecommendationProps {
  items: ProductionItem[];
  onStartProduction: (productionPlan: { productId: string; quantity: number }[]) => void;
}

export function ProductionRecommendation({ items, onStartProduction }: ProductionRecommendationProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.suggestedProduction }), {})
  );

  const handleSubmit = () => {
    const plan = items
      .filter((item) => quantities[item.id] > 0)
      .map((item) => ({
        productId: item.id,
        quantity: quantities[item.id],
      }));
    onStartProduction(plan);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">แนะนำการผลิต</h3>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          อัพเดทล่าสุด: {new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
        </Badge>
      </div>
      <div className="space-y-4">
        {items.map((item) => {
          const shortage = item.forecastDemand - item.currentStock;
          return (
            <div
              key={item.id}
              className="p-4 border rounded-md space-y-3"
              data-testid={`production-item-${item.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>สต๊อกปัจจุบัน: <span className="font-mono font-medium">{item.currentStock}</span></span>
                    <span>คาดการณ์: <span className="font-mono font-medium">{item.forecastDemand}</span></span>
                    {shortage > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        ขาด {shortage}
                      </Badge>
                    )}
                  </div>
                </div>
                {item.ingredientsAvailable ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-critical" />
                )}
              </div>
              <div>
                <Label htmlFor={`qty-${item.id}`}>
                  จำนวนที่จะผลิต
                  <span className="text-xs text-muted-foreground ml-2">
                    (แนะนำ: {item.suggestedProduction})
                  </span>
                </Label>
                <Input
                  id={`qty-${item.id}`}
                  type="number"
                  value={quantities[item.id]}
                  onChange={(e) =>
                    setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 0 })
                  }
                  className="font-mono text-lg"
                  disabled={!item.ingredientsAvailable}
                  data-testid={`input-production-${item.id}`}
                />
              </div>
              {!item.ingredientsAvailable && (
                <div className="text-sm text-critical flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  วัตถุดิบไม่เพียงพอ
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t">
        <Button onClick={handleSubmit} className="w-full" data-testid="button-start-production">
          เริ่มการผลิต
        </Button>
      </div>
    </Card>
  );
}
