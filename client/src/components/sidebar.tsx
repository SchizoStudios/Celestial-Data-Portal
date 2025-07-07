import { 
  BarChart3, 
  CircleDot, 
  Calendar, 
  Share2, 
  Route, 
  Mic, 
  FileText, 
  List
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();

  // Fetch today's overview data
  const { data: ephemerisData } = useQuery({
    queryKey: ["/api/ephemeris", { date: new Date().toISOString().split('T')[0] }],
  });

  const sidebarItems = [
    { href: "/dashboard", icon: BarChart3, label: "Dashboard", active: location === "/" || location === "/dashboard" },
    { href: "/natal-charts", icon: CircleDot, label: "Natal Charts", active: location === "/natal-charts" },
    { href: "/ephemeris", icon: Calendar, label: "Ephemeris Data", active: location === "/ephemeris" },
    { href: "/aspect-monitor", icon: Share2, label: "Aspect Monitor", active: location === "/aspect-monitor" },
    { href: "/transits", icon: Route, label: "Transits", active: location === "/transits" },
  ];

  const adminItems = [
    { href: "/admin-podcast", icon: Mic, label: "Podcast Generator", active: location === "/admin-podcast" },
    { href: "/admin-templates", icon: FileText, label: "Templates", active: location === "/admin-templates" },
    { href: "/admin-batch", icon: List, label: "Batch Processing", active: location === "/admin-batch" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-nebula-gray shadow-sm h-screen sticky top-16 overflow-y-auto">
      <div className="p-6">
        {/* Quick Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Today's Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Moon Phase</span>
              <span className="font-medium">
                {ephemerisData?.lunarData?.phase || "Loading..."}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Active Aspects</span>
              <span className="font-medium text-stellar-amber">7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sunrise</span>
              <span className="font-medium">
                {ephemerisData?.solarData?.sunrise || "Loading..."}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sunset</span>
              <span className="font-medium">
                {ephemerisData?.solarData?.sunset || "Loading..."}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? "bg-celestial-blue text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          
          {/* Admin Section */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ADMIN TOOLS</p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? "bg-stellar-amber text-white"
                      : "text-stellar-amber hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
