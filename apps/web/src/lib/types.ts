// API Response Types
export interface AnalyticsData {
  totalRevenue: number;
  activeCustomers: number;
  totalSubscriptions: number;
  todayDeliveries: number;
  completedDeliveries: number;
}

export interface ProductData {
  id: string;
  name: string;
  unit: string;
  price: number;
  isMilk: boolean;
  status: string;
  imageUrl?: string;
  description?: string;
}

export interface AgentData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  agentDetails?: {
    vehicleType?: string;
    vehicleNumber?: string;
    licenseNumber?: string;
    isAvailable?: boolean;
  } | null;
}

export interface OrderData {
  id: string;
  userId: string;
  addressId: string;
  total: number;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: ProductData;
  }>;
}

export interface SubscriptionData {
  id: string;
  userId: string;
  productId: string;
  addressId: string;
  quantity: number;
  daysOfWeek: string;
  startDate: string;
  billingCycle: string;
  paymentMode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  product: ProductData;
  address: {
    id: string;
    userId: string;
    label?: string;
    line1: string;
    area?: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
    createdAt: string;
  };
}

export interface RouteData {
  id: string;
  agentId: string;
  date: string;
  depotLatitude?: string;
  depotLongitude?: string;
  status?: string;
  createdAt: string;
  stops: Array<{
    id: string;
    routeId: string;
    deliveryId?: string;
    orderId?: string;
    sequence: number;
    addressId: string;
    status: string;
    deliveredAt?: string;
    estimatedTime?: number;
    actualTime?: number;
    address: {
      id: string;
      userId: string;
      label?: string;
      line1: string;
      area?: string;
      city: string;
      state: string;
      pincode: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
      createdAt: string;
    };
    delivery?: {
      id: string;
      subscriptionId: string;
      scheduledDate: string;
      status: string;
      deliveredAt?: string;
      agentId?: string;
      proofImageUrl?: string;
      createdAt: string;
    };
    order?: OrderData;
  }>;
}