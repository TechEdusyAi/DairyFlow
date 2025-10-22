import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";

// User pages
import UserDashboard from "@/pages/user/dashboard";
import UserSubscriptions from "@/pages/user/subscriptions";
import UserOrders from "@/pages/user/orders";
import UserProducts from "@/pages/user/products";
import UserProfile from "@/pages/user/profile";

// Agent pages
import AgentDashboard from "@/pages/agent/dashboard";
import AgentRoute from "@/pages/agent/route";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCustomers from "@/pages/admin/customers";
import AdminProducts from "@/pages/admin/products";
import AdminAgents from "@/pages/admin/agents";
import AdminOrders from "@/pages/admin/orders";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Role-based routing
  const userRole = user?.role || 'user';

  return (
    <Switch>
      {userRole === 'user' && (
        <>
          <Route path="/" component={UserDashboard} />
          <Route path="/subscriptions" component={UserSubscriptions} />
          <Route path="/orders" component={UserOrders} />
          <Route path="/products" component={UserProducts} />
          <Route path="/profile" component={UserProfile} />
        </>
      )}
      
      {userRole === 'agent' && (
        <>
          <Route path="/" component={AgentDashboard} />
          <Route path="/route" component={AgentRoute} />
        </>
      )}
      
      {userRole === 'admin' && (
        <>
          <Route path="/" component={AdminDashboard} />
          <Route path="/customers" component={AdminCustomers} />
          <Route path="/products" component={AdminProducts} />
          <Route path="/agents" component={AdminAgents} />
          <Route path="/orders" component={AdminOrders} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
