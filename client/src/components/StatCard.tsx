import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  status?: "success" | "warning" | "critical" | "default";
}

export function StatCard({ title, value, icon: Icon, trend, status = "default" }: StatCardProps) {
  const borderColors = {
    success: "border-l-success",
    warning: "border-l-warning",
    critical: "border-l-critical",
    default: "border-l-primary",
  };

  const iconColors = {
    success: "text-success",
    warning: "text-warning",
    critical: "text-critical",
    default: "text-primary",
  };

  return (
    <Card className={cn("p-6 border-l-4", borderColors[status])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-mono font-medium mt-2" data-testid={`stat-value-${title}`}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </div>
        <Icon className={cn("h-8 w-8", iconColors[status])} />
      </div>
    </Card>
  );
}
