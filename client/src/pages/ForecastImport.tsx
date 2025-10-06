import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileJson, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ForecastImport() {
  const [jsonData, setJsonData] = useState("");
  const [parseError, setParseError] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/forecasts/import", "POST", data),
    onSuccess: (response: any) => {
      toast({
        title: "สำเร็จ",
        description: `นำเข้าข้อมูลการพยากรณ์ ${response.count} สาขาเรียบร้อยแล้ว`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forecasts"] });
      setJsonData("");
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถนำเข้าข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const mockData = {
    forecastDate: new Date().toISOString().split("T")[0],
    branches: [
      {
        branchId: "1",
        branchName: "สาขาสยาม",
        totalForecast: 450,
        accuracy: 58.75,
        products: [
          { productCode: "CRS", productName: "ครัวซองต์", forecastQuantity: 120, minQuantity: 100, maxQuantity: 150, accuracy: 62.5, modelType: "Hybrid" },
          { productCode: "DNH", productName: "เดนิช", forecastQuantity: 90, minQuantity: 70, maxQuantity: 110, accuracy: 55.2, modelType: "ARIMA" },
          { productCode: "BTK", productName: "บัตเตอร์เค้ก", forecastQuantity: 80, minQuantity: 60, maxQuantity: 100, accuracy: 60.1, modelType: "LSTM" },
          { productCode: "DNT", productName: "โดนัท", forecastQuantity: 100, minQuantity: 80, maxQuantity: 120, accuracy: 58.0, modelType: "Hybrid" },
          { productCode: "CKE", productName: "คุกกี้", forecastQuantity: 60, minQuantity: 40, maxQuantity: 80, accuracy: 57.3, modelType: "Prophet" },
        ],
      },
    ],
  };

  const handleLoadMock = () => {
    setJsonData(JSON.stringify(mockData, null, 2));
    setParseError("");
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.forecastDate || !Array.isArray(data.branches)) {
        setParseError("รูปแบบข้อมูลไม่ถูกต้อง: ต้องมี forecastDate และ branches");
        return;
      }

      for (const branch of data.branches) {
        if (!branch.branchId || !branch.branchName || !Array.isArray(branch.products)) {
          setParseError("รูปแบบข้อมูลสาขาไม่ถูกต้อง");
          return;
        }
      }

      setParseError("");
      importMutation.mutate(data);
    } catch (error) {
      setParseError(`JSON ไม่ถูกต้อง: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">นำเข้าข้อมูลการพยากรณ์</h1>
        <p className="text-sm text-muted-foreground">นำเข้าข้อมูลจาก Hybrid Bakery Forecast System</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              ข้อมูล JSON
            </CardTitle>
            <CardDescription>วางข้อมูล JSON ของการพยากรณ์</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="วางข้อมูล JSON ที่นี่..."
              className="font-mono text-sm min-h-[400px]"
              data-testid="textarea-json-data"
            />

            {parseError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">เกิดข้อผิดพลาด</p>
                  <p className="text-sm text-destructive/80">{parseError}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleLoadMock}
                variant="outline"
                className="flex-1"
                data-testid="button-load-mock"
              >
                โหลดข้อมูลตัวอย่าง
              </Button>
              <Button
                onClick={handleImport}
                disabled={!jsonData || importMutation.isPending}
                className="flex-1"
                data-testid="button-import"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังนำเข้า...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    นำเข้าข้อมูล
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รูปแบบข้อมูล</CardTitle>
            <CardDescription>ตัวอย่างโครงสร้างข้อมูล JSON ที่ถูกต้อง</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto max-h-[500px]">
                {JSON.stringify(
                  {
                    forecastDate: "2025-10-06",
                    branches: [
                      {
                        branchId: "1",
                        branchName: "สาขาสยาม",
                        totalForecast: 450,
                        accuracy: 58.75,
                        products: [
                          {
                            productCode: "CRS",
                            productName: "ครัวซองต์",
                            forecastQuantity: 120,
                            minQuantity: 100,
                            maxQuantity: 150,
                            accuracy: 62.5,
                            modelType: "Hybrid",
                          },
                        ],
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">ฟิลด์ที่จำเป็น:</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">forecastDate</Badge>
                  <span className="text-xs text-muted-foreground">วันที่พยากรณ์ (YYYY-MM-DD)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">branches</Badge>
                  <span className="text-xs text-muted-foreground">รายการสาขา (array)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className="text-xs">branchId</Badge>
                  <span className="text-xs text-muted-foreground">รหัสสาขา</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className="text-xs">branchName</Badge>
                  <span className="text-xs text-muted-foreground">ชื่อสาขา</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className="text-xs">products</Badge>
                  <span className="text-xs text-muted-foreground">รายการสินค้า (array)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
