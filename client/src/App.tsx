import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import NatalCharts from "@/pages/natal-charts";
import AspectMonitor from "@/pages/aspect-monitor";
import AdminPodcast from "@/pages/admin-podcast";
import AdminTemplates from "@/pages/admin-templates";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import NotFound from "@/pages/not-found";
import PWAInstaller from "@/components/pwa-installer";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/natal-charts" component={NatalCharts} />
          <Route path="/aspect-monitor" component={AspectMonitor} />
          <Route path="/ephemeris" component={Dashboard} />
          <Route path="/admin-podcast" component={AdminPodcast} />
          <Route path="/admin-templates" component={AdminTemplates} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
        <PWAInstaller />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (mode: boolean) => void }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return <Router />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-deep-space">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          <Router />
        </main>
      </div>
    </div>
  );
}

export default App;
