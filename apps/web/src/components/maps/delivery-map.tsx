import { useEffect, useRef } from "react";
import { MapPin, Navigation, Home } from "lucide-react";

interface DeliveryStop {
  id: string;
  sequence: number;
  status: string;
  address?: {
    line1: string;
    area: string;
    city: string;
    latitude?: string;
    longitude?: string;
  };
}

interface DeliveryMapProps {
  stops: DeliveryStop[];
  depot: {
    latitude: number;
    longitude: number;
  };
}

export default function DeliveryMap({ stops, depot }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Since we can't use actual map libraries without API keys,
  // this is a placeholder implementation that shows the route visually
  const validStops = stops.filter(stop => 
    stop.address?.latitude && stop.address?.longitude
  );

  const completedStops = validStops.filter(stop => stop.status === 'delivered');
  const pendingStops = validStops.filter(stop => stop.status !== 'delivered');

  return (
    <div 
      ref={mapRef}
      className="map-placeholder h-80 flex items-center justify-center relative overflow-hidden"
      data-testid="delivery-map"
    >
      {/* Map Grid Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full relative">
          {/* Depot Marker */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: '20%', top: '80%' }}
            title="Depot Location"
            data-testid="depot-marker"
          >
            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Home className="w-3 h-3 text-secondary-foreground" />
            </div>
            <div className="text-xs font-medium text-center mt-1 bg-white/90 px-1 rounded">
              Depot
            </div>
          </div>

          {/* Route Line */}
          {validStops.length > 0 && (
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7" 
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="hsl(var(--primary))"
                  />
                </marker>
              </defs>
              
              {/* Route path */}
              <path
                d="M 20% 80% Q 40% 60% 60% 40% Q 70% 30% 80% 20%"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          )}

          {/* Delivery Stop Markers */}
          {validStops.slice(0, 5).map((stop, index) => {
            const positions = [
              { left: '30%', top: '70%' },
              { left: '45%', top: '55%' },
              { left: '55%', top: '45%' },
              { left: '70%', top: '35%' },
              { left: '80%', top: '25%' },
            ];
            
            const position = positions[index] || positions[0];
            const isCompleted = stop.status === 'delivered';
            const isNext = !isCompleted && index === completedStops.length;
            
            return (
              <div
                key={stop.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={position}
                title={`Stop ${stop.sequence}: ${stop.address?.line1}, ${stop.address?.area}`}
                data-testid={`stop-marker-${stop.id}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white font-bold text-sm ${
                    isCompleted 
                      ? 'bg-secondary text-secondary-foreground' 
                      : isNext 
                        ? 'bg-accent text-accent-foreground ring-4 ring-accent/20'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stop.sequence}
                </div>
                <div className="text-xs font-medium text-center mt-1 bg-white/90 px-1 rounded max-w-20 truncate">
                  Stop {stop.sequence}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay Content */}
      <div className="relative z-20 text-center">
        <MapPin className="h-12 w-12 text-primary/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Interactive Route Map</p>
        <p className="text-sm text-muted-foreground mt-2">
          Showing {validStops.length} delivery stops
          {completedStops.length > 0 && (
            <span className="block mt-1">
              {completedStops.length} completed, {pendingStops.length} pending
            </span>
          )}
        </p>
        
        {/* Map Controls */}
        <div className="flex justify-center gap-2 mt-4">
          <button 
            className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-lg shadow-sm border border-border"
            data-testid="button-zoom-in"
          >
            <Navigation className="h-4 w-4" />
          </button>
          <button 
            className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-lg shadow-sm border border-border"
            data-testid="button-center-map"
          >
            Center
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-secondary rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-accent rounded-full"></div>
            <span>Next Stop</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-muted rounded-full"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
