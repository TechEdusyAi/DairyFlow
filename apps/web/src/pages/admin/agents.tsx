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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import Sidebar from "@/components/layout/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Filter, Plus, Edit, Truck, Users, CheckCircle, Clock, Eye, Phone, MapPin } from "lucide-react";

const agentDetailsSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  isAvailable: z.boolean().default(true),
});

type AgentDetailsForm = z.infer<typeof agentDetailsSchema>;

export default function AdminAgents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const form = useForm<AgentDetailsForm>({
    resolver: zodResolver(agentDetailsSchema),
    defaultValues: {
      vehicleType: "",
      vehicleNumber: "",
      licenseNumber: "",
      isAvailable: true,
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

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/admin/agents"],
    retry: false,
  });

  const createAgentDetailsMutation = useMutation({
    mutationFn: async (data: AgentDetailsForm) => {
      if (!selectedAgent) return;
      return await apiRequest("POST", `/api/admin/agents/${selectedAgent.id}/details`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      setIsAgentDialogOpen(false);
      setSelectedAgent(null);
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
        description: "Failed to update agent details",
        variant: "destructive",
      });
    },
  });

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    if (agent.agentDetails) {
      form.reset({
        vehicleType: agent.agentDetails.vehicleType || "",
        vehicleNumber: agent.agentDetails.vehicleNumber || "",
        licenseNumber: agent.agentDetails.licenseNumber || "",
        isAvailable: agent.agentDetails.isAvailable ?? true,
      });
    } else {
      form.reset();
    }
    setIsAgentDialogOpen(true);
  };

  const onSubmit = (data: AgentDetailsForm) => {
    createAgentDetailsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredAgents = agents?.filter((agent: any) => {
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "available" && agent.agentDetails?.isAvailable) ||
                         (statusFilter === "busy" && !agent.agentDetails?.isAvailable) ||
                         (statusFilter === "active" && agent.isActive) ||
                         (statusFilter === "inactive" && !agent.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Delivery Agents</h2>
              <p className="text-muted-foreground mt-1">Manage delivery agents and their details</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-agents"
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Agent Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-agents">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Agents</p>
                    <p className="text-3xl font-bold mt-2">{agents?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-active-agents">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Agents</p>
                    <p className="text-3xl font-bold mt-2 text-secondary">
                      {agents?.filter((a: any) => a.isActive)?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-available-agents">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-3xl font-bold mt-2 text-accent">
                      {agents?.filter((a: any) => a.agentDetails?.isAvailable)?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Truck className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-busy-agents">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On Delivery</p>
                    <p className="text-3xl font-bold mt-2">
                      {agents?.filter((a: any) => a.agentDetails && !a.agentDetails.isAvailable)?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Clock className="text-muted-foreground text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agents List */}
          <Card data-testid="card-agents-list">
            <CardHeader>
              <CardTitle>Agent List</CardTitle>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : !agents || agents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Agents</h3>
                  <p className="text-muted-foreground">
                    No delivery agents have been registered yet.
                  </p>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
                  <p className="text-muted-foreground">
                    No agents match your current search criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAgents.map((agent: any) => (
                    <div 
                      key={agent.id} 
                      className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                      data-testid={`agent-card-${agent.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <img 
                            src={agent.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                            alt={`${agent.firstName} ${agent.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg text-foreground">
                                {agent.firstName} {agent.lastName}
                              </h4>
                              <div className="flex gap-2">
                                <Badge className={agent.isActive ? "status-delivered" : "status-cancelled"}>
                                  {agent.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {agent.agentDetails && (
                                  <Badge className={agent.agentDetails.isAvailable ? "status-delivered" : "status-pending"}>
                                    {agent.agentDetails.isAvailable ? "Available" : "On Delivery"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{agent.phone || "Not provided"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>ID: {agent.id.slice(-8)}</span>
                              </div>
                              {agent.agentDetails?.vehicleNumber && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Truck className="h-4 w-4" />
                                  <span>{agent.agentDetails.vehicleNumber}</span>
                                </div>
                              )}
                            </div>
                            
                            {agent.agentDetails ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Vehicle Type</p>
                                  <p className="font-semibold text-foreground">{agent.agentDetails.vehicleType}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">License</p>
                                  <p className="font-semibold text-foreground">{agent.agentDetails.licenseNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Member Since</p>
                                  <p className="font-semibold text-foreground">
                                    {new Date(agent.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Vehicle details not provided</p>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleEditAgent(agent)}
                                  data-testid={`button-add-details-${agent.id}`}
                                >
                                  Add Vehicle Details
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" data-testid={`button-view-${agent.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAgent(agent)}
                            data-testid={`button-edit-${agent.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-route-${agent.id}`}>
                            <MapPin className="h-4 w-4" />
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

        {/* Agent Details Dialog */}
        <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedAgent?.agentDetails ? 'Edit Agent Details' : 'Add Agent Details'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle-type">
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="scooter">Scooter</SelectItem>
                          <SelectItem value="auto">Auto Rickshaw</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="TN-01-AB-1234" {...field} data-testid="input-vehicle-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="DL-1234567890123" {...field} data-testid="input-license-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available for Delivery</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Agent is currently available for new deliveries
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-available"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createAgentDetailsMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-agent-details"
                  >
                    {createAgentDetailsMutation.isPending ? "Saving..." : "Save Details"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAgentDialogOpen(false)}
                    data-testid="button-cancel-agent-details"
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
