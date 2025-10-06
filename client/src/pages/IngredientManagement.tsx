import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, Package, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface IngredientStock {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  batchNumber?: string;
  daysUntilExpiry: number;
}

interface IngredientManagementProps {
  selectedBranchId: string;
}

export default function IngredientManagement({ selectedBranchId }: IngredientManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: stock, isLoading, error } = useQuery({
    queryKey: ["/api/ingredients/stock", selectedBranchId],
    queryFn: () => api.getIngredientStock(selectedBranchId),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลวัตถุดิบได้",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getExpiryBadge = (days: number) => {
    if (days <= 1) return { variant: "destructive" as const, text: "หมดอายุวันนี้" };
    if (days <= 3) return { variant: "destructive" as const, text: `${days} วัน` };
    if (days <= 7) return { variant: "default" as const, text: `${days} วัน` };
    return { variant: "secondary" as const, text: `${days} วัน` };
  };

  const filteredStock = (stock || []).filter((item: IngredientStock) =>
    item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการวัตถุดิบ</h1>
        <p className="text-sm text-muted-foreground">ตรวจสอบและจัดการสต๊อกวัตถุดิบ</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาวัตถุดิบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-ingredient"
            />
          </div>
          <Button variant="outline" data-testid="button-sort">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            เรียงตาม
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วัตถุดิบ</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>วันหมดอายุ</TableHead>
                <TableHead>เหลือเวลา</TableHead>
                <TableHead>เลขแบตช์</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ไม่พบวัตถุดิบ</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStock.map((item: IngredientStock) => {
                  const expiryBadge = getExpiryBadge(item.daysUntilExpiry);
                  return (
                    <TableRow key={item.id} data-testid={`row-ingredient-${item.id}`}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(item.expiryDate).toLocaleDateString("th-TH")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={expiryBadge.variant}>{expiryBadge.text}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.batchNumber || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" data-testid={`button-use-${item.id}`}>
                            ใช้
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-adjust-${item.id}`}>
                            ปรับ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
