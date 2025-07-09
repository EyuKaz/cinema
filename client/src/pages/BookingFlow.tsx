import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Seat } from '@shared/schema';
import { Calendar, Clock, MapPin, Users, CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import SeatMap from '@/components/SeatMap';
import BookingSummary from '@/components/BookingSummary';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function BookingFlow() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { state, dispatch } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue booking.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 500);
      return;
    }
  }, [isAuthenticated, toast]);

  // Redirect if no showtime selected
  useEffect(() => {
    if (!state.selectedShowtime) {
      setLocation('/');
    }
  }, [state.selectedShowtime, setLocation]);

  const { data: seats = [], isLoading: seatsLoading } = useQuery<Seat[]>({
    queryKey: [`/api/showtimes/${state.selectedShowtime?.id}/seats`],
    enabled: !!state.selectedShowtime,
  });

  const { sendMessage, isConnected } = useWebSocket(
    state.selectedShowtime?.id || 0,
    user?.id || '',
    (message) => {
      if (message.type === 'seat_update') {
        // Update seat availability in real-time
        queryClient.invalidateQueries({ 
          queryKey: [`/api/showtimes/${state.selectedShowtime?.id}/seats`] 
        });
      }
    }
  );

  const lockSeatsMutation = useMutation({
    mutationFn: async (seatNumbers: string[]) => {
      await apiRequest(
        'POST',
        `/api/showtimes/${state.selectedShowtime?.id}/seats/lock`,
        { seatNumbers }
      );
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
        description: "Failed to lock seats. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: () => {
      dispatch({ type: 'RESET_BOOKING' });
      setStep(3);
      toast({
        title: "Booking Confirmed!",
        description: "Your tickets have been booked successfully.",
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
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSeatSelection = (seatNumbers: string[]) => {
    dispatch({ type: 'SET_SEATS', payload: seatNumbers });
    
    // Lock seats when selected
    if (seatNumbers.length > 0) {
      lockSeatsMutation.mutate(seatNumbers);
    }
  };

  const handleProceedToPayment = () => {
    if (state.selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    if (!state.selectedShowtime || state.selectedSeats.length === 0) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const bookingData = {
        showtimeId: state.selectedShowtime.id,
        seats: state.selectedSeats,
        totalAmount: state.totalPrice,
      };

      await createBookingMutation.mutateAsync(bookingData);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || !state.selectedShowtime) {
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
        {/* Progress Steps */}
        <div className="bg-slate-800/50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-8">
              {[
                { number: 1, title: 'Select Seats' },
                { number: 2, title: 'Payment' },
                { number: 3, title: 'Confirmation' }
              ].map(({ number, title }) => (
                <div key={number} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= number 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-gray-400'
                  }`}>
                    {step > number ? <CheckCircle className="h-4 w-4" /> : number}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step >= number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Movie Info */}
                <div className="lg:col-span-1">
                  <Card className="bg-slate-800/50 border-slate-700 mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          {state.selectedShowtime.movie.title}
                        </h3>
                        <p className="text-gray-400">{state.selectedShowtime.movie.genre}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-cyan-400 mr-2" />
                          <span className="text-gray-300">{state.selectedShowtime.cinema.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-cyan-400 mr-2" />
                          <span className="text-gray-300">
                            {new Date(state.selectedShowtime.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-cyan-400 mr-2" />
                          <span className="text-gray-300">
                            {new Date(state.selectedShowtime.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Ticket Price</span>
                          <span className="text-white font-semibold">
                            ${state.selectedShowtime.price}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <BookingSummary
                    selectedSeats={state.selectedSeats}
                    totalPrice={state.totalPrice}
                    onProceed={handleProceedToPayment}
                    isProcessing={lockSeatsMutation.isPending}
                  />
                </div>

                {/* Seat Map */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-xl">Select Your Seats</CardTitle>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                          <span>Taken</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                          <span>Locked</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                          <span>Selected</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {seatsLoading ? (
                        <LoadingSkeleton className="h-96 w-full" />
                      ) : (
                        <SeatMap
                          seats={seats}
                          selectedSeats={state.selectedSeats}
                          onSeatSelect={handleSeatSelection}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Movie:</span>
                          <span>{state.selectedShowtime.movie.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cinema:</span>
                          <span>{state.selectedShowtime.cinema.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date & Time:</span>
                          <span>
                            {new Date(state.selectedShowtime.startTime).toLocaleDateString()} at{' '}
                            {new Date(state.selectedShowtime.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seats:</span>
                          <span>{state.selectedSeats.join(', ')}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-600">
                          <span>Total:</span>
                          <span>${state.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <CreditCard className="h-4 w-4" />
                      <AlertDescription>
                        This is a demo booking system. Payment processing is simulated.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-slate-700"
                      >
                        Back to Seats
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing || createBookingMutation.isPending}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessing || createBookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto text-center"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-12">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
                    <p className="text-gray-400 mb-8">
                      Your tickets have been successfully booked. You will receive a confirmation email shortly.
                    </p>
                    
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setLocation('/dashboard')}
                        className="flex-1 border-slate-700"
                      >
                        View Bookings
                      </Button>
                      <Button
                        onClick={() => setLocation('/')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        Book Another Movie
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
