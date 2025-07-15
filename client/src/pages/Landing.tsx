import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Star, MapPin, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cinema-dark via-cinema-charcoal to-cinema-dark">
      {/* Header */}
      <header className="bg-cinema-charcoal/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Film className="h-8 w-8 text-cinepolis-red mr-2" />
              <h1 className="text-2xl font-bold text-cinepolis-red">Cinépolis</h1>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-cinepolis-red hover:bg-red-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              Premium Cinema
              <span className="text-cinepolis-red"> Experience</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Immerse yourself in the ultimate movie-going experience with luxury seating, 
              gourmet dining, and the latest blockbusters in stunning quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-cinepolis-red hover:bg-red-700 text-white px-8 py-3 text-lg"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 hover:border-white text-white px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Cinépolis?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-cinema-charcoal border-gray-800">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-cinepolis-gold mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Premium Experience</h4>
                <p className="text-gray-300">
                  Luxury reclining seats, premium sound systems, and immersive viewing environments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-charcoal border-gray-800">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-cinepolis-gold mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Multiple Locations</h4>
                <p className="text-gray-300">
                  Find us in prime locations across the country with convenient parking and accessibility.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-charcoal border-gray-800">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-cinepolis-gold mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Easy Booking</h4>
                <p className="text-gray-300">
                  Simple online booking system with flexible showtimes and seat selection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-cinema-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Premium Cinema?
          </h3>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of movie lovers who choose Cinépolis for their entertainment needs.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-cinepolis-red hover:bg-red-700 text-white px-8 py-3 text-lg"
          >
            Sign In to Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cinema-charcoal border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 Cinépolis USA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
