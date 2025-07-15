import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play } from "lucide-react";
import { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
  isComingSoon?: boolean;
}

export default function MovieCard({ movie, isComingSoon = false }: MovieCardProps) {
  const handleGetTickets = () => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handleNotifyMe = () => {
    // Handle notify me for coming soon movies
    console.log("Notify me for:", movie.title);
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg shadow-lg movie-card">
        <img 
          src={movie.posterUrl || "/placeholder-movie.jpg"} 
          alt={movie.title}
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay */}
        <div className="movie-card-overlay">
          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              className={`w-full ${isComingSoon 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-cinepolis-red hover:bg-red-700'
              } text-white py-2 rounded-lg font-semibold transition-colors`}
              onClick={isComingSoon ? handleNotifyMe : handleGetTickets}
            >
              {isComingSoon ? "Notify Me" : "Get Tickets"}
            </Button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 right-2">
          {movie.rating && (
            <Badge className="bg-cinepolis-gold text-cinema-dark text-xs font-bold">
              {movie.rating}
            </Badge>
          )}
        </div>
        
        {isComingSoon && movie.releaseDate && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-cinepolis-gold text-cinema-dark text-xs font-bold">
              {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Movie Info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-white group-hover:text-cinepolis-gold transition-colors line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-sm text-gray-400">{movie.genre}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Star Rating (mock for now) */}
            <div className="flex text-cinepolis-gold text-xs">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3" />
            </div>
          </div>
          <span className="text-xs text-gray-500">{movie.duration}m</span>
        </div>
        
        {isComingSoon && movie.releaseDate && (
          <p className="text-xs text-gray-500">
            Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
