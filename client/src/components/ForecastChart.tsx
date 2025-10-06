import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ForecastData {
  hour: string;
  predicted: number;
  actual?: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  currentHour?: string;
}

export function ForecastChart({ data, currentHour }: ForecastChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">พยากรณ์ความต้องการ (วันนี้)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="hour"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend />
          <Bar
            dataKey="predicted"
            fill="hsl(var(--chart-1))"
            name="คาดการณ์"
            radius={[4, 4, 0, 0]}
          />
          {data.some((d) => d.actual !== undefined) && (
            <Bar
              dataKey="actual"
              fill="hsl(var(--chart-2))"
              name="จริง"
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
