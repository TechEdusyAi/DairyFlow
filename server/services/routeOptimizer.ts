import type { SubscriptionDelivery, Subscription, User, Product, Address } from "@shared/schema";

interface DeliveryWithDetails extends SubscriptionDelivery {
  subscription: Subscription & {
    user: User;
    product: Product;
    address: Address;
  };
}

interface Location {
  latitude: number;
  longitude: number;
}

// Simple haversine distance calculation
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Simple nearest neighbor algorithm for route optimization
export async function optimizeRoute(
  deliveries: DeliveryWithDetails[], 
  depotLocation?: Location
): Promise<DeliveryWithDetails[]> {
  if (deliveries.length === 0) return [];
  
  // Filter out deliveries without valid coordinates
  const validDeliveries = deliveries.filter(delivery => 
    delivery.subscription.address.latitude && 
    delivery.subscription.address.longitude
  );
  
  if (validDeliveries.length === 0) return deliveries;
  
  const depot: Location = depotLocation || {
    latitude: 11.0168, // Coimbatore city center as default
    longitude: 76.9558
  };
  
  const optimized: DeliveryWithDetails[] = [];
  const remaining = [...validDeliveries];
  let currentLocation = depot;
  
  // Start with the delivery closest to depot
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const delivery = remaining[i];
      const deliveryLocation = {
        latitude: parseFloat(delivery.subscription.address.latitude || "0"),
        longitude: parseFloat(delivery.subscription.address.longitude || "0")
      };
      
      const distance = calculateDistance(currentLocation, deliveryLocation);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    const nearestDelivery = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nearestDelivery);
    
    currentLocation = {
      latitude: parseFloat(nearestDelivery.subscription.address.latitude || "0"),
      longitude: parseFloat(nearestDelivery.subscription.address.longitude || "0")
    };
  }
  
  // Add any deliveries without coordinates at the end
  const invalidDeliveries = deliveries.filter(delivery => 
    !delivery.subscription.address.latitude || 
    !delivery.subscription.address.longitude
  );
  
  return [...optimized, ...invalidDeliveries];
}

// Calculate total route distance and estimated time
export function calculateRouteMetrics(
  deliveries: DeliveryWithDetails[], 
  depotLocation?: Location
): { totalDistance: number; estimatedMinutes: number } {
  if (deliveries.length === 0) return { totalDistance: 0, estimatedMinutes: 0 };
  
  const depot: Location = depotLocation || {
    latitude: 11.0168,
    longitude: 76.9558
  };
  
  let totalDistance = 0;
  let currentLocation = depot;
  
  for (const delivery of deliveries) {
    if (delivery.subscription.address.latitude && delivery.subscription.address.longitude) {
      const deliveryLocation = {
        latitude: parseFloat(delivery.subscription.address.latitude),
        longitude: parseFloat(delivery.subscription.address.longitude)
      };
      
      totalDistance += calculateDistance(currentLocation, deliveryLocation);
      currentLocation = deliveryLocation;
    }
  }
  
  // Return to depot
  if (deliveries.length > 0 && deliveries[deliveries.length - 1].subscription.address.latitude) {
    const lastLocation = {
      latitude: parseFloat(deliveries[deliveries.length - 1].subscription.address.latitude || "0"),
      longitude: parseFloat(deliveries[deliveries.length - 1].subscription.address.longitude || "0")
    };
    totalDistance += calculateDistance(lastLocation, depot);
  }
  
  // Estimate time: assume 30 km/h average speed + 5 minutes per stop
  const estimatedMinutes = Math.round((totalDistance / 30) * 60) + (deliveries.length * 5);
  
  return { totalDistance: Math.round(totalDistance * 100) / 100, estimatedMinutes };
}
