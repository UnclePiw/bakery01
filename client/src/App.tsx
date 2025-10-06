import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BranchSelector } from "@/components/BranchSelector";
import { Bell, LayoutDashboard, Package, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useRealtimeUpdates, requestNotificationPermission } from "@/hooks/useRealtimeUpdates";
import { useQuery } from "@tanstack/react-query";
import type { Branch } from "@shared/schema";

import Dashboard from "@/pages/Dashboard";
import IngredientManagement from "@/pages/IngredientManagement";
import HourlyCheck from "@/pages/HourlyCheck";
import Alerts from "@/pages/Alerts";
import ForecastImport from "@/pages/ForecastImport";
import TodayForecast from "@/pages/TodayForecast";
import NotFound from "@/pages/not-found";

function Router({ selectedBranchId }: { selectedBranchId: string }) {
  return (
    <Switch>
      <Route path="/">
        <Dashboard selectedBranchId={selectedBranchId} />
      </Route>
      <Route path="/today-forecast">
        <TodayForecast selectedBranchId={selectedBranchId} />
      </Route>
      <Route path="/ingredients">
        <IngredientManagement selectedBranchId={selectedBranchId} />
      </Route>
      <Route path="/hourly-check">
        <HourlyCheck selectedBranchId={selectedBranchId} />
      </Route>
      <Route path="/alerts">
        <Alerts selectedBranchId={selectedBranchId} />
      </Route>
      <Route path="/forecast-import">
        <ForecastImport />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/today-forecast", label: "พยากรณ์", icon: TrendingUp },
    { path: "/ingredients", label: "วัตถุดิบ", icon: Package },
    { path: "/hourly-check", label: "ตรวจนับ", icon: Clock },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="w-full flex-col h-auto py-2 gap-1"
                data-testid={`nav-${item.path}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DesktopNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/today-forecast", label: "พยากรณ์วันนี้", icon: TrendingUp },
    { path: "/ingredients", label: "จัดการวัตถุดิบ", icon: Package },
    { path: "/hourly-check", label: "ตรวจนับรายชั่วโมง", icon: Clock },
    { path: "/alerts", label: "การแจ้งเตือน", icon: AlertTriangle },
  ];

  return (
    <nav className="hidden md:flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="gap-2"
              data-testid={`nav-${item.path}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

function AppContent({ selectedBranch, setSelectedBranch, alertCount, mockBranches }: any) {
  useRealtimeUpdates(selectedBranch);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 bg-card border-b">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold hidden sm:block">ระบบจัดการเบเกอรี่</h1>
                  <h1 className="text-xl font-bold sm:hidden">เบเกอรี่</h1>
                  <BranchSelector
                    branches={mockBranches}
                    selectedBranchId={selectedBranch}
                    onSelect={setSelectedBranch}
                  />
                </div>
                <DesktopNav />
                <div className="flex items-center gap-2">
                  <Link href="/alerts">
                    <Button variant="ghost" size="icon" className="relative" data-testid="button-alerts">
                      <Bell className="h-5 w-5" />
                      {alertCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {alertCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
              <Router selectedBranchId={selectedBranch} />
            </main>
      <BottomNav />
    </div>
  );
}

function AppWithData() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [alertCount] = useState(3);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  if (isLoading || !selectedBranch) {
    return null;
  }

  return (
    <AppContent
      selectedBranch={selectedBranch}
      setSelectedBranch={setSelectedBranch}
      alertCount={alertCount}
      mockBranches={branches}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppWithData />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
