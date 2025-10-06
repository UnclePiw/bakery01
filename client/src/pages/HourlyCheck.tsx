import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  systemQuantity: number;
  lastCheck?: string;
}

interface HourlyCheckProps {
  selectedBranchId: string;
}

export default function HourlyCheck({ selectedBranchId }: HourlyCheckProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productStock, isLoading } = useQuery({
    queryKey: ["/api/products/stock", selectedBranchId],
    queryFn: () => api.getProductStock(selectedBranchId),
  });

  useEffect(() => {
    if (productStock) {
      const initialCounts = productStock.reduce(
        (acc: Record<string, number>, p: Product) => ({ ...acc, [p.id]: p.systemQuantity }),
        {}
      );
      setCounts(initialCounts);
    }
  }, [productStock]);

  const submitMutation = useMutation({
    mutationFn: (checks: any[]) => api.submitHourlyCheck(selectedBranchId, checks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/stock", selectedBranchId] });
      setSubmitted(true);
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกการตรวจนับสต๊อกเรียบร้อยแล้ว",
      });
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตรวจนับได้",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const checks = Object.entries(counts).map(([productId, actualCount]) => ({
      productId,
      actualCount,
    }));
    submitMutation.mutate(checks);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ตรวจนับสต๊อกรายชั่วโมง</h1>
            <p className="text-sm text-muted-foreground">
              ตรวจนับสต๊อกเบเกอรี่เพื่อแนะนำโปรโมชั่นและปรับปรุงสต๊อก
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
        {(productStock || []).map((product: Product) => {
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
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          size="lg" 
          data-testid="button-submit-check"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตรวจนับทั้งหมด"}
        </Button>
      </Card>
    </div>
  );
}
