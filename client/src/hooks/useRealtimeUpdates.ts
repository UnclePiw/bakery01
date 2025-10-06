import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useRealtimeUpdates(branchId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      socket = io({ path: "/socket.io" });

      socket.on("connect", () => {
        console.log("WebSocket connected");
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });
    }

    if (socket && branchId) {
      socket.emit("join-branch", branchId);

      const handleStockUpdate = (data: any) => {
        console.log("Stock updated:", data);
        queryClient.invalidateQueries({ queryKey: ["/api/ingredients/stock", branchId] });
        queryClient.invalidateQueries({ queryKey: ["/api/ingredients/expiring", branchId] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats", branchId] });
      };

      const handleProductStockUpdate = (data: any) => {
        console.log("Product stock updated:", data);
        queryClient.invalidateQueries({ queryKey: ["/api/products/stock", branchId] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats", branchId] });
      };

      const handleHourlyCheckReminder = (data: any) => {
        console.log("Hourly check reminder:", data);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("เตือนตรวจนับรายชั่วโมง", {
            body: `ถึงเวลาตรวจนับสินค้า (${new Date().toLocaleTimeString("th-TH")})`,
            icon: "/icon.png",
          });
        }
      };

      socket.on("stock-updated", handleStockUpdate);
      socket.on("product-stock-updated", handleProductStockUpdate);
      socket.on("hourly-check-reminder", handleHourlyCheckReminder);

      return () => {
        socket?.off("stock-updated", handleStockUpdate);
        socket?.off("product-stock-updated", handleProductStockUpdate);
        socket?.off("hourly-check-reminder", handleHourlyCheckReminder);
      };
    }
  }, [branchId, queryClient]);

  return { socket };
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
}
