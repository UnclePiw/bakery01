import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  systemQuantity: number;
  lastCheck?: string;
}

export default function HourlyCheck() {
  const mockProducts: Product[] = [
    { id: "1", name: "ครัวซองต์", systemQuantity: 25, lastCheck: "13:00" },
    { id: "2", name: "เดนิช", systemQuantity: 18, lastCheck: "13:00" },
    { id: "3", name: "บัตเตอร์เค้ก", systemQuantity: 32, lastCheck: "13:00" },
    { id: "4", name: "โดนัท", systemQuantity: 40, lastCheck: "13:00" },
    { id: "5", name: "คุกกี้", systemQuantity: 55, lastCheck: "13:00" },
    { id: "6", name: "แซนด์วิช", systemQuantity: 12, lastCheck: "13:00" },
  ];

  const [counts, setCounts] = useState<Record<string, number>>(
    mockProducts.reduce((acc, p) => ({ ...acc, [p.id]: p.systemQuantity }), {})
  );

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log("Submitting hourly check:", counts);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ตรวจนับสต๊อกรายชั่วโมง</h1>
          <p className="text-sm text-muted-foreground">
            ตรวจนับสต๊อกเบเกอรี่เพื่อแนะนำโปรโมชั่นและปรับปรุงสต๊อก
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
        </Badge>
      </div>

      {submitted && (
        <Card className="p-4 bg-success/10 border-success">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">บันทึกการตรวจนับสำเร็จ</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProducts.map((product) => {
          const counted = counts[product.id] || 0;
          const variance = counted - product.systemQuantity;
          return (
            <Card key={product.id} className="p-6" data-testid={`card-product-${product.id}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{product.name}</h3>
                  {variance !== 0 && (
                    <Badge
                      variant={variance < 0 ? "destructive" : "secondary"}
                      className="gap-1"
                    >
                      {variance > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {variance > 0 ? "+" : ""}
                      {variance}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    ในระบบ:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {product.systemQuantity}
                    </span>{" "}
                    ชิ้น
                  </div>
                  {product.lastCheck && (
                    <div className="text-xs text-muted-foreground">
                      ตรวจล่าสุด: {product.lastCheck}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor={`count-${product.id}`}>นับได้จริง</Label>
                  <Input
                    id={`count-${product.id}`}
                    type="number"
                    value={counted}
                    onChange={(e) =>
                      setCounts({ ...counts, [product.id]: parseInt(e.target.value) || 0 })
                    }
                    className="font-mono text-lg"
                    data-testid={`input-count-${product.id}`}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <Button onClick={handleSubmit} className="w-full" size="lg" data-testid="button-submit-check">
          บันทึกการตรวจนับทั้งหมด
        </Button>
      </Card>
    </div>
  );
}
