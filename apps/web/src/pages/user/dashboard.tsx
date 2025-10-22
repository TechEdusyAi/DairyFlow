import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/sidebar";
import { CalendarCheck, Truck, IndianRupee, Wallet, Plus } from "lucide-react";

export default function UserDashboard() {
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

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/user/subscriptions"],
    retry: false,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    retry: false,
  });

  const { data: addresses } = useQuery({
    queryKey: ["/api/user/addresses"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter((sub: any) => sub.status === 'active') || [];
  const recentOrders = orders?.slice(0, 3) || [];
  const pendingDeliveries = 5; // Mock data - would come from API
  const monthlySpend = 1240; // Mock data
  const prepaidBalance = 850; // Mock data

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="user" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.firstName || 'User'}!
              </h2>
              <p className="text-muted-foreground mt-1">Manage your dairy deliveries and subscriptions</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-new-order">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-stat-subscriptions">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                    <p className="text-3xl font-bold mt-2">{activeSubscriptions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CalendarCheck className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-deliveries">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Deliveries</p>
                    <p className="text-3xl font-bold mt-2">{pendingDeliveries}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Truck className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-spending">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-3xl font-bold mt-2">₹{monthlySpend}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <IndianRupee className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-balance">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prepaid Balance</p>
                    <p className="text-3xl font-bold mt-2">₹{prepaidBalance}</p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Wallet className="text-muted-foreground text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Subscriptions */}
          <Card data-testid="card-subscriptions">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Subscriptions</CardTitle>
                <Button variant="link" className="text-sm text-primary" data-testid="button-view-all-subscriptions">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : activeSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active subscriptions</p>
                  <Button className="mt-4" data-testid="button-create-subscription">
                    Create Your First Subscription
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeSubscriptions.map((subscription: any) => (
                    <div key={subscription.id} className="py-6 first:pt-0 last:pb-0" data-testid={`subscription-item-${subscription.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <img 
                            src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                            alt="Product" 
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-foreground">{subscription.product?.name || 'Product'}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{subscription.quantity} units per delivery</p>
                            <div className="flex gap-2 mt-2">
                              <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                                {JSON.parse(subscription.daysOfWeek || '[]').join(', ') || 'Daily'}
                              </Badge>
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                {subscription.billingCycle} Billing
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Payment: <span className="font-medium text-foreground">{subscription.paymentMode}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">₹{subscription.product?.price || 0}</p>
                          <p className="text-sm text-muted-foreground">per delivery</p>
                          <Button variant="link" className="mt-2 text-sm text-primary p-0 h-auto" data-testid={`button-manage-${subscription.id}`}>
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders & Upcoming Deliveries */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card data-testid="card-recent-orders">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent orders</p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentOrders.map((order: any) => (
                      <div key={order.id} className="py-4 first:pt-0 last:pb-0" data-testid={`order-item-${order.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(-8)}</p>
                          <Badge className={`status-${order.status}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{order.items?.length || 0} items</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="font-semibold">₹{order.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deliveries */}
            <Card data-testid="card-upcoming-deliveries">
              <CardHeader>
                <CardTitle>Upcoming Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  <div className="py-4 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Premium Fresh Milk - 1L</p>
                        <p className="text-sm text-muted-foreground">Tomorrow, 6:00 AM - 7:00 AM</p>
                      </div>
                      <Badge className="status-pending">Scheduled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Addresses */}
          <Card data-testid="card-addresses">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Delivery Addresses</CardTitle>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-address">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {addresses?.map((address: any) => (
                  <div key={address.id} className="border border-border rounded-lg p-4 relative" data-testid={`address-item-${address.id}`}>
                    {address.isDefault && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary/10 text-primary">Default</Badge>
                      </div>
                    )}
                    <div className={address.isDefault ? 'pr-20' : ''}>
                      <h4 className="font-semibold text-foreground mb-2">{address.label || 'Address'}</h4>
                      <p className="text-sm text-muted-foreground">{address.line1}</p>
                      <p className="text-sm text-muted-foreground">{address.area}, {address.city}</p>
                      <p className="text-sm text-muted-foreground">{address.state} {address.pincode}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="link" className="text-sm text-primary p-0 h-auto" data-testid={`button-edit-address-${address.id}`}>
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button variant="link" className="text-sm text-primary p-0 h-auto" data-testid={`button-default-address-${address.id}`}>
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
