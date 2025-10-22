import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSupabaseAuth, isAuthenticated } from "./supabaseAuth";
import { setupCronService } from "./services/cronService";
import { optimizeRoute } from "./services/routeOptimizer";
import {
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertSubscriptionSchema,
  insertAddressSchema,
  insertAgentDetailsSchema
} from "@dairyflow/types";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authenticateToken = await setupSupabaseAuth(app);

  // Setup cron service
  setupCronService();

  // Auth routes
  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/user/addresses', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post('/api/user/addresses', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const addressData = insertAddressSchema.parse({ ...req.body, userId });
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.get('/api/user/subscriptions', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post('/api/user/subscriptions', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subscriptionData = insertSubscriptionSchema.parse({ ...req.body, userId });
      const subscription = await storage.createSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get('/api/user/orders', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/user/orders', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, ...orderData } = req.body;

      const validatedOrder = insertOrderSchema.parse({ ...orderData, userId });
      const validatedItems = z.array(insertOrderItemSchema).parse(items);

      const order = await storage.createOrder(validatedOrder, validatedItems);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/user/invoices', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Products routes (public)
  app.get('/api/products', async (req, res) => {
    try {
      const activeOnly = req.query.active !== 'false';
      const products = await storage.getProducts(activeOnly);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Agent routes
  app.get('/api/agent/route', authenticateToken, async (req: any, res) => {
    try {
      const agentId = req.user.id;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const route = await storage.getAgentRouteForDate(agentId, date);
      res.json(route);
    } catch (error) {
      console.error("Error fetching agent route:", error);
      res.status(500).json({ message: "Failed to fetch route" });
    }
  });

  app.patch('/api/agent/delivery/:id/status', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const deliveredAt = status === 'delivered' ? new Date() : undefined;

      const delivery = await storage.updateDeliveryStatus(id, status, deliveredAt);
      res.json(delivery);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ message: "Failed to update delivery status" });
    }
  });

  app.patch('/api/agent/route-stop/:id/status', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const deliveredAt = status === 'delivered' ? new Date() : undefined;

      const stop = await storage.updateRouteStopStatus(id, status, deliveredAt);
      res.json(stop);
    } catch (error) {
      console.error("Error updating route stop status:", error);
      res.status(500).json({ message: "Failed to update route stop status" });
    }
  });

  // Admin routes
  const adminAuth = [authenticateToken, (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  }];

  app.get('/api/admin/analytics', adminAuth, async (req: any, res: any) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/products', adminAuth, async (req: any, res: any) => {
    try {
      const products = await storage.getProducts(false);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/admin/products', adminAuth, async (req: any, res: any) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch('/api/admin/products/:id', adminAuth, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const product = await storage.updateProduct(id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.get('/api/admin/inventory', adminAuth, async (req: any, res: any) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.patch('/api/admin/inventory/:productId', adminAuth, async (req: any, res: any) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const inventory = await storage.updateInventory(productId, quantity);
      res.json(inventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  app.get('/api/admin/orders', adminAuth, async (req: any, res: any) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/agents', adminAuth, async (req: any, res: any) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.post('/api/admin/agents/:userId/details', adminAuth, async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const detailsData = insertAgentDetailsSchema.parse({ ...req.body, userId });
      const details = await storage.createAgentDetails(detailsData);
      res.json(details);
    } catch (error) {
      console.error("Error creating agent details:", error);
      res.status(500).json({ message: "Failed to create agent details" });
    }
  });

  app.post('/api/admin/optimize-routes', adminAuth, async (req: any, res: any) => {
    try {
      const { date, agentIds, depotLocation } = req.body;
      const targetDate = new Date(date);
      
      const deliveries = await storage.getDeliveriesForDate(targetDate);
      
      for (const agentId of agentIds) {
        const agentDeliveries = deliveries.filter(d => d.agentId === agentId);
        if (agentDeliveries.length === 0) continue;

        const optimizedRoute = await optimizeRoute(agentDeliveries, depotLocation);

        const route = await storage.createDeliveryRoute({
          agentId,
          date: targetDate,
          depotLatitude: depotLocation?.latitude,
          depotLongitude: depotLocation?.longitude
        });

        for (let i = 0; i < optimizedRoute.length; i++) {
          await storage.createRouteStop({
            routeId: route.id,
            deliveryId: optimizedRoute[i].id,
            sequence: i + 1,
            addressId: optimizedRoute[i].subscription.addressId
          });
        }
      }
      
      res.json({ message: "Routes optimized successfully" });
    } catch (error) {
      console.error("Error optimizing routes:", error);
      res.status(500).json({ message: "Failed to optimize routes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
