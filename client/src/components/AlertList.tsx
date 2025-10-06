import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  actionLabel?: string;
}

interface AlertListProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
}

export function AlertList({ alerts, onDismiss, onAction }: AlertListProps) {
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-critical" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBadgeVariant = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
    }
  };

  const groupedAlerts = {
    critical: alerts.filter((a) => a.type === "critical"),
    warning: alerts.filter((a) => a.type === "warning"),
    info: alerts.filter((a) => a.type === "info"),
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">การแจ้งเตือน</h3>
        <Badge variant="secondary" data-testid="badge-alert-count">
          {alerts.length}
        </Badge>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {Object.entries(groupedAlerts).map(([type, typeAlerts]) =>
            typeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md border-l-4 bg-card",
                  alert.type === "critical" && "border-l-critical",
                  alert.type === "warning" && "border-l-warning",
                  alert.type === "info" && "border-l-primary"
                )}
                data-testid={`alert-${alert.id}`}
              >
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                  {alert.actionLabel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => onAction?.(alert.id)}
                      data-testid={`button-action-${alert.id}`}
                    >
                      {alert.actionLabel}
                    </Button>
                  )}
                </div>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onDismiss(alert.id)}
                    data-testid={`button-dismiss-${alert.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
          {alerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>ไม่มีการแจ้งเตือน</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
