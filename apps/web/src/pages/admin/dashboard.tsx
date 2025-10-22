import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RevenueChart from "@/components/charts/revenue-chart";
import Sidebar from "@/components/layout/sidebar";
import { IndianRupee, Users, CalendarCheck, Truck, TrendingUp, Package, ShieldCheck, Download, Route, Clock, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
              <p className="text-muted-foreground mt-1">Comprehensive business overview and management</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-optimize-routes">
                <Route className="mr-2 h-4 w-4" />
                Optimize Routes
              </Button>
              <Button variant="outline" data-testid="button-export-data">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-metric-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">
                      {analyticsLoading ? '...' : formatCurrency(analytics?.totalRevenue || 0)}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      12% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <IndianRupee className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-metric-customers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Customers</p>
                    <p className="text-3xl font-bold mt-2">
                      {analyticsLoading ? '...' : (analytics?.activeCustomers || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      8% growth
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-metric-subscriptions">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                    <p className="text-3xl font-bold mt-2">
                      {analyticsLoading ? '...' : (analytics?.totalSubscriptions || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      15% increase
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <CalendarCheck className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-metric-deliveries">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Deliveries</p>
                    <p className="text-3xl font-bold mt-2">
                      {analyticsLoading ? '...' : analytics?.todayDeliveries || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analyticsLoading ? '...' : analytics?.completedDeliveries || 0} completed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Truck className="text-muted-foreground text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card data-testid="card-revenue-chart">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <p className="text-sm text-muted-foreground">Last 7 days performance</p>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            {/* Subscription Growth */}
            <Card data-testid="card-subscription-chart">
              <CardHeader>
                <CardTitle>Subscription Growth</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly new subscriptions</p>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  <div className="flex-1 bg-secondary/20 hover:bg-secondary/30 transition-colors rounded-t-lg" style={{ height: '35%' }}></div>
                  <div className="flex-1 bg-secondary/20 hover:bg-secondary/30 transition-colors rounded-t-lg" style={{ height: '48%' }}></div>
                  <div className="flex-1 bg-secondary/20 hover:bg-secondary/30 transition-colors rounded-t-lg" style={{ height: '52%' }}></div>
                  <div className="flex-1 bg-secondary/20 hover:bg-secondary/30 transition-colors rounded-t-lg" style={{ height: '65%' }}></div>
                  <div className="flex-1 bg-secondary/20 hover:bg-secondary/30 transition-colors rounded-t-lg" style={{ height: '72%' }}></div>
                  <div className="flex-1 bg-secondary hover:bg-secondary/90 transition-colors rounded-t-lg" style={{ height: '88%' }}></div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Overview */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16 flex flex-col gap-2" data-testid="button-manage-products">
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Manage Products</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" data-testid="button-view-orders">
                    <Truck className="h-6 w-6" />
                    <span className="text-sm">View Orders</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" data-testid="button-manage-agents">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Manage Agents</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" data-testid="button-view-customers">
                    <ShieldCheck className="h-6 w-6" />
                    <span className="text-sm">View Customers</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card data-testid="card-system-status">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Agents</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium">12 Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Routes Optimized</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">Today</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">System Health</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                  <span className="text-sm font-medium">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card data-testid="card-performance-metrics">
            <CardHeader>
              <CardTitle>Delivery Performance Metrics</CardTitle>
              <p className="text-sm text-muted-foreground">Key performance indicators for delivery operations</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">28 mins</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Target: 30m</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    <CheckCircle className="h-4 w-4 text-secondary" />
                  </div>
                  <p className="text-2xl font-bold text-secondary">94.5%</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-secondary rounded-full h-2" style={{ width: '94.5%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Target: 90%</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                    <div className="flex items-center">
                      <span className="text-accent text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-accent">4.8/5.0</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-accent rounded-full h-2" style={{ width: '96%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Target: 4.5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
