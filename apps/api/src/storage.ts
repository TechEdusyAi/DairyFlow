import {
  users,
  addresses,
  products,
  orders,
  orderItems,
  subscriptions,
  subscriptionDeliveries,
  deliveryRoutes,
  routeStops,
  agentDetails,
  inventory,
  invoices,
  ledgerEntries,
  type User,
  type UpsertUser,
  type Address,
  type InsertAddress,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Subscription,
  type InsertSubscription,
  type SubscriptionDelivery,
  type InsertSubscriptionDelivery,
  type DeliveryRoute,
  type RouteStop,
  type AgentDetails,
  type InsertAgentDetails,
  type Inventory,
  type InsertInventory,
  type Invoice,
  type InsertInvoice,
  type LedgerEntry,
  type InsertLedgerEntry,
} from "@dairyflow/types";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Address operations
  getUserAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  // Product operations
  getProducts(activeOnly?: boolean): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;

  // Inventory operations
  getInventory(): Promise<(Inventory & { product: Product })[]>;
  updateInventory(productId: string, quantity: number): Promise<Inventory | undefined>;

  // Order operations
  getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getAllOrders(): Promise<(Order & { user: User; items: (OrderItem & { product: Product })[] })[]>;

  // Subscription operations
  getUserSubscriptions(userId: string): Promise<(Subscription & { product: Product; address: Address })[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  getActiveSubscriptions(): Promise<(Subscription & { product: Product; user: User; address: Address })[]>;

  // Subscription delivery operations
  createSubscriptionDelivery(delivery: InsertSubscriptionDelivery): Promise<SubscriptionDelivery>;
  getDeliveriesForDate(date: Date): Promise<(SubscriptionDelivery & { subscription: Subscription & { user: User; product: Product; address: Address } })[]>;
  updateDeliveryStatus(id: string, status: string, deliveredAt?: Date): Promise<SubscriptionDelivery | undefined>;

  // Agent operations
  getAgents(): Promise<(User & { agentDetails: AgentDetails | null })[]>;
  createAgentDetails(details: InsertAgentDetails): Promise<AgentDetails>;
  updateAgentDetails(userId: string, details: Partial<InsertAgentDetails>): Promise<AgentDetails | undefined>;

  // Route operations
  createDeliveryRoute(route: { agentId: string; date: Date; depotLatitude?: number; depotLongitude?: number }): Promise<DeliveryRoute>;
  getAgentRouteForDate(agentId: string, date: Date): Promise<(DeliveryRoute & { stops: (RouteStop & { address: Address; delivery?: SubscriptionDelivery; order?: Order })[] }) | undefined>;
  createRouteStop(stop: { routeId: string; deliveryId?: string; orderId?: string; sequence: number; addressId: string }): Promise<RouteStop>;
  updateRouteStopStatus(id: string, status: string, deliveredAt?: Date): Promise<RouteStop | undefined>;

  // Billing operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getUserInvoices(userId: string): Promise<Invoice[]>;
  createLedgerEntry(entry: InsertLedgerEntry): Promise<LedgerEntry>;
  getUserLedgerEntries(userId: string): Promise<LedgerEntry[]>;

  // Analytics
  getAnalytics(): Promise<{
    totalRevenue: number;
    activeCustomers: number;
    totalSubscriptions: number;
    todayDeliveries: number;
    completedDeliveries: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Address operations
  async getUserAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(addresses).set(address).where(eq(addresses.id, id)).returning();
    return updated;
  }

  async deleteAddress(id: string): Promise<boolean> {
    try {
      await db.delete(addresses).where(eq(addresses.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Product operations
  async getProducts(activeOnly = true): Promise<Product[]> {
    const query = db.select().from(products);
    if (activeOnly) {
      query.where(eq(products.status, 'active'));
    }
    return await query.orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set({ ...product, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return updated;
  }

  // Inventory operations
  async getInventory(): Promise<(Inventory & { product: Product })[]> {
    const result = await db.select().from(inventory).leftJoin(products, eq(inventory.productId, products.id));
    return result.map(row => ({
      ...row.inventory,
      product: row.products!
    }));
  }

  async updateInventory(productId: string, quantity: number): Promise<Inventory | undefined> {
    const [updated] = await db
      .insert(inventory)
      .values({ productId, quantity })
      .onConflictDoUpdate({
        target: inventory.productId,
        set: { quantity, updatedAt: new Date() },
      })
      .returning();
    return updated;
  }

  // Order operations
  async getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items.map(item => ({ ...item.order_items, product: item.products! }))
        };
      })
    );
    
    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id
      }));
      
      await tx.insert(orderItems).values(orderItemsWithOrderId);
      
      return newOrder;
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ status: status as any, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getAllOrders(): Promise<(Order & { user: User; items: (OrderItem & { product: Product })[] })[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      allOrders.map(async (orderWithUser) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, orderWithUser.orders.id));
        
        return {
          ...orderWithUser.orders,
          user: orderWithUser.users!,
          items: items.map(item => ({ ...item.order_items, product: item.products! }))
        };
      })
    );
    
    return ordersWithItems;
  }

  // Subscription operations
  async getUserSubscriptions(userId: string): Promise<(Subscription & { product: Product; address: Address })[]> {
    const result = await db
      .select()
      .from(subscriptions)
      .leftJoin(products, eq(subscriptions.productId, products.id))
      .leftJoin(addresses, eq(subscriptions.addressId, addresses.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    
    return result.map(row => ({
      ...row.subscriptions,
      product: row.products!,
      address: row.addresses!
    }));
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions).set({ ...subscription, updatedAt: new Date() }).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  async getActiveSubscriptions(): Promise<(Subscription & { product: Product; user: User; address: Address })[]> {
    const result = await db
      .select()
      .from(subscriptions)
      .leftJoin(products, eq(subscriptions.productId, products.id))
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(addresses, eq(subscriptions.addressId, addresses.id))
      .where(eq(subscriptions.status, 'active'));
    
    return result.map(row => ({
      ...row.subscriptions,
      product: row.products!,
      user: row.users!,
      address: row.addresses!
    }));
  }

  // Subscription delivery operations
  async createSubscriptionDelivery(delivery: InsertSubscriptionDelivery): Promise<SubscriptionDelivery> {
    const [newDelivery] = await db.insert(subscriptionDeliveries).values(delivery).returning();
    return newDelivery;
  }

  async getDeliveriesForDate(date: Date): Promise<(SubscriptionDelivery & { subscription: Subscription & { user: User; product: Product; address: Address } })[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(subscriptionDeliveries)
      .leftJoin(subscriptions, eq(subscriptionDeliveries.subscriptionId, subscriptions.id))
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(products, eq(subscriptions.productId, products.id))
      .leftJoin(addresses, eq(subscriptions.addressId, addresses.id))
      .where(and(
        gte(subscriptionDeliveries.scheduledDate, startOfDay),
        lte(subscriptionDeliveries.scheduledDate, endOfDay)
      ));

    return result.map(row => ({
      ...row.subscription_deliveries,
      subscription: {
        ...row.subscriptions!,
        user: row.users!,
        product: row.products!,
        address: row.addresses!
      }
    }));
  }

  async updateDeliveryStatus(id: string, status: string, deliveredAt?: Date): Promise<SubscriptionDelivery | undefined> {
    const [updated] = await db
      .update(subscriptionDeliveries)
      .set({ 
        status: status as any, 
        deliveredAt: deliveredAt || null 
      })
      .where(eq(subscriptionDeliveries.id, id))
      .returning();
    return updated;
  }

  // Agent operations
  async getAgents(): Promise<(User & { agentDetails: AgentDetails | null })[]> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(agentDetails, eq(users.id, agentDetails.userId))
      .where(eq(users.role, 'agent'));

    return result.map(row => ({
      ...row.users,
      agentDetails: row.agent_details
    }));
  }

  async createAgentDetails(details: InsertAgentDetails): Promise<AgentDetails> {
    const [newDetails] = await db.insert(agentDetails).values(details).returning();
    return newDetails;
  }

  async updateAgentDetails(userId: string, details: Partial<InsertAgentDetails>): Promise<AgentDetails | undefined> {
    const [updated] = await db
      .update(agentDetails)
      .set({ ...details, updatedAt: new Date() })
      .where(eq(agentDetails.userId, userId))
      .returning();
    return updated;
  }

  // Route operations
  async createDeliveryRoute(route: { agentId: string; date: Date; depotLatitude?: number; depotLongitude?: number }): Promise<DeliveryRoute> {
    const [newRoute] = await db.insert(deliveryRoutes).values({
      agentId: route.agentId,
      date: route.date,
      depotLatitude: route.depotLatitude?.toString(),
      depotLongitude: route.depotLongitude?.toString()
    }).returning();
    return newRoute;
  }

  async getAgentRouteForDate(agentId: string, date: Date): Promise<(DeliveryRoute & { stops: (RouteStop & { address: Address; delivery?: SubscriptionDelivery; order?: Order })[] }) | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(
        eq(deliveryRoutes.agentId, agentId),
        gte(deliveryRoutes.date, startOfDay),
        lte(deliveryRoutes.date, endOfDay)
      ));

    if (!route) return undefined;

    const stops = await db
      .select()
      .from(routeStops)
      .leftJoin(addresses, eq(routeStops.addressId, addresses.id))
      .leftJoin(subscriptionDeliveries, eq(routeStops.deliveryId, subscriptionDeliveries.id))
      .leftJoin(orders, eq(routeStops.orderId, orders.id))
      .where(eq(routeStops.routeId, route.id))
      .orderBy(asc(routeStops.sequence));

    return {
      ...route,
      stops: stops.map(stop => ({
        ...stop.route_stops,
        address: stop.addresses!,
        delivery: stop.subscription_deliveries || undefined,
        order: stop.orders || undefined
      }))
    };
  }

  async createRouteStop(stop: { routeId: string; deliveryId?: string; orderId?: string; sequence: number; addressId: string }): Promise<RouteStop> {
    const [newStop] = await db.insert(routeStops).values(stop).returning();
    return newStop;
  }

  async updateRouteStopStatus(id: string, status: string, deliveredAt?: Date): Promise<RouteStop | undefined> {
    const [updated] = await db
      .update(routeStops)
      .set({ 
        status: status as any, 
        deliveredAt: deliveredAt || null 
      })
      .where(eq(routeStops.id, id))
      .returning();
    return updated;
  }

  // Billing operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async createLedgerEntry(entry: InsertLedgerEntry): Promise<LedgerEntry> {
    const [newEntry] = await db.insert(ledgerEntries).values(entry).returning();
    return newEntry;
  }

  async getUserLedgerEntries(userId: string): Promise<LedgerEntry[]> {
    return await db.select().from(ledgerEntries).where(eq(ledgerEntries.userId, userId)).orderBy(desc(ledgerEntries.createdAt));
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalRevenue: number;
    activeCustomers: number;
    totalSubscriptions: number;
    todayDeliveries: number;
    completedDeliveries: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [revenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(invoices)
      .where(eq(invoices.status, 'paid'));

    const [customers] = await db
      .select({ count: sql<number>`COUNT(DISTINCT user_id)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const [subscriptionsCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const [todayDeliveriesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptionDeliveries)
      .where(and(
        gte(subscriptionDeliveries.scheduledDate, today),
        lte(subscriptionDeliveries.scheduledDate, tomorrow)
      ));

    const [completedDeliveriesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptionDeliveries)
      .where(and(
        gte(subscriptionDeliveries.scheduledDate, today),
        lte(subscriptionDeliveries.scheduledDate, tomorrow),
        eq(subscriptionDeliveries.status, 'delivered')
      ));

    return {
      totalRevenue: revenue.total || 0,
      activeCustomers: customers.count || 0,
      totalSubscriptions: subscriptionsCount.count || 0,
      todayDeliveries: todayDeliveriesCount.count || 0,
      completedDeliveries: completedDeliveriesCount.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
