import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milk, Truck, Shield, Users, Clock, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Milk className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h1 className="font-bold text-xl">DairyDirect</h1>
                <p className="text-xs text-muted-foreground">Fresh Delivery</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Fresh Dairy Delivered to Your Doorstep
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium quality milk, curd, ghee and other dairy products delivered daily across Coimbatore and Tamil Nadu. 
            Subscribe to daily deliveries or place one-time orders.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose DairyDirect?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card data-testid="card-feature-quality">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="text-primary text-xl" />
                </div>
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fresh dairy products sourced directly from trusted local farms. 
                  Quality tested and delivered within hours of production.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-delivery">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-secondary text-xl" />
                </div>
                <CardTitle>Daily Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Subscribe to daily milk delivery or schedule deliveries based on your needs. 
                  Flexible billing cycles and payment modes.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-service">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-accent text-xl" />
                </div>
                <CardTitle>Reliable Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Professional delivery agents, route optimization for timely delivery, 
                  and customer support to ensure your satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Our Services
          </h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-8" data-testid="card-service-subscription">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Milk className="text-primary text-2xl" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-foreground">Daily Milk Subscription</h4>
                  <p className="text-muted-foreground mb-4">
                    Subscribe to daily fresh milk delivery within Coimbatore. Choose your quantity, 
                    delivery days, and billing preferences. Cancel or modify anytime.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Flexible delivery schedule (daily, alternate days, weekdays only)</li>
                    <li>• Weekly or monthly billing cycles</li>
                    <li>• Prepaid or postpaid payment options</li>
                    <li>• Real-time delivery tracking</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8" data-testid="card-service-catalog">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="text-secondary text-2xl" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-foreground">Catalog Orders</h4>
                  <p className="text-muted-foreground mb-4">
                    Order dairy products across Tamil Nadu. Browse our catalog of milk, curd, ghee, 
                    paneer, buttermilk and more. Delivered to your doorstep.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Wide range of dairy products</li>
                    <li>• Delivery across Tamil Nadu</li>
                    <li>• Order tracking and notifications</li>
                    <li>• Secure online payment</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Get Fresh Dairy Delivered?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers across Coimbatore and Tamil Nadu
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-start-ordering"
          >
            Start Ordering Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Milk className="text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">DairyDirect</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Premium dairy delivery service across Coimbatore and Tamil Nadu.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Daily Milk Delivery</li>
                <li>Catalog Orders</li>
                <li>Subscription Management</li>
                <li>Route Optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Coverage</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Coimbatore City</li>
                <li>Tamil Nadu State</li>
                <li>Real-time Tracking</li>
                <li>Professional Agents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Customer Service</li>
                <li>Order Tracking</li>
                <li>Billing Support</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DairyDirect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
