import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Star, Play } from "lucide-react";
import { Movie } from "@shared/schema";

export default function MovieDetails() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const movieId = params.id;

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

  const { data: movie, isLoading: movieLoading } = useQuery<Movie>({
    queryKey: ["/api/movies", movieId],
    retry: false,
  });

  const { data: showtimes = [], isLoading: showtimesLoading } = useQuery<any[]>({
    queryKey: ["/api/showtimes/movie", movieId],
    retry: false,
    enabled: !!movieId,
  });

  if (isLoading || movieLoading || showtimesLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-cinema-dark">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
            <p className="text-gray-400">The movie you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Group showtimes by theater and date
  const showtimesByTheater = showtimes.reduce((acc, showtime) => {
    const theaterName = showtime.theater.name;
    if (!acc[theaterName]) {
      acc[theaterName] = {
        theater: showtime.theater,
        dates: {}
      };
    }
    
    const date = showtime.date;
    if (!acc[theaterName].dates[date]) {
      acc[theaterName].dates[date] = [];
    }
    
    acc[theaterName].dates[date].push(showtime);
    return acc;
  }, {} as any);

  return (
    <div className="min-h-screen bg-cinema-dark">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-cinepolis-red text-white">
                  {movie.status}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  {movie.title}
                </h1>
                <p className="text-lg text-gray-300">
                  {movie.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {movie.genre}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {movie.rating}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {movie.duration}m
                </Badge>
                {movie.releaseDate && (
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cast</h3>
                  <p className="text-gray-300">{movie.cast.join(", ")}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                {movie.status === "Now Playing" && (
                  <Button className="bg-cinepolis-red hover:bg-red-700 text-white">
                    Buy Tickets
                  </Button>
                )}
                {movie.trailerUrl && (
                  <Button variant="outline" className="border-gray-600 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <img 
                src={movie.posterUrl || "/placeholder-movie.jpg"} 
                alt={movie.title}
                className="w-80 h-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes Section */}
      {movie.status === "Now Playing" && showtimes.length > 0 && (
        <section className="py-16 bg-cinema-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8">Showtimes</h2>
            
            <div className="space-y-6">
              {Object.entries(showtimesByTheater).map(([theaterName, theaterData]: [string, any]) => (
                <Card key={theaterName} className="bg-cinema-charcoal border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">{theaterName}</h3>
                    <p className="text-gray-400 mb-4">{theaterData.theater.address}</p>
                    
                    <div className="space-y-4">
                      {Object.entries(theaterData.dates).map(([date, times]: [string, any]) => (
                        <div key={date}>
                          <h4 className="text-lg font-medium text-white mb-2">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {times.map((showtime: any) => (
                              <Button
                                key={showtime.id}
                                variant="outline"
                                className="border-gray-600 text-white hover:bg-cinepolis-red hover:border-cinepolis-red"
                                onClick={() => window.location.href = `/booking/${showtime.id}`}
                              >
                                {showtime.time} - ${showtime.price}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
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
