import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  systemQuantity: number;
  imageUrl?: string;
}

interface HourlyCheckModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (checks: { productId: string; counted: number; system: number }[]) => void;
}

export function HourlyCheckModal({ open, onClose, products, onSubmit }: HourlyCheckModalProps) {
  const [counts, setCounts] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.systemQuantity }), {})
  );

  const handleSubmit = () => {
    const checks = products.map((p) => ({
      productId: p.id,
      counted: counts[p.id] || 0,
      system: p.systemQuantity,
    }));
    onSubmit(checks);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ตรวจนับสต๊อกเบเกอรี่
          </DialogTitle>
          <DialogDescription>
            กรอกจำนวนสินค้าที่นับได้จริง ระบบจะคำนวณความแตกต่างและแนะนำโปรโมชั่นโดยอัตโนมัติ
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {products.map((product) => {
            const counted = counts[product.id] || 0;
            const variance = counted - product.systemQuantity;
            return (
              <div
                key={product.id}
                className="p-4 border rounded-md space-y-3"
                data-testid={`product-check-${product.id}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{product.name}</h4>
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
                    ในระบบ: <span className="font-mono font-medium">{product.systemQuantity}</span> ชิ้น
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
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} data-testid="button-submit-check">
            บันทึกการตรวจนับ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
