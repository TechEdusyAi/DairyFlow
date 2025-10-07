import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  CalendarCheck, 
  ShoppingCart, 
  Package, 
  FileText, 
  User, 
  Route, 
  Clock, 
  ChartPie, 
  Users, 
  Truck, 
  Warehouse, 
  Shield,
  Milk,
  LogOut
} from "lucide-react";

interface SidebarProps {
  userRole: "user" | "agent" | "admin";
}

const navigation = {
  user: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Subscriptions", href: "/subscriptions", icon: CalendarCheck },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Products", href: "/products", icon: Package },
    { name: "Profile", href: "/profile", icon: User },
  ],
  agent: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Today's Route", href: "/route", icon: Route },
    { name: "History", href: "/history", icon: Clock },
    { name: "Profile", href: "/profile", icon: User },
  ],
  admin: [
    { name: "Dashboard", href: "/", icon: ChartPie },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Agents", href: "/agents", icon: Truck },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Inventory", href: "/inventory", icon: Warehouse },
    { name: "Analytics", href: "/analytics", icon: ChartPie },
  ],
};

const roleConfig = {
  user: {
    title: "DairyDirect",
    subtitle: "Fresh Delivery",
    icon: Milk,
    primaryColor: "bg-primary",
    iconColor: "text-primary-foreground",
  },
  agent: {
    title: "Agent Portal",
    subtitle: "Delivery Management",
    icon: Truck,
    primaryColor: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  admin: {
    title: "Admin Console",
    subtitle: "Management Portal",
    icon: Shield,
    primaryColor: "bg-destructive",
    iconColor: "text-destructive-foreground",
  },
};

export default function Sidebar({ userRole }: SidebarProps) {
  const [location] = useLocation();
  const config = roleConfig[userRole];
  const navItems = navigation[userRole];
  const IconComponent = config.icon;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.primaryColor)}>
            <IconComponent className={cn("text-xl", config.iconColor)} />
          </div>
          <div>
            <h1 className="font-bold text-lg" data-testid="sidebar-title">{config.title}</h1>
            <p className="text-xs text-muted-foreground" data-testid="sidebar-subtitle">{config.subtitle}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 px-4 py-3 h-auto",
                  isActive && userRole === "user" && "bg-primary/10 text-primary font-medium",
                  isActive && userRole === "agent" && "bg-accent/10 text-accent font-medium",
                  isActive && userRole === "admin" && "bg-destructive/10 text-destructive font-medium"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <IconComponent className="w-5 h-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt="User avatar" 
            className="w-10 h-10 rounded-full object-cover"
            data-testid="sidebar-avatar"
          />
          <div className="flex-1">
            <p className="font-medium text-sm" data-testid="sidebar-user-name">
              {userRole === "user" && "User"}
              {userRole === "agent" && "Agent"}
              {userRole === "admin" && "Admin"}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="sidebar-user-role">
              {userRole === "user" && "Customer"}
              {userRole === "agent" && "Delivery Agent"}  
              {userRole === "admin" && "Administrator"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            className="text-muted-foreground hover:text-foreground p-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
