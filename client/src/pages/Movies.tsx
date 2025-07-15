import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Movie } from "@shared/schema";
import { Search } from "lucide-react";

export default function Movies() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  const { data: movies = [], isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
    retry: false,
  });

  // Filter movies based on search and filters
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesStatus = selectedStatus === "all" || movie.status === selectedStatus;
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Get unique genres for filter
  const genres = [...new Set(movies.map(movie => movie.genre))];

  if (isLoading || moviesLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-dark">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">All Movies</h1>
            <p className="text-gray-400 text-lg">
              Discover the latest blockbusters and upcoming releases
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cinema-dark border-gray-600 text-white"
                />
              </div>
              
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full md:w-48 bg-cinema-dark border-gray-600 text-white">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48 bg-cinema-dark border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movies</SelectItem>
                  <SelectItem value="Now Playing">Now Playing</SelectItem>
                  <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="py-16 bg-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  isComingSoon={movie.status === "Coming Soon"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
