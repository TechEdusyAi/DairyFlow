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
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import Sidebar from "../../components/layout/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Filter, Plus, Edit, Package, Warehouse, Eye } from "lucide-react";
import type { ProductData } from "../../lib/types";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  isMilk: z.boolean().default(false),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      unit: "",
      price: 0,
      isMilk: false,
      status: "active",
      description: "",
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
    queryKey: ["/api/admin/products"],
    retry: false,
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/inventory"],
    retry: false,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      if (editingProduct) {
        return await apiRequest("PATCH", `/api/admin/products/${editingProduct.id}`, data);
      } else {
        return await apiRequest("POST", "/api/admin/products", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingProduct ? "Product updated successfully" : "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
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
        description: "Failed to save product",
        variant: "destructive",
      });
    },
  });

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name || "",
      unit: product.unit || "",
      price: parseFloat(product.price) || 0,
      isMilk: product.isMilk || false,
      status: product.status || "active",
      description: product.description || "",
    });
    setIsProductDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset();
    setIsProductDialogOpen(true);
  };

  const onSubmit = (data: ProductForm) => {
    createProductMutation.mutate(data);
  };

  const getInventoryForProduct = (productId: string) => {
    if (!inventory) return null;
    return inventory.find((inv: any) => inv.productId === productId);
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
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Products</h2>
              <p className="text-muted-foreground mt-1">Manage dairy products and inventory</p>
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
                <SelectTrigger className="w-32" data-testid="select-category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="milk">Milk</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleNewProduct}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-add-product"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-products">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-3xl font-bold mt-2">{products?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-active-products">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Products</p>
                    <p className="text-3xl font-bold mt-2 text-secondary">
                      {products?.filter((p: any) => p.status === 'active')?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Package className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-milk-products">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Milk Products</p>
                    <p className="text-3xl font-bold mt-2 text-accent">
                      {products?.filter((p: any) => p.isMilk)?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Package className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-low-stock">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-3xl font-bold mt-2 text-destructive">
                      {inventory?.filter((inv: any) => inv.quantity < 50)?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Warehouse className="text-destructive text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card data-testid="card-products-table">
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by adding your first dairy product.
                  </p>
                  <Button onClick={handleNewProduct} data-testid="button-add-first-product">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground">
                    No products match your current search criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map((product: any) => {
                        const productInventory = getInventoryForProduct(product.id);
                        const stockQuantity = productInventory?.quantity || 0;
                        const isLowStock = stockQuantity < 50;
                        
                        return (
                          <tr key={product.id} className="hover:bg-muted/50" data-testid={`product-row-${product.id}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" 
                                  alt="Product" 
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <div className="flex gap-2 mt-1">
                                    {product.isMilk && (
                                      <Badge className="bg-primary/10 text-primary text-xs">Milk</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{product.unit}</td>
                            <td className="px-6 py-4 text-sm font-medium">₹{parseFloat(product.price).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`font-medium ${isLowStock ? 'text-destructive' : 'text-secondary'}`}>
                                {stockQuantity}
                              </span> units
                              {isLowStock && <Badge className="ml-2 status-cancelled">Low Stock</Badge>}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`status-${product.status === 'active' ? 'delivered' : 'cancelled'}`}>
                                {product.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  data-testid={`button-edit-${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" data-testid={`button-inventory-${product.id}`}>
                                  <Warehouse className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" data-testid={`button-view-${product.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium Fresh Milk" {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="1 Liter, 500g, etc." {...field} data-testid="input-product-unit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} data-testid="input-product-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Product description..." {...field} data-testid="textarea-product-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isMilk"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Milk Product</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Is this a milk product?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-is-milk"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-product-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-product"
                  >
                    {createProductMutation.isPending ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductDialogOpen(false)}
                    data-testid="button-cancel-product"
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
