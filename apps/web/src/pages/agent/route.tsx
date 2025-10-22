import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import { isUnauthorizedError } from "../../lib/authUtils";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import DeliveryMap from "../../components/maps/delivery-map";

interface DeliveryStop {
  id: string;
  sequence: number;
  status: string;
  address?: {
    line1: string;
    area: string;
    city: string;
    latitude?: string;
    longitude?: string;
  };
}
import Sidebar from "../../components/layout/sidebar";
import { CheckCircle, Phone, Navigation, MapPin, Clock, Package } from "lucide-react";
import type { RouteData } from "../../lib/types";

export default function AgentRoute() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  const { data: route, isLoading: routeLoading } = useQuery<RouteData | undefined>({
    queryKey: ["/api/agent/route", { date: selectedDate }],
    retry: false,
  });

  const updateDeliveryStatusMutation = useMutation({
    mutationFn: async ({ deliveryId, status }: { deliveryId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/agent/delivery/${deliveryId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Delivery status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/route"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    },
  });

  const updateRouteStopMutation = useMutation({
    mutationFn: async ({ stopId, status }: { stopId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/agent/route-stop/${stopId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stop status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/route"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update stop status",
        variant: "destructive",
      });
    },
  });

  const handleMarkDelivered = (stop: any) => {
    if (stop.deliveryId) {
      updateDeliveryStatusMutation.mutate({ deliveryId: stop.deliveryId, status: 'delivered' });
    }
    updateRouteStopMutation.mutate({ stopId: stop.id, status: 'delivered' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalStops = route?.stops?.length || 0;
  const completedStops = route?.stops?.filter((stop: any) => stop.status === 'delivered')?.length || 0;
  const remainingStops = totalStops - completedStops;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="agent" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Delivery Route</h2>
              <p className="text-muted-foreground mt-1">Manage your daily delivery schedule</p>
            </div>
            <div className="flex gap-3 items-center">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
                data-testid="input-route-date"
              />
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-start-route">
                Start Route
              </Button>
            </div>
          </div>
        </header>

        {/* Route Content */}
        <div className="p-6 space-y-6">
          {/* Route Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-stops">
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
            
            <Card data-testid="card-completed-stops">
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
            
            <Card data-testid="card-remaining-stops">
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
            
            <Card data-testid="card-estimated-time">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Time</p>
                    <p className="text-3xl font-bold mt-2">2h 15m</p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Clock className="text-muted-foreground text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map View */}
          <Card data-testid="card-route-map">
            <CardContent className="p-0">
              <DeliveryMap
                stops={(route?.stops || []).map(stop => ({
                  id: stop.id,
                  sequence: stop.sequence,
                  status: stop.status,
                  address: stop.address ? {
                    line1: stop.address.line1,
                    area: stop.address.area || '',
                    city: stop.address.city,
                    latitude: stop.address.latitude?.toString(),
                    longitude: stop.address.longitude?.toString(),
                  } : undefined
                }))}
                depot={{
                  latitude: parseFloat(route?.depotLatitude || '11.0168'),
                  longitude: parseFloat(route?.depotLongitude || '76.9558')
                }}
              />
            </CardContent>
          </Card>

          {/* Delivery Stops */}
          <Card data-testid="card-delivery-stops">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Delivery Stops</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-secondary/10 text-secondary">
                    All ({totalStops})
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-filter-pending">
                    Pending ({remainingStops})
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-filter-completed">
                    Completed ({completedStops})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {routeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : !route?.stops || route.stops.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Route Assigned</h3>
                  <p className="text-muted-foreground">
                    No delivery route has been assigned for {new Date(selectedDate).toLocaleDateString()}.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {route.stops.map((stop: any, index: number) => {
                    const isNext = stop.status === 'pending' && 
                                 route.stops.slice(0, index).every((s: any) => s.status === 'delivered');
                    
                    return (
                      <div 
                        key={stop.id} 
                        className={`p-6 hover:bg-muted/50 transition-colors ${isNext ? 'bg-primary/5' : ''}`}
                        data-testid={`delivery-stop-${stop.id}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 ${
                            stop.status === 'delivered' ? 'bg-secondary' :
                            isNext ? 'bg-accent ring-4 ring-accent/20' : 'bg-muted text-muted-foreground'
                          }`}>
                            {stop.sequence}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground">Customer #{stop.id.slice(-4)}</h4>
                                <p className="text-sm text-muted-foreground">{stop.address?.line1}, {stop.address?.area}</p>
                                <p className="text-sm text-muted-foreground">Ph: +91 98765 43210</p>
                              </div>
                              <Badge className={`status-${stop.status.replace('_', '-')}`} data-testid={`status-${stop.id}`}>
                                {stop.status === 'delivered' ? 'Delivered' : 
                                 isNext ? 'Next Stop' : 'Pending'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span>Milk - 1L</span>
                              </div>
                              {stop.status === 'delivered' && stop.deliveredAt ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Delivered at {new Date(stop.deliveredAt).toLocaleTimeString()}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Navigation className="h-4 w-4" />
                                  <span>1.2 km away</span>
                                </div>
                              )}
                            </div>

                            {stop.status !== 'delivered' && (
                              <div className="flex gap-2 mt-4">
                                <Button 
                                  size="sm"
                                  onClick={() => handleMarkDelivered(stop)}
                                  disabled={updateRouteStopMutation.isPending}
                                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                  data-testid={`button-mark-delivered-${stop.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {updateRouteStopMutation.isPending ? "Updating..." : "Mark Delivered"}
                                </Button>
                                <Button variant="outline" size="sm" data-testid={`button-call-customer-${stop.id}`}>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call Customer
                                </Button>
                                <Button variant="outline" size="sm" data-testid={`button-navigate-${stop.id}`}>
                                  <Navigation className="h-4 w-4 mr-2" />
                                  Navigate
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
