import { Link } from 'react-router-dom';
import { ImageWithFallback } from "../shared/ui";
import { Button } from "../shared/ui";
import { ArrowRight, Clock, Search, Star, Shield } from "lucide-react";
import imgLogo from "../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png";

export function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#22C55E]/10 via-white to-[#F97316]/5 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 px-4 py-2 rounded-full">
                <Star className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                <span className="text-sm font-medium">Rated #1 Food Delivery App</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Food at your{" "}
                <span className="text-[#22C55E]">doorstep</span>
              </h1>
              
              <p className="text-xl text-gray-600">
                Order from your favorite restaurants and get it delivered fresh, fast, and with premium quality.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-lg px-8 h-14"
                  asChild
                >
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10 text-lg px-8 h-14"
                  asChild
                >
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1769638913684-87c75872fda7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwYm93bCUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzc0MDE4NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Fresh food"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#F97316]/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-[#F97316]" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl text-[#F97316]">30 min</p>
                    <p className="text-sm text-gray-600">Average delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We deliver more than just food. We deliver an experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-[#22C55E]/5 to-[#22C55E]/10 hover:shadow-xl transition-all duration-300">
              <div className="h-16 w-16 bg-[#22C55E]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8 text-[#22C55E]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Easy Tracking</h3>
              <p className="text-gray-600">
                Track your order in real-time from restaurant to your doorstep with our intuitive tracking system.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-[#F97316]/5 to-[#F97316]/10 hover:shadow-xl transition-all duration-300">
              <div className="h-16 w-16 bg-[#F97316]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-[#F97316]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Delivery</h3>
              <p className="text-gray-600">
                Get your food delivered fast with our optimized delivery network. Average delivery time is just 30 minutes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-[#FACC15]/5 to-[#FACC15]/10 hover:shadow-xl transition-all duration-300">
              <div className="h-16 w-16 bg-[#FACC15]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-[#EAB308]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Variety & Quality</h3>
              <p className="text-gray-600">
                Choose from hundreds of restaurants and cuisines. All partners are verified for quality and hygiene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#22C55E] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">500+</p>
              <p className="text-lg opacity-90">Restaurants</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">10k+</p>
              <p className="text-lg opacity-90">Happy Customers</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">50k+</p>
              <p className="text-lg opacity-90">Orders Delivered</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">4.8⭐</p>
              <p className="text-lg opacity-90">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Partner with Us
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Restaurant Partner */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-xl mb-6 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1761303506087-9788d0a98e87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwdmFyaWV0eSUyMGN1aXNpbmUlMjBkaXNoZXN8ZW58MXx8fHwxNzc0MDE4Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Restaurant"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Create Your Restaurant Account</h3>
              <p className="text-gray-600 mb-6">
                Join our platform and reach thousands of hungry customers. Manage your menu, orders, and grow your business.
              </p>
              <Button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white">
                Register Your Restaurant
              </Button>
            </div>

            {/* Delivery Partner */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-xl mb-6 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758956934245-8daff43eb1e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXN0JTIwZGVsaXZlcnklMjBzY29vdGVyJTIwZm9vZHxlbnwxfHx8fDE3NzQwMTg3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Delivery"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Start Your Food Ordering Journey</h3>
              <p className="text-gray-600 mb-6">
                Browse from hundreds of restaurants, track your orders in real-time, and enjoy fast delivery to your doorstep.
              </p>
              <Button 
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white"
                asChild
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers and experience the best food delivery service in town.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-[#22C55E] hover:bg-gray-100 text-lg px-8 h-14"
              asChild
            >
              <Link to="/dashboard">
                Browse Restaurants
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
