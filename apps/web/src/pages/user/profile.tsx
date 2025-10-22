import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash, MapPin, User, CreditCard, FileText } from "lucide-react";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  line1: z.string().min(1, "Address line is required"),
  area: z.string().min(1, "Area is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required").max(6, "Valid pincode is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function UserProfile() {
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      line1: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: "",
      isDefault: false,
    },
  });

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

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["/api/user/addresses"],
    retry: false,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/user/invoices"],
    retry: false,
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressForm) => {
      if (editingAddress) {
        return await apiRequest("PATCH", `/api/user/addresses/${editingAddress.id}`, data);
      } else {
        return await apiRequest("POST", "/api/user/addresses", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingAddress ? "Address updated successfully" : "Address added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
      setIsAddressDialogOpen(false);
      setEditingAddress(null);
      form.reset();
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
        description: "Failed to save address",
        variant: "destructive",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      return await apiRequest("DELETE", `/api/user/addresses/${addressId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/addresses"] });
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
        description: "Failed to delete address",
        variant: "destructive",
      });
    },
  });

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    form.reset({
      label: address.label || "",
      line1: address.line1 || "",
      area: address.area || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      latitude: address.latitude?.toString() || "",
      longitude: address.longitude?.toString() || "",
      isDefault: address.isDefault || false,
    });
    setIsAddressDialogOpen(true);
  };

  const handleNewAddress = () => {
    setEditingAddress(null);
    form.reset();
    setIsAddressDialogOpen(true);
  };

  const onSubmit = (data: AddressForm) => {
    createAddressMutation.mutate({
      ...data,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="user" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Profile</h2>
              <p className="text-muted-foreground mt-1">Manage your account settings and addresses</p>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" data-testid="tab-personal">
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="addresses" data-testid="tab-addresses">
                <MapPin className="h-4 w-4 mr-2" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="billing" data-testid="tab-billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="invoices" data-testid="tab-invoices">
                <FileText className="h-4 w-4 mr-2" />
                Invoices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card data-testid="card-personal-info">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="text-foreground font-medium mt-1">{user?.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="text-foreground font-medium mt-1">{user?.lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground font-medium mt-1">{user?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground font-medium mt-1">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                      <div className="mt-1">
                        <Badge className={user?.isActive ? "status-delivered" : "status-cancelled"}>
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <p className="text-foreground font-medium mt-1">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6">
              <Card data-testid="card-addresses">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Delivery Addresses</CardTitle>
                    <Button 
                      onClick={handleNewAddress}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="button-add-address"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : !addresses || addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No addresses added yet</p>
                      <Button onClick={handleNewAddress} data-testid="button-add-first-address">
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {addresses.map((address: any) => (
                        <div 
                          key={address.id} 
                          className="border border-border rounded-lg p-4 relative"
                          data-testid={`address-card-${address.id}`}
                        >
                          {address.isDefault && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-primary/10 text-primary">Default</Badge>
                            </div>
                          )}
                          <div className={address.isDefault ? 'pr-20' : ''}>
                            <h4 className="font-semibold text-foreground mb-2">{address.label}</h4>
                            <p className="text-sm text-muted-foreground">{address.line1}</p>
                            <p className="text-sm text-muted-foreground">{address.area}</p>
                            <p className="text-sm text-muted-foreground">{address.city}, {address.state}</p>
                            <p className="text-sm text-muted-foreground">PIN: {address.pincode}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                              data-testid={`button-edit-address-${address.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!address.isDefault && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteAddressMutation.mutate(address.id)}
                                className="text-destructive hover:bg-destructive/10"
                                data-testid={`button-delete-address-${address.id}`}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card data-testid="card-billing-info">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-secondary/10 rounded-lg">
                      <CreditCard className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Prepaid Balance</p>
                      <p className="text-2xl font-bold text-foreground">₹850</p>
                    </div>
                    <div className="text-center p-6 bg-primary/10 rounded-lg">
                      <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                      <p className="text-2xl font-bold text-foreground">₹240</p>
                    </div>
                    <div className="text-center p-6 bg-accent/10 rounded-lg">
                      <User className="h-8 w-8 text-accent mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">This Month Spend</p>
                      <p className="text-2xl font-bold text-foreground">₹1,240</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <Card data-testid="card-invoices">
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : !invoices || invoices.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No invoices available</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {invoices.map((invoice: any) => (
                        <div key={invoice.id} className="py-4 first:pt-0 last:pb-0" data-testid={`invoice-item-${invoice.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-mono text-sm font-medium">#{invoice.id.slice(-8)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(invoice.createdAt).toLocaleDateString()} - 
                                {new Date(invoice.periodStart).toLocaleDateString()} to {new Date(invoice.periodEnd).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">₹{parseFloat(invoice.amount).toFixed(2)}</p>
                              <Badge className={`status-${invoice.status === 'paid' ? 'delivered' : invoice.status === 'pending' ? 'pending' : 'cancelled'}`}>
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Address Dialog */}
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Home, Office, etc." {...field} data-testid="input-address-label" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address, apartment, etc." {...field} data-testid="input-address-line1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Area/Locality" {...field} data-testid="input-address-area" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} data-testid="input-address-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} data-testid="input-address-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} data-testid="input-address-pincode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createAddressMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-address"
                  >
                    {createAddressMutation.isPending ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddressDialogOpen(false)}
                    data-testid="button-cancel-address"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
