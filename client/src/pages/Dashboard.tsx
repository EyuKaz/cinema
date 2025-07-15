import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Ticket, User } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/bookings/my-bookings"],
    retry: false,
  });

  if (isLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.showtime.date) >= new Date() && booking.status === "confirmed"
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.showtime.date) < new Date() || booking.status === "canceled"
  );

  return (
    <div className="min-h-screen bg-cinema-dark">
      <Header />
      
      {/* Dashboard Header */}
      <section className="py-16 bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-cinepolis-red rounded-full p-3">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {user?.firstName || user?.email}!
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cinepolis-red rounded-full p-2">
                    <Ticket className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Bookings</p>
                    <p className="text-2xl font-bold text-white">{bookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cinepolis-gold rounded-full p-2">
                    <Calendar className="h-5 w-5 text-cinema-dark" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Upcoming Shows</p>
                    <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-full p-2">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Past Shows</p>
                    <p className="text-2xl font-bold text-white">{pastBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section className="py-16 bg-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Upcoming Shows</h2>
          
          {upcomingBookings.length === 0 ? (
            <Card className="bg-cinema-charcoal border-gray-800">
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No upcoming bookings</p>
                <p className="text-gray-500 mb-4">Book your next movie experience!</p>
                <Button 
                  className="bg-cinepolis-red hover:bg-red-700 text-white"
                  onClick={() => window.location.href = "/movies"}
                >
                  Browse Movies
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="bg-cinema-charcoal border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src={booking.showtime.movie.posterUrl || "/placeholder-movie.jpg"} 
                        alt={booking.showtime.movie.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {booking.showtime.movie.title}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.showtime.theater.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(booking.showtime.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{booking.showtime.time}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">
                              Seats: {booking.seatNumbers.join(", ")}
                            </p>
                            <p className="text-cinepolis-gold font-semibold">
                              ${booking.totalAmount}
                            </p>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <section className="py-16 bg-cinema-charcoal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Booking History</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="bg-cinema-dark border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src={booking.showtime.movie.posterUrl || "/placeholder-movie.jpg"} 
                        alt={booking.showtime.movie.title}
                        className="w-16 h-24 object-cover rounded opacity-75"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {booking.showtime.movie.title}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.showtime.theater.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(booking.showtime.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{booking.showtime.time}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">
                              Seats: {booking.seatNumbers.join(", ")}
                            </p>
                            <p className="text-cinepolis-gold font-semibold">
                              ${booking.totalAmount}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
