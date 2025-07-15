import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Movie } from "@shared/schema";

interface MovieCarouselProps {
  movies: Movie[];
}

export default function MovieCarousel({ movies }: MovieCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    if (movies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === movies.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentIndex(currentIndex === movies.length - 1 ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? movies.length - 1 : currentIndex - 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="relative h-[70vh] bg-cinema-charcoal flex items-center justify-center">
        <p className="text-white text-xl">No featured movies available</p>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(45deg, rgba(15, 15, 15, 0.8), rgba(15, 15, 15, 0.4)), url(${currentMovie.posterUrl || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080'})`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-cinepolis-red text-white">
                  {currentMovie.status}
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  {currentMovie.title}
                </h1>
                <p className="text-lg text-gray-300 max-w-lg">
                  {currentMovie.description || "Experience this amazing movie in stunning quality with premium sound and visuals."}
                </p>
              </div>
              
              {/* Movie Details */}
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {currentMovie.genre}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {currentMovie.rating}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {currentMovie.duration}m
                </Badge>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="cinema-button"
                  onClick={() => window.location.href = `/movie/${currentMovie.id}`}
                >
                  Get Tickets
                </Button>
                {currentMovie.trailerUrl && (
                  <Button 
                    variant="outline" 
                    className="cinema-button-outline"
                    onClick={() => window.open(currentMovie.trailerUrl, '_blank')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
            
            {/* Movie Poster */}
            <div className="hidden lg:block">
              <img 
                src={currentMovie.posterUrl || "/placeholder-movie.jpg"} 
                alt={currentMovie.title}
                className="w-80 h-auto rounded-xl shadow-2xl mx-auto transition-opacity duration-1000"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex 
                ? 'bg-cinepolis-red' 
                : 'bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
