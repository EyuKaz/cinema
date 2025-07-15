import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeatMap from "@/components/SeatMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CreditCard } from "lucide-react";

export default function Booking() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const showtimeId = params.showtimeId;
  const queryClient = useQueryClient();
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState(1); // 1: seat selection, 2: payment

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

  const { data: showtime, isLoading: showtimeLoading } = useQuery<any>({
    queryKey: ["/api/showtimes", showtimeId],
    retry: false,
    enabled: !!showtimeId,
  });

  const { data: bookedSeatsData } = useQuery<{bookedSeats: string[]}>({
    queryKey: ["/api/showtimes", showtimeId, "booked-seats"],
    retry: false,
    enabled: !!showtimeId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return await apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your tickets have been successfully booked.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      window.location.href = "/dashboard";
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
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(seat => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to continue.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = selectedSeats.length * parseFloat(showtime.price);
    
    bookingMutation.mutate({
      showtimeId: parseInt(showtimeId!),
      seatNumbers: selectedSeats,
      totalAmount: totalAmount.toString(),
    });
  };

  if (isLoading || showtimeLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-screen bg-cinema-dark">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Showtime not found</h1>
            <p className="text-gray-400">The showtime you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalAmount = selectedSeats.length * parseFloat(showtime.price);

  return (
    <div className="min-h-screen bg-cinema-dark">
      <Header />
      
      {/* Booking Header */}
      <section className="py-8 bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Book Your Tickets</h1>
            <div className="flex items-center justify-center gap-4 text-gray-400">
              <Badge variant="outline" className="border-gray-600">
                Step {step} of 2
              </Badge>
              <span>{step === 1 ? "Seat Selection" : "Payment"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="bg-cinema-charcoal border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Select Your Seats</CardTitle>
                </CardHeader>
                <CardContent>
                  <SeatMap
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    availableSeats={showtime.availableSeats}
                    bookedSeats={bookedSeatsData?.bookedSeats || []}
                    showtimeId={showtime.id}
                  />
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-cinema-charcoal border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white">First Name</Label>
                        <Input id="firstName" className="bg-cinema-dark border-gray-600 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white">Last Name</Label>
                        <Input id="lastName" className="bg-cinema-dark border-gray-600 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input id="email" type="email" className="bg-cinema-dark border-gray-600 text-white" />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="bg-cinema-dark border-gray-600 text-white" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry" className="text-white">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" className="bg-cinema-dark border-gray-600 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-white">CVV</Label>
                        <Input id="cvv" placeholder="123" className="bg-cinema-dark border-gray-600 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cinema-dark p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">
                      <strong>Note:</strong> This is a demo payment form. No actual payment will be processed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-cinema-charcoal border-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={showtime.movie.posterUrl || "/placeholder-movie.jpg"} 
                    alt={showtime.movie.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{showtime.movie.title}</h3>
                    <p className="text-gray-400 text-sm">{showtime.movie.rating} • {showtime.movie.duration}m</p>
                  </div>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{showtime.theater.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(showtime.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{showtime.time}</span>
                  </div>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span>Seats:</span>
                    <span>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Price per ticket:</span>
                    <span>${showtime.price}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Quantity:</span>
                    <span>{selectedSeats.length}</span>
                  </div>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="flex justify-between text-lg font-semibold text-white">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  {step === 1 && (
                    <Button 
                      className="w-full bg-cinepolis-red hover:bg-red-700 text-white"
                      onClick={() => setStep(2)}
                      disabled={selectedSeats.length === 0}
                    >
                      Continue to Payment
                    </Button>
                  )}
                  
                  {step === 2 && (
                    <>
                      <Button 
                        className="w-full bg-cinepolis-red hover:bg-red-700 text-white"
                        onClick={handleBooking}
                        disabled={bookingMutation.isPending}
                      >
                        {bookingMutation.isPending ? "Processing..." : "Complete Booking"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 text-white"
                        onClick={() => setStep(1)}
                      >
                        Back to Seat Selection
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
