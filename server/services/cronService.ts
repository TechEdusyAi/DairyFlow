import { storage } from "../storage";

let cronInterval: NodeJS.Timeout | null = null;

export function setupCronService() {
  // Run every day at 11 PM to generate tomorrow's deliveries
  const runCron = async () => {
    try {
      console.log("Running nightly subscription expansion...");
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0); // Default delivery time 6 AM
      
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayOfWeek = dayNames[tomorrow.getDay()];
      
      const activeSubscriptions = await storage.getActiveSubscriptions();
      
      for (const subscription of activeSubscriptions) {
        try {
          const daysOfWeek = JSON.parse(subscription.daysOfWeek);
          
          if (daysOfWeek.includes(dayOfWeek)) {
            // Create subscription delivery for tomorrow
            await storage.createSubscriptionDelivery({
              subscriptionId: subscription.id,
              scheduledDate: tomorrow,
              status: "pending"
            });
            
            console.log(`Created delivery for subscription ${subscription.id} on ${tomorrow.toDateString()}`);
          }
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
        }
      }
      
      console.log("Nightly subscription expansion completed");
    } catch (error) {
      console.error("Error in cron service:", error);
    }
  };

  // Run immediately for testing, then every 24 hours
  runCron();
  
  // Set up interval for every 24 hours (86400000 ms)
  cronInterval = setInterval(runCron, 86400000);
  
  console.log("Cron service started - will run daily at 11 PM");
}

export function stopCronService() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("Cron service stopped");
  }
}
