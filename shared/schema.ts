import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["user", "agent", "admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "in_transit", "delivered", "cancelled"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "paused", "cancelled"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["pending", "in_transit", "delivered", "failed"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["weekly", "monthly"]);
export const paymentModeEnum = pgEnum("payment_mode", ["prepaid", "postpaid"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  role: roleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Addresses
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  label: varchar("label"), // Home, Office, etc.
  line1: varchar("line1").notNull(),
  area: varchar("area"),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  pincode: varchar("pincode").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  unit: varchar("unit").notNull(), // e.g., "1 Liter", "500g"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isMilk: boolean("is_milk").default(false),
  status: productStatusEnum("status").default("active").notNull(),
  imageUrl: varchar("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  addressId: varchar("address_id").notNull().references(() => addresses.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  trackingNumber: varchar("tracking_number"),
  carrier: varchar("carrier"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  addressId: varchar("address_id").notNull().references(() => addresses.id),
  quantity: integer("quantity").notNull(),
  daysOfWeek: varchar("days_of_week").notNull(), // JSON array like "['monday', 'tuesday']"
  startDate: timestamp("start_date").notNull(),
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  paymentMode: paymentModeEnum("payment_mode").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription Deliveries (generated from subscriptions)
export const subscriptionDeliveries = pgTable("subscription_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: deliveryStatusEnum("status").default("pending").notNull(),
  deliveredAt: timestamp("delivered_at"),
  agentId: varchar("agent_id").references(() => users.id),
  proofImageUrl: varchar("proof_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Delivery Routes
export const deliveryRoutes = pgTable("delivery_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  depotLatitude: decimal("depot_latitude", { precision: 10, scale: 8 }),
  depotLongitude: decimal("depot_longitude", { precision: 11, scale: 8 }),
  status: varchar("status").default("pending"), // pending, active, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Route Stops
export const routeStops = pgTable("route_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").notNull().references(() => deliveryRoutes.id),
  deliveryId: varchar("delivery_id").references(() => subscriptionDeliveries.id),
  orderId: varchar("order_id").references(() => orders.id),
  sequence: integer("sequence").notNull(),
  addressId: varchar("address_id").notNull().references(() => addresses.id),
  status: deliveryStatusEnum("status").default("pending").notNull(),
  deliveredAt: timestamp("delivered_at"),
  estimatedTime: integer("estimated_minutes"),
  actualTime: integer("actual_minutes"),
});

// Agent Details
export const agentDetails = pgTable("agent_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vehicleType: varchar("vehicle_type"),
  vehicleNumber: varchar("vehicle_number"),
  licenseNumber: varchar("license_number"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status").default("pending"), // pending, paid, overdue
  createdAt: timestamp("created_at").defaultNow(),
});

// Ledger Entries
export const ledgerEntries = pgTable("ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // credit, debit
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  orders: many(orders),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  ledgerEntries: many(ledgerEntries),
  agentDetails: one(agentDetails),
  assignedRoutes: many(deliveryRoutes),
  assignedDeliveries: many(subscriptionDeliveries),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
  orders: many(orders),
  subscriptions: many(subscriptions),
  routeStops: many(routeStops),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  orderItems: many(orderItems),
  subscriptions: many(subscriptions),
  inventory: one(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  items: many(orderItems),
  routeStops: many(routeStops),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  product: one(products, { fields: [subscriptions.productId], references: [products.id] }),
  address: one(addresses, { fields: [subscriptions.addressId], references: [addresses.id] }),
  deliveries: many(subscriptionDeliveries),
  invoices: many(invoices),
}));

export const subscriptionDeliveriesRelations = relations(subscriptionDeliveries, ({ one }) => ({
  subscription: one(subscriptions, { fields: [subscriptionDeliveries.subscriptionId], references: [subscriptions.id] }),
  agent: one(users, { fields: [subscriptionDeliveries.agentId], references: [users.id] }),
  routeStops: one(routeStops),
}));

export const deliveryRoutesRelations = relations(deliveryRoutes, ({ one, many }) => ({
  agent: one(users, { fields: [deliveryRoutes.agentId], references: [users.id] }),
  stops: many(routeStops),
}));

export const routeStopsRelations = relations(routeStops, ({ one }) => ({
  route: one(deliveryRoutes, { fields: [routeStops.routeId], references: [deliveryRoutes.id] }),
  delivery: one(subscriptionDeliveries, { fields: [routeStops.deliveryId], references: [subscriptionDeliveries.id] }),
  order: one(orders, { fields: [routeStops.orderId], references: [orders.id] }),
  address: one(addresses, { fields: [routeStops.addressId], references: [addresses.id] }),
}));

export const agentDetailsRelations = relations(agentDetails, ({ one }) => ({
  user: one(users, { fields: [agentDetails.userId], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [invoices.subscriptionId], references: [subscriptions.id] }),
  ledgerEntries: many(ledgerEntries),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  user: one(users, { fields: [ledgerEntries.userId], references: [users.id] }),
  invoice: one(invoices, { fields: [ledgerEntries.invoiceId], references: [invoices.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionDeliverySchema = createInsertSchema(subscriptionDeliveries).omit({
  id: true,
  createdAt: true,
});

export const insertAgentDetailsSchema = createInsertSchema(agentDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SubscriptionDelivery = typeof subscriptionDeliveries.$inferSelect;
export type InsertSubscriptionDelivery = z.infer<typeof insertSubscriptionDeliverySchema>;
export type DeliveryRoute = typeof deliveryRoutes.$inferSelect;
export type RouteStop = typeof routeStops.$inferSelect;
export type AgentDetails = typeof agentDetails.$inferSelect;
export type InsertAgentDetails = z.infer<typeof insertAgentDetailsSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
