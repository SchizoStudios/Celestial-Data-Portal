import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars, Calendar, TrendingUp, LogOut, User } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Stars className="h-8 w-8 text-stellar-amber" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Astro Portal
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stellar-amber/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-stellar-amber" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.firstName && user?.lastName ? 
                  `${user.firstName} ${user.lastName}` : 
                  user?.email || 'User'
                }
              </span>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="border-stellar-amber text-stellar-amber hover:bg-stellar-amber hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {user?.firstName || 'Explorer'}! 
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your personal astrology command center awaits
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Dashboard */}
            <Link href="/dashboard">
              <Card className="border-2 hover:border-stellar-amber/50 transition-all cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-stellar-amber/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-stellar-amber" />
                    </div>
                    <CardTitle>Dashboard</CardTitle>
                  </div>
                  <CardDescription>
                    View current ephemeris data and transit information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Real-time Data</Badge>
                </CardContent>
              </Card>
            </Link>

            {/* Natal Charts */}
            <Link href="/natal-charts">
              <Card className="border-2 hover:border-stellar-amber/50 transition-all cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-stellar-amber/10 rounded-lg">
                      <Stars className="h-6 w-6 text-stellar-amber" />
                    </div>
                    <CardTitle>Natal Charts</CardTitle>
                  </div>
                  <CardDescription>
                    Create and manage birth charts with AI interpretations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">AI Powered</Badge>
                </CardContent>
              </Card>
            </Link>

            {/* Aspect Monitor */}
            <Link href="/aspect-monitor">
              <Card className="border-2 hover:border-stellar-amber/50 transition-all cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-stellar-amber/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-stellar-amber" />
                    </div>
                    <CardTitle>Aspect Monitor</CardTitle>
                  </div>
                  <CardDescription>
                    Track and monitor specific astrological aspects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Notifications</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Get started with your astrological analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">New to Astrology?</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Start by creating your first natal chart</li>
                    <li>• Explore the dashboard for current planetary positions</li>
                    <li>• Set up aspect monitors for important transits</li>
                  </ul>
                  <Link href="/natal-charts">
                    <Button size="sm" className="bg-stellar-amber hover:bg-stellar-amber/90 text-white">
                      Create First Chart
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Advanced Features</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Generate content with our podcast templates</li>
                    <li>• Compare transit positions with natal charts</li>
                    <li>• Access comprehensive aspect interpretations</li>
                  </ul>
                  <Link href="/admin-podcast">
                    <Button size="sm" variant="outline" className="border-stellar-amber text-stellar-amber hover:bg-stellar-amber hover:text-white">
                      Explore Templates
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}