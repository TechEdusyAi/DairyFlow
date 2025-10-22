import { useQuery } from "@tanstack/react-query";

// Mock data for revenue chart - in real app this would come from an API
const mockRevenueData = [
  { day: "Mon", revenue: 18000 },
  { day: "Tue", revenue: 24000 },
  { day: "Wed", revenue: 30000 },
  { day: "Thu", revenue: 22000 },
  { day: "Fri", revenue: 34000 },
  { day: "Sat", revenue: 36000 },
  { day: "Sun", revenue: 40000 },
];

export default function RevenueChart() {
  // In a real application, this would fetch actual revenue data
  // const { data: revenueData, isLoading } = useQuery({
  //   queryKey: ["/api/admin/revenue-chart"],
  //   retry: false,
  // });

  const maxRevenue = Math.max(...mockRevenueData.map(d => d.revenue));

  return (
    <div className="h-64 flex items-end justify-between gap-2" data-testid="revenue-chart">
      {mockRevenueData.map((data, index) => {
        const heightPercentage = (data.revenue / maxRevenue) * 100;
        const isToday = index === mockRevenueData.length - 1; // Assuming last bar is today
        
        return (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                isToday 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-primary/20 hover:bg-primary/30'
              }`}
              style={{ height: `${heightPercentage}%` }}
              title={`${data.day}: ₹${data.revenue.toLocaleString()}`}
              data-testid={`revenue-bar-${data.day.toLowerCase()}`}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {data.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
