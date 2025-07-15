import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMovieSchema, insertTheaterSchema, insertShowtimeSchema } from "@shared/schema";
import { Movie, Theater, Booking } from "@shared/schema";
import { Film, MapPin, Calendar, Users, Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { z } from "zod";

const movieFormSchema = insertMovieSchema.extend({
  cast: z.string().optional(),
});

const theaterFormSchema = insertTheaterSchema;

const showtimeFormSchema = insertShowtimeSchema.extend({
  date: z.string(),
  time: z.string(),
});

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Queries
  const { data: movies = [], isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
    retry: false,
  });

  const { data: theaters = [], isLoading: theatersLoading } = useQuery<Theater[]>({
    queryKey: ["/api/theaters"],
    retry: false,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/bookings/all"],
    retry: false,
  });

  const { data: showtimes = [], isLoading: showtimesLoading } = useQuery<any[]>({
    queryKey: ["/api/showtimes"],
    retry: false,
  });

  // Movie mutations
  const createMovieMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/movies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({ title: "Movie created successfully!" });
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
      toast({ title: "Failed to create movie", variant: "destructive" });
    },
  });

  const updateMovieMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/movies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({ title: "Movie updated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to update movie", variant: "destructive" });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/movies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({ title: "Movie deleted successfully!" });
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
      toast({ title: "Failed to delete movie", variant: "destructive" });
    },
  });

  // Theater mutations
  const createTheaterMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/theaters", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theaters"] });
      toast({ title: "Theater created successfully!" });
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
      toast({ title: "Failed to create theater", variant: "destructive" });
    },
  });

  const updateTheaterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/theaters/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theaters"] });
      toast({ title: "Theater updated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to update theater", variant: "destructive" });
    },
  });

  const deleteTheaterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/theaters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theaters"] });
      toast({ title: "Theater deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete theater", variant: "destructive" });
    },
  });

  // Showtime mutations
  const createShowtimeMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/showtimes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      toast({ title: "Showtime created successfully!" });
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
      toast({ title: "Failed to create showtime", variant: "destructive" });
    },
  });

  const updateShowtimeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/showtimes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      toast({ title: "Showtime updated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to update showtime", variant: "destructive" });
    },
  });

  const deleteShowtimeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/showtimes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      toast({ title: "Showtime deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete showtime", variant: "destructive" });
    },
  });

  if (isLoading || moviesLoading || theatersLoading || bookingsLoading || showtimesLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0);
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;

  return (
    <div className="min-h-screen bg-cinema-dark">
      <Header />
      
      {/* Admin Header */}
      <section className="py-16 bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-cinepolis-red rounded-full p-3">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Manage movies, theaters, showtimes, and bookings</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cinepolis-red rounded-full p-2">
                    <Film className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Movies</p>
                    <p className="text-2xl font-bold text-white">{movies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cinepolis-gold rounded-full p-2">
                    <MapPin className="h-5 w-5 text-cinema-dark" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Theaters</p>
                    <p className="text-2xl font-bold text-white">{theaters.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Active Bookings</p>
                    <p className="text-2xl font-bold text-white">{confirmedBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-dark border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 rounded-full p-2">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-16 bg-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-cinema-charcoal">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="theaters">Theaters</TabsTrigger>
              <TabsTrigger value="showtimes">Showtimes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <Card className="bg-cinema-charcoal border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-cinema-dark rounded-lg">
                          <div>
                            <p className="text-white font-medium">{booking.showtime.movie.title}</p>
                            <p className="text-gray-400 text-sm">{booking.user?.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-cinepolis-gold font-semibold">${booking.totalAmount}</p>
                            <Badge className={booking.status === "confirmed" ? "bg-green-600" : "bg-red-600"}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Movies */}
                <Card className="bg-cinema-charcoal border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Popular Movies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {movies.slice(0, 5).map((movie) => (
                        <div key={movie.id} className="flex items-center gap-3 p-3 bg-cinema-dark rounded-lg">
                          <img 
                            src={movie.posterUrl || "/placeholder-movie.jpg"} 
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="text-white font-medium">{movie.title}</p>
                            <p className="text-gray-400 text-sm">{movie.genre} • {movie.rating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="movies" className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Movies</h2>
                <MovieForm 
                  onSubmit={(data) => createMovieMutation.mutate(data)}
                  isPending={createMovieMutation.isPending}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie) => (
                  <Card key={movie.id} className="bg-cinema-charcoal border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={movie.posterUrl || "/placeholder-movie.jpg"} 
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{movie.title}</h3>
                          <p className="text-gray-400 text-sm mb-2">{movie.genre} • {movie.rating}</p>
                          <Badge className={movie.status === "Now Playing" ? "bg-green-600" : "bg-blue-600"}>
                            {movie.status}
                          </Badge>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="border-gray-600 text-white">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-600 text-red-400 hover:bg-red-600"
                              onClick={() => deleteMovieMutation.mutate(movie.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="theaters" className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Theaters</h2>
                <TheaterForm 
                  onSubmit={(data) => createTheaterMutation.mutate(data)}
                  isPending={createTheaterMutation.isPending}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {theaters.map((theater) => (
                  <Card key={theater.id} className="bg-cinema-charcoal border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-white mb-2">{theater.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{theater.address}</p>
                      {theater.phone && (
                        <p className="text-gray-400 text-sm mb-4">{theater.phone}</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-white">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="showtimes" className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Showtimes</h2>
                <ShowtimeForm 
                  movies={movies}
                  theaters={theaters}
                  onSubmit={(data) => createShowtimeMutation.mutate(data)}
                  isPending={createShowtimeMutation.isPending}
                />
              </div>
              
              <div className="space-y-4">
                {showtimes.map((showtime) => (
                  <Card key={showtime.id} className="bg-cinema-charcoal border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={showtime.movie.posterUrl || "/placeholder-movie.jpg"} 
                            alt={showtime.movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-semibold text-white">{showtime.movie.title}</h3>
                            <p className="text-gray-400 text-sm">{showtime.theater.name}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(showtime.date).toLocaleDateString()} at {showtime.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-cinepolis-gold font-semibold">${showtime.price}</p>
                          <p className="text-gray-400 text-sm">{showtime.availableSeats} seats</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MovieForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      duration: 0,
      rating: "",
      posterUrl: "",
      trailerUrl: "",
      cast: "",
      status: "Now Playing",
    },
  });

  const handleSubmit = (values: any) => {
    const submitData = {
      ...values,
      cast: values.cast ? values.cast.split(",").map((c: string) => c.trim()) : [],
    };
    onSubmit(submitData);
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-cinepolis-red hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-cinema-charcoal border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Movie</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-cinema-dark border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-cinema-dark border-gray-600">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                        <SelectItem value="PG-13">PG-13</SelectItem>
                        <SelectItem value="R">R</SelectItem>
                        <SelectItem value="NC-17">NC-17</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-cinema-dark border-gray-600">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Now Playing">Now Playing</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="posterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poster URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-cinema-dark border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cast"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cast (comma separated)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-cinema-dark border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending} className="w-full bg-cinepolis-red hover:bg-red-700">
              {isPending ? "Creating..." : "Create Movie"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TheaterForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(theaterFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      mapLink: "",
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-cinepolis-red hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Theater
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-cinema-charcoal border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New Theater</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-cinema-dark border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-cinema-dark border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-cinema-dark border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending} className="w-full bg-cinepolis-red hover:bg-red-700">
              {isPending ? "Creating..." : "Create Theater"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ShowtimeForm({ 
  movies, 
  theaters, 
  onSubmit, 
  isPending 
}: { 
  movies: Movie[]; 
  theaters: Theater[]; 
  onSubmit: (data: any) => void; 
  isPending: boolean; 
}) {
  const form = useForm({
    resolver: zodResolver(showtimeFormSchema),
    defaultValues: {
      movieId: 0,
      theaterId: 0,
      date: "",
      time: "",
      price: "0",
      availableSeats: 100,
    },
  });

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      movieId: parseInt(values.movieId),
      theaterId: parseInt(values.theaterId),
    });
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-cinepolis-red hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Showtime
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-cinema-charcoal border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New Showtime</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="movieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movie</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-cinema-dark border-gray-600">
                          <SelectValue placeholder="Select movie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {movies.map((movie) => (
                          <SelectItem key={movie.id} value={movie.id.toString()}>
                            {movie.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theaterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theater</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-cinema-dark border-gray-600">
                          <SelectValue placeholder="Select theater" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {theaters.map((theater) => (
                          <SelectItem key={theater.id} value={theater.id.toString()}>
                            {theater.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availableSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Seats</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-cinema-dark border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isPending} className="w-full bg-cinepolis-red hover:bg-red-700">
              {isPending ? "Creating..." : "Create Showtime"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
