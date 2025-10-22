import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/layout/sidebar";
import { Search, Filter, Eye, Truck, Package } from "lucide-react";

export default function UserOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items?.some((item: any) => 
                           item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="user" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Orders</h2>
              <p className="text-muted-foreground mt-1">Track your dairy product orders</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-orders"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Orders Content */}
        <div className="p-6 space-y-6">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !orders || orders.length === 0 ? (
            <Card data-testid="card-no-orders">
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any orders yet. Browse products to get started.
                  </p>
                  <Button data-testid="button-browse-products">
                    Browse Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card data-testid="card-no-filtered-orders">
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                  <p className="text-muted-foreground">
                    No orders match your current search criteria.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredOrders.map((order: any) => (
                <Card key={order.id} data-testid={`order-card-${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-mono text-lg font-semibold">#{order.id.slice(-8)}</h4>
                          <Badge className={`status-${order.status.replace('_', '-')}`} data-testid={`status-${order.id}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-muted-foreground">
                            Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">₹{parseFloat(order.total).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{order.items?.length || 0} items</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg" data-testid={`order-item-${index}`}>
                          <img 
                            src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" 
                            alt={item.product?.name || 'Product'} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">{item.product?.name || 'Product'}</h5>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" data-testid={`button-view-${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {order.status === 'in_transit' && (
                        <Button variant="outline" size="sm" data-testid={`button-track-${order.id}`}>
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" data-testid={`button-reorder-${order.id}`}>
                          <Package className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
