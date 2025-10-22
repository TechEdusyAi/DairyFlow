import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import { isUnauthorizedError } from "../../lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Sidebar from "../../components/layout/sidebar";
import { Calendar, MapPin, Clock, CheckCircle, Truck, Route } from "lucide-react";
import type { RouteData } from "../../lib/types";

export default function AgentDashboard() {
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

  const { data: todayRoute, isLoading: routeLoading } = useQuery<RouteData | undefined>({
    queryKey: ["/api/agent/route", { date: new Date().toISOString().split('T')[0] }],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalStops = todayRoute?.stops?.length || 0;
  const completedStops = todayRoute?.stops?.filter((stop: any) => stop.status === 'delivered')?.length || 0;
  const remainingStops = totalStops - completedStops;
  const completionPercentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="agent" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Agent Dashboard</h2>
              <p className="text-muted-foreground mt-1">
                <Calendar className="inline h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-start-route">
                <Route className="mr-2 h-4 w-4" />
                View Today's Route
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-stat-total-stops">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Stops</p>
                    <p className="text-3xl font-bold mt-2">{totalStops}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-completed">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold mt-2 text-secondary">{completedStops}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-remaining">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-3xl font-bold mt-2 text-accent">{remainingStops}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-progress">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-3xl font-bold mt-2">{completionPercentage}%</p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Truck className="text-muted-foreground text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {totalStops > 0 && (
            <Card data-testid="card-progress-bar">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Today's Progress</h3>
                  <span className="text-sm text-muted-foreground">{completedStops} of {totalStops} deliveries</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div 
                    className="bg-secondary rounded-full h-4 transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Overview */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Next Deliveries */}
            <Card data-testid="card-next-deliveries">
              <CardHeader>
                <CardTitle>Next Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {routeLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !todayRoute?.stops || todayRoute.stops.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No deliveries scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayRoute.stops
                      .filter((stop: any) => stop.status !== 'delivered')
                      .slice(0, 3)
                      .map((stop: any, index: number) => (
                        <div key={stop.id} className="flex items-start gap-4" data-testid={`next-delivery-${index}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-accent' : 'bg-muted text-muted-foreground'
                          }`}>
                            {stop.sequence}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-foreground">Customer #{stop.id.slice(-4)}</h5>
                              <Badge className={index === 0 ? "status-in-transit" : "status-pending"}>
                                {index === 0 ? 'Next Stop' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {stop.address?.line1}, {stop.address?.area}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Est. time: {stop.estimatedTime || 5} minutes
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card data-testid="card-todays-summary">
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Route className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="text-lg font-bold text-foreground">24.5 km</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <Clock className="h-6 w-6 text-secondary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="text-lg font-bold text-foreground">3h 15m</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Route started:</span>
                    <span className="text-sm font-medium">6:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current status:</span>
                    <Badge className="status-in-transit">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Est. completion:</span>
                    <span className="text-sm font-medium">11:30 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card data-testid="card-performance-metrics">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">On-Time Delivery</p>
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
                    <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">8.5 min</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Target: 10m</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Customer Rating</p>
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
