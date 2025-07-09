import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import { BookingWithDetails } from '@shared/schema';
import { Calendar, Clock, MapPin, Ticket, Star, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
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

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest('PATCH', `/api/bookings/${bookingId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCancelBooking = (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.showtime.startTime) > new Date() && booking.status === 'confirmed'
  );

  const pastBookings = bookings.filter(booking => 
    new Date(booking.showtime.startTime) <= new Date() || booking.status === 'cancelled'
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <LoadingSkeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Welcome back,
                <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {user?.firstName || 'Movie Lover'}
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Manage your bookings and discover new cinema experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Profile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-center">Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <img
                        src={user?.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : 'User'
                        }
                      </h3>
                      <p className="text-gray-400">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Total Bookings</span>
                        <Badge variant="secondary">{bookings.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Upcoming</span>
                        <Badge variant="outline" className="border-purple-500 text-purple-400">
                          {upcomingBookings.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Member Since</span>
                        <span className="text-sm text-gray-400">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-2xl">My Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="upcoming" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                        <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
                          Upcoming ({upcomingBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="past" className="data-[state=active]:bg-purple-600">
                          Past ({pastBookings.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upcoming" className="space-y-4">
                        {bookingsLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <LoadingSkeleton key={i} className="h-32" />
                            ))}
                          </div>
                        ) : upcomingBookings.length === 0 ? (
                          <div className="text-center py-8">
                            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No upcoming bookings</p>
                          </div>
                        ) : (
                          upcomingBookings.map((booking) => (
                            <Card key={booking.id} className="bg-slate-700/50 border-slate-600">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      {booking.showtime.movie.title}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {booking.showtime.cinema.name}
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(booking.showtime.startTime).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {new Date(booking.showtime.startTime).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      <div className="flex items-center">
                                        <Ticket className="h-4 w-4 mr-1" />
                                        {booking.seats.join(', ')}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge 
                                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                      className="mb-2"
                                    >
                                      {booking.status}
                                    </Badge>
                                    <p className="text-lg font-bold text-white">
                                      ${booking.totalAmount}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-purple-400 hover:bg-purple-600/20"
                                  >
                                    View Ticket
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    disabled={cancelBookingMutation.isPending}
                                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="past" className="space-y-4">
                        {bookingsLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <LoadingSkeleton key={i} className="h-32" />
                            ))}
                          </div>
                        ) : pastBookings.length === 0 ? (
                          <div className="text-center py-8">
                            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No past bookings</p>
                          </div>
                        ) : (
                          pastBookings.map((booking) => (
                            <Card key={booking.id} className="bg-slate-700/50 border-slate-600">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      {booking.showtime.movie.title}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {booking.showtime.cinema.name}
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(booking.showtime.startTime).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {new Date(booking.showtime.startTime).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      <div className="flex items-center">
                                        <Ticket className="h-4 w-4 mr-1" />
                                        {booking.seats.join(', ')}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge 
                                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                      className="mb-2"
                                    >
                                      {booking.status}
                                    </Badge>
                                    <p className="text-lg font-bold text-white">
                                      ${booking.totalAmount}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-purple-400 hover:bg-purple-600/20"
                                  >
                                    View Receipt
                                  </Button>
                                  {booking.status === 'confirmed' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-slate-600 text-yellow-400 hover:bg-yellow-600/20"
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Rate Movie
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
