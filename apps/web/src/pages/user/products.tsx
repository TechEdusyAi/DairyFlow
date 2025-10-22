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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import Sidebar from "../../components/layout/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, ShoppingCart, Plus, Minus, Milk } from "lucide-react";
import type { ProductData } from "../../lib/types";

const orderSchema = z.object({
  addressId: z.string().min(1, "Delivery address is required"),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number()
  })).min(1, "Add at least one product to cart"),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function UserProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      addressId: "",
      items: [],
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

  const { data: products, isLoading: productsLoading } = useQuery<ProductData[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: addresses } = useQuery<any[]>({
    queryKey: ["/api/user/addresses"],
    retry: false,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      return await apiRequest("POST", "/api/user/orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order placed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      setIsOrderDialogOpen(false);
      setCart({});
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
        description: "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalCartValue = () => {
    if (!products) return 0;
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find((p: any) => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add some products to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    const items = Object.entries(cart).map(([productId, quantity]) => {
      const product = products?.find((p: any) => p.id === productId);
      return {
        productId,
        quantity,
        price: product?.price || 0
      };
    });

    form.setValue("items", items);
    setIsOrderDialogOpen(true);
  };

  const onSubmit = (data: OrderForm) => {
    const total = getTotalCartValue();
    createOrderMutation.mutate({
      ...data,
      total
    } as any);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
                           (categoryFilter === "milk" && product.isMilk) ||
                           (categoryFilter === "other" && !product.isMilk);
    return matchesSearch && matchesCategory && product.status === 'active';
  }) || [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="user" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Products</h2>
              <p className="text-muted-foreground mt-1">Browse and order dairy products</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-products"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40" data-testid="select-category-filter">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="milk">Milk Products</SelectItem>
                  <SelectItem value="other">Other Dairy</SelectItem>
                </SelectContent>
              </Select>
              {getTotalCartItems() > 0 && (
                <Button 
                  onClick={handleCheckout}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  data-testid="button-checkout"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart ({getTotalCartItems()}) - ₹{getTotalCartValue().toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Products Content */}
        <div className="p-6 space-y-6">
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !products || products.length === 0 ? (
            <Card data-testid="card-no-products">
              <CardContent className="py-12">
                <div className="text-center">
                  <Milk className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
                  <p className="text-muted-foreground">
                    Products are currently unavailable. Please check back later.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card data-testid="card-no-filtered-products">
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground">
                    No products match your current search criteria.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: any) => (
                <Card key={product.id} className="overflow-hidden" data-testid={`product-card-${product.id}`}>
                  <div className="aspect-square relative">
                    <img 
                      src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    {product.isMilk && (
                      <Badge className="absolute top-2 left-2 bg-primary/10 text-primary">
                        <Milk className="h-3 w-3 mr-1" />
                        Milk Product
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.unit}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">₹{parseFloat(product.price).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">per {product.unit}</p>
                        </div>
                        
                        {cart[product.id] ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeFromCart(product.id)}
                              data-testid={`button-decrease-${product.id}`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium px-2" data-testid={`quantity-${product.id}`}>
                              {cart[product.id]}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addToCart(product.id)}
                              data-testid={`button-increase-${product.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => addToCart(product.id)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            data-testid={`button-add-to-cart-${product.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products?.find((p: any) => p.id === productId);
                    if (!product) return null;
                    return (
                      <div key={productId} className="flex justify-between text-sm">
                        <span>{product.name} × {quantity}</span>
                        <span>₹{(product.price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total</span>
                    <span>₹{getTotalCartValue().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="addressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-delivery-address">
                              <SelectValue placeholder="Select delivery address" />
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

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOrderDialogOpen(false)}
                      data-testid="button-cancel-order"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
