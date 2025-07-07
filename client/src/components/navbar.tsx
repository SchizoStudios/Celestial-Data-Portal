import { Bell, Moon, Sun, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", active: location === "/" || location === "/dashboard" },
    { href: "/natal-charts", label: "Natal Charts", active: location === "/natal-charts" },
    { href: "/aspect-monitor", label: "Aspect Monitor", active: location === "/aspect-monitor" },
    { href: "/admin-podcast", label: "Admin", active: location === "/admin-podcast", admin: true },
  ];

  return (
    <header className="bg-white dark:bg-nebula-gray shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-celestial-blue rounded-lg flex items-center justify-center">
              <Satellite className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Celestial Data Portal</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Astronomical Intelligence Platform</p>
            </div>
          </Link>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pb-1 font-medium transition-colors ${
                  item.active
                    ? "text-celestial-blue border-b-2 border-celestial-blue"
                    : item.admin
                    ? "text-stellar-amber hover:text-yellow-600"
                    : "text-gray-600 dark:text-gray-300 hover:text-celestial-blue"
                }`}
              >
                {item.admin && <span className="mr-1">⚙</span>}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:block text-sm font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
