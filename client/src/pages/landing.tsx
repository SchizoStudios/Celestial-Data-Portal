import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars, Calendar, TrendingUp, Users, Zap, Moon, Sun } from "lucide-react";

export default function Landing() {
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
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-stellar-amber hover:bg-stellar-amber/90 text-white"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-4 w-4 mr-1" />
            Powered by AI & Real Astronomical Data
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Complete
            <span className="text-stellar-amber block">Astrology Platform</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Generate natal charts, track planetary transits, monitor aspects, and receive 
            AI-powered interpretations all in one comprehensive astronomical portal.
          </p>
          
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-stellar-amber hover:bg-stellar-amber/90 text-white px-8 py-3 text-lg"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need for Astrological Analysis
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Natal Charts */}
            <Card className="border-2 hover:border-stellar-amber/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-stellar-amber/10 rounded-lg">
                    <Stars className="h-6 w-6 text-stellar-amber" />
                  </div>
                  <CardTitle>Natal Charts</CardTitle>
                </div>
                <CardDescription>
                  Generate detailed birth charts with accurate planetary positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Precise planetary calculations</li>
                  <li>• Multiple house systems</li>
                  <li>• Comprehensive aspect analysis</li>
                  <li>• AI-powered interpretations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Transit Tracking */}
            <Card className="border-2 hover:border-stellar-amber/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-stellar-amber/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-stellar-amber" />
                  </div>
                  <CardTitle>Transit Tracking</CardTitle>
                </div>
                <CardDescription>
                  Monitor current planetary movements and their influences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Real-time ephemeris data</li>
                  <li>• Transit-to-natal comparisons</li>
                  <li>• Aspect monitoring alerts</li>
                  <li>• Daily cosmic weather</li>
                </ul>
              </CardContent>
            </Card>

            {/* Content Generation */}
            <Card className="border-2 hover:border-stellar-amber/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-stellar-amber/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-stellar-amber" />
                  </div>
                  <CardTitle>Content Creation</CardTitle>
                </div>
                <CardDescription>
                  Generate astrological content and insights automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Automated podcast scripts</li>
                  <li>• Custom templates</li>
                  <li>• Event analysis</li>
                  <li>• Educational content</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-stellar-amber mb-2">26+</div>
              <div className="text-gray-600 dark:text-gray-400">Aspect Types</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-stellar-amber mb-2">14</div>
              <div className="text-gray-600 dark:text-gray-400">Celestial Bodies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-stellar-amber mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Data Updates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-stellar-amber mb-2">AI</div>
              <div className="text-gray-600 dark:text-gray-400">Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Explore the Cosmos?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of astrology enthusiasts using our platform for 
            accurate calculations and meaningful insights.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-stellar-amber hover:bg-stellar-amber/90 text-white px-8 py-3 text-lg"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stars className="h-5 w-5 text-stellar-amber" />
            <span className="font-semibold">Astro Portal</span>
          </div>
          <p className="text-sm">
            Professional astrology platform with real astronomical data and AI insights.
          </p>
        </div>
      </footer>
    </div>
  );
}