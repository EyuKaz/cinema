import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Film, Users, DollarSign, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const showtimeSchema = z.object({
  movieId: z.number(),
  auditoriumId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  price: z.number().min(0),
  date: z.string(),
});

type ShowtimeFormData = z.infer<typeof showtimeSchema>;

export default function CinemaOwnerDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Redirect if not authenticated or not cinema owner
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "cinema_owner")) {
      toast({
        title: "Unauthorized",
        description: "You need cinema owner privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/cinema-owner/dashboard"],
    enabled: isAuthenticated && user?.role === "cinema_owner",
    retry: false,
  });

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["/api/movies"],
    enabled: isAuthenticated && user?.role === "cinema_owner",
    retry: false,
  });

  const { data: showtimes = [], isLoading: showtimesLoading } = useQuery({
    queryKey: ["/api/showtimes", selectedCinema?.id, selectedDate],
    enabled: isAuthenticated && user?.role === "cinema_owner" && selectedCinema,
    retry: false,
  });

  // Forms
  const showtimeForm = useForm<ShowtimeFormData>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: 0,
      auditoriumId: 0,
      startTime: "",
      endTime: "",
      price: 0,
      date: selectedDate,
    },
  });

  // Mutations
  const createShowtimeMutation = useMutation({
    mutationFn: async (data: ShowtimeFormData) => {
      return await apiRequest("/api/cinema-owner/showtimes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      toast({
        title: "Success",
        description: "Showtime created successfully",
      });
      setIsShowtimeModalOpen(false);
      showtimeForm.reset();
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
        description: "Failed to create showtime",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShowtimeFormData) => {
    createShowtimeMutation.mutate(data);
  };

  if (isLoading || !isAuthenticated || user?.role !== "cinema_owner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const cinemas = dashboardData?.cinemas || [];
  const analytics = dashboardData?.analytics || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Cinema Owner Dashboard</h1>
              <p className="text-purple-200 mt-2">Manage your cinema operations</p>
            </div>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Cinema Owner
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${analytics.totalRevenue || 0}</div>
                <p className="text-xs text-purple-200">This month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-purple-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.totalBookings || 0}</div>
                <p className="text-xs text-purple-200">This month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">My Cinemas</CardTitle>
                <MapPin className="h-4 w-4 text-purple-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{cinemas.length}</div>
                <p className="text-xs text-purple-200">Active locations</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Occupancy Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.occupancyRate || 0}%</div>
                <p className="text-xs text-purple-200">Average this month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="cinemas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
              <TabsTrigger value="cinemas">My Cinemas</TabsTrigger>
              <TabsTrigger value="showtimes">Showtimes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="cinemas" className="space-y-6">
              <div className="grid gap-6">
                {cinemas.map((cinema: any) => (
                  <Card key={cinema.id} className="bg-white/10 border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">{cinema.name}</CardTitle>
                          <CardDescription className="text-purple-200">
                            {cinema.address}, {cinema.city}, {cinema.state}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white"
                          onClick={() => setSelectedCinema(cinema)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-purple-200">Auditoriums</p>
                          <p className="text-white font-semibold">{cinema.auditoriums?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-purple-200">Phone</p>
                          <p className="text-white font-semibold">{cinema.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-purple-200">Rating</p>
                          <p className="text-white font-semibold">{cinema.rating || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="showtimes" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <Label htmlFor="cinema-select" className="text-white">Select Cinema</Label>
                    <Select
                      value={selectedCinema?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const cinema = cinemas.find(c => c.id.toString() === value);
                        setSelectedCinema(cinema);
                      }}
                    >
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select cinema" />
                      </SelectTrigger>
                      <SelectContent>
                        {cinemas.map((cinema: any) => (
                          <SelectItem key={cinema.id} value={cinema.id.toString()}>
                            {cinema.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date-select" className="text-white">Date</Label>
                    <Input
                      id="date-select"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <Dialog open={isShowtimeModalOpen} onOpenChange={setIsShowtimeModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!selectedCinema}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Showtime
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Showtime</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={showtimeForm.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="movieId" className="text-white">Movie</Label>
                        <Select
                          value={showtimeForm.watch("movieId")?.toString()}
                          onValueChange={(value) => showtimeForm.setValue("movieId", parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select movie" />
                          </SelectTrigger>
                          <SelectContent>
                            {movies.map((movie: any) => (
                              <SelectItem key={movie.id} value={movie.id.toString()}>
                                {movie.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auditoriumId" className="text-white">Auditorium</Label>
                        <Select
                          value={showtimeForm.watch("auditoriumId")?.toString()}
                          onValueChange={(value) => showtimeForm.setValue("auditoriumId", parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select auditorium" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCinema?.auditoriums?.map((auditorium: any) => (
                              <SelectItem key={auditorium.id} value={auditorium.id.toString()}>
                                {auditorium.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startTime" className="text-white">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            {...showtimeForm.register("startTime")}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime" className="text-white">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            {...showtimeForm.register("endTime")}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-white">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...showtimeForm.register("price", { valueAsNumber: true })}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-white">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          {...showtimeForm.register("date")}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsShowtimeModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={createShowtimeMutation.isPending}
                        >
                          Create Showtime
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedCinema && (
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Showtimes for {selectedCinema.name} - {selectedDate}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white">Movie</TableHead>
                          <TableHead className="text-white">Auditorium</TableHead>
                          <TableHead className="text-white">Time</TableHead>
                          <TableHead className="text-white">Price</TableHead>
                          <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {showtimes.map((showtime: any) => (
                          <TableRow key={showtime.id}>
                            <TableCell className="text-white">{showtime.movie?.title}</TableCell>
                            <TableCell className="text-white">{showtime.auditorium?.name}</TableCell>
                            <TableCell className="text-white">
                              {showtime.startTime} - {showtime.endTime}
                            </TableCell>
                            <TableCell className="text-white">${showtime.price}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200">Analytics dashboard coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Cinema Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200">Settings panel coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}