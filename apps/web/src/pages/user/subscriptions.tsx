import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import { isUnauthorizedError } from "../../lib/authUtils";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import Sidebar from "../../components/layout/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Pause, Play, Trash } from "lucide-react";
import type { SubscriptionData, ProductData } from "../../lib/types";

const subscriptionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  addressId: z.string().min(1, "Address is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  daysOfWeek: z.array(z.string()).min(1, "Select at least one day"),
  billingCycle: z.enum(["weekly", "monthly"]),
  paymentMode: z.enum(["prepaid", "postpaid"]),
  startDate: z.string().min(1, "Start date is required"),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export default function UserSubscriptions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      quantity: 1,
      daysOfWeek: [],
      billingCycle: "weekly",
      paymentMode: "prepaid",
      startDate: new Date().toISOString().split('T')[0],
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

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<SubscriptionData[]>({
    queryKey: ["/api/user/subscriptions"],
    retry: false,
  });

  const { data: products } = useQuery<ProductData[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: addresses } = useQuery<any[]>({
    queryKey: ["/api/user/addresses"],
    retry: false,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionForm) => {
      return await apiRequest("POST", "/api/user/subscriptions", {
        ...data,
        daysOfWeek: JSON.stringify(data.daysOfWeek),
        startDate: new Date(data.startDate).toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscriptions"] });
      setIsDialogOpen(false);
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
        description: "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionForm) => {
    createSubscriptionMutation.mutate(data);
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
              <h2 className="text-2xl font-bold text-foreground">Subscriptions</h2>
              <p className="text-muted-foreground mt-1">Manage your dairy product subscriptions</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-new-subscription">
                  <Plus className="mr-2 h-4 w-4" />
                  New Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Subscription</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product: any) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ₹{product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-address">
                                <SelectValue placeholder="Select an address" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {addresses?.map((address: any) => (
                                <SelectItem key={address.id} value={address.id}>
                                  {address.label || 'Address'} - {address.area}, {address.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-quantity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="daysOfWeek"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Delivery Days</FormLabel>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {daysOfWeek.map((day) => (
                              <FormField
                                key={day.id}
                                control={form.control}
                                name="daysOfWeek"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={day.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(day.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, day.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== day.id
                                                  )
                                                );
                                          }}
                                          data-testid={`checkbox-${day.id}`}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {day.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingCycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Cycle</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-billing-cycle">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-mode">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="prepaid">Prepaid</SelectItem>
                              <SelectItem value="postpaid">Postpaid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        disabled={createSubscriptionMutation.isPending}
                        className="flex-1"
                        data-testid="button-create-subscription"
                      >
                        {createSubscriptionMutation.isPending ? "Creating..." : "Create Subscription"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Subscriptions Content */}
        <div className="p-6 space-y-6">
          {subscriptionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !subscriptions || subscriptions.length === 0 ? (
            <Card data-testid="card-no-subscriptions">
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Subscriptions</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any subscriptions yet. Start with your first dairy delivery subscription.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-subscription">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {subscriptions.map((subscription: any) => (
                <Card key={subscription.id} data-testid={`subscription-card-${subscription.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img 
                          src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                          alt="Product" 
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">
                                {subscription.product?.name || 'Product'}
                              </h4>
                              <p className="text-muted-foreground mt-1">
                                {subscription.quantity} units per delivery
                              </p>
                            </div>
                            <Badge 
                              className={`${
                                subscription.status === 'active' ? 'status-delivered' :
                                subscription.status === 'paused' ? 'status-pending' :
                                'status-cancelled'
                              }`}
                              data-testid={`status-${subscription.id}`}
                            >
                              {subscription.status}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2 mb-3">
                            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                              {JSON.parse(subscription.daysOfWeek || '[]').join(', ') || 'Daily'}
                            </Badge>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                              {subscription.billingCycle} billing
                            </Badge>
                            <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                              {subscription.paymentMode}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Delivery Address:</p>
                              <p className="font-medium">
                                {subscription.address?.area}, {subscription.address?.city}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Started:</p>
                              <p className="font-medium">
                                {new Date(subscription.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <p className="text-2xl font-bold text-foreground">
                          ₹{subscription.product?.price || 0}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">per delivery</p>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-${subscription.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-pause-${subscription.id}`}>
                            {subscription.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" data-testid={`button-delete-${subscription.id}`}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
