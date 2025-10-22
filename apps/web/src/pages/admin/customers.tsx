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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/sidebar";
import { Search, Filter, Users, Eye, Edit, MoreHorizontal, MapPin, Phone, Mail, Package, IndianRupee } from "lucide-react";

export default function AdminCustomers() {
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

  // Mock data for customers since we don't have a specific API endpoint
  // In a real application, this would come from an API
  const mockCustomers = [
    {
      id: "1",
      firstName: "Rajesh",
      lastName: "Kumar",
      email: "rajesh@example.com",
      phone: "+91 98765 43210",
      isActive: true,
      createdAt: "2024-01-15T00:00:00Z",
      totalOrders: 45,
      totalSpent: 12500,
      lastOrderDate: "2024-03-10T00:00:00Z",
      subscriptions: 2,
      addresses: [
        {
          id: "addr1",
          label: "Home",
          line1: "123, Gandhi Nagar",
          area: "RS Puram",
          city: "Coimbatore",
          state: "Tamil Nadu",
          pincode: "641002",
          isDefault: true
        }
      ]
    },
    {
      id: "2",
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya@example.com",
      phone: "+91 98888 12345",
      isActive: true,
      createdAt: "2024-02-01T00:00:00Z",
      totalOrders: 23,
      totalSpent: 7800,
      lastOrderDate: "2024-03-12T00:00:00Z",
      subscriptions: 1,
      addresses: [
        {
          id: "addr2",
          label: "Home",
          line1: "45, Avinashi Road",
          area: "Near Park",
          city: "Coimbatore",
          state: "Tamil Nadu",
          pincode: "641018",
          isDefault: true
        }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && customer.isActive) ||
                         (statusFilter === "inactive" && !customer.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Customers</h2>
              <p className="text-muted-foreground mt-1">Manage customer accounts and information</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-customers"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-customers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-3xl font-bold mt-2">{mockCustomers.length.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-active-customers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Customers</p>
                    <p className="text-3xl font-bold mt-2 text-secondary">
                      {mockCustomers.filter(c => c.isActive).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-total-orders">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-bold mt-2">
                      {mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Package className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-total-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">
                      ₹{mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <IndianRupee className="text-muted-foreground text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customers List */}
          <Card data-testid="card-customers-list">
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "No customers match your current search criteria."
                      : "No customers have registered yet."
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredCustomers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                      data-testid={`customer-card-${customer.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <img 
                            src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&seed=${customer.id}`}
                            alt={`${customer.firstName} ${customer.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg text-foreground">
                                {customer.firstName} {customer.lastName}
                              </h4>
                              <Badge className={customer.isActive ? "status-delivered" : "status-cancelled"}>
                                {customer.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{customer.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{customer.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{customer.addresses[0]?.city}, {customer.addresses[0]?.state}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Total Orders</p>
                                <p className="font-semibold text-foreground">{customer.totalOrders}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Spent</p>
                                <p className="font-semibold text-foreground">₹{customer.totalSpent.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Subscriptions</p>
                                <p className="font-semibold text-foreground">{customer.subscriptions}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Last Order</p>
                                <p className="font-semibold text-foreground">
                                  {new Date(customer.lastOrderDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" data-testid={`button-view-${customer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${customer.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-more-${customer.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
