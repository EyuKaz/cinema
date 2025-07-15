import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCarousel from "@/components/MovieCarousel";
import MovieCard from "@/components/MovieCard";
import TheaterCard from "@/components/TheaterCard";
import PromotionCard from "@/components/PromotionCard";
import { Movie, Theater } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: theaters = [], isLoading: theatersLoading } = useQuery<Theater[]>({
    queryKey: ["/api/theaters"],
    retry: false,
  });

  const nowPlaying = movies.filter(movie => movie.status === "Now Playing");
  const comingSoon = movies.filter(movie => movie.status === "Coming Soon");

  if (isLoading || moviesLoading || theatersLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-dark">
      <Header />
      
      {/* Hero Carousel */}
      <section className="relative">
        <MovieCarousel movies={nowPlaying.slice(0, 5)} />
      </section>

      {/* Now Playing Section */}
      <section className="cinema-section bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="cinema-section-title">Now Playing</h2>
            <a href="/movies" className="text-cinepolis-gold hover:text-yellow-400 transition-colors font-semibold">
              See All Movies →
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {nowPlaying.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="cinema-section bg-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="cinema-section-title">Coming Soon</h2>
            <a href="/movies" className="text-cinepolis-gold hover:text-yellow-400 transition-colors font-semibold">
              View All →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} isComingSoon />
            ))}
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="cinema-section bg-cinema-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="cinema-section-title text-center">Current Promotions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PromotionCard
              title="Happy Hour"
              description="Monday-Friday until 6PM and ALL DAY Tuesdays!"
              icon="clock"
              color="red"
              buttonText="Learn More"
            />
            <PromotionCard
              title="Daily Deals"
              description="Discounted tickets on Tuesdays, HALF OFF candy & more!"
              icon="percent"
              color="gold"
              buttonText="Get Deals"
            />
            <PromotionCard
              title="Rewards"
              description="Earn points towards FREE tickets and exclusive offers!"
              icon="gift"
              color="purple"
              buttonText="Sign Up"
            />
            <PromotionCard
              title="Handpicked"
              description="$5 movies every week! Check out our curated selection."
              icon="hand"
              color="green"
              buttonText="Browse $5 Movies"
            />
          </div>
        </div>
      </section>

      {/* Theater Locations Section */}
      <section className="cinema-section bg-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="cinema-section-title">Find Your Theater</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience premium cinema at our luxury locations across the country
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.slice(0, 3).map((theater) => (
              <TheaterCard key={theater.id} theater={theater} />
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="/theaters" className="cinema-button inline-block">
              View All Locations
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
