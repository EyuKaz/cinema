import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TheaterCard from "@/components/TheaterCard";
import { Theater } from "@shared/schema";

export default function Theaters() {
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

  const { data: theaters = [], isLoading: theatersLoading } = useQuery<Theater[]>({
    queryKey: ["/api/theaters"],
    retry: false,
  });

  if (isLoading || theatersLoading) {
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
            <h1 className="text-4xl font-bold text-white mb-4">Theater Locations</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience premium cinema at our luxury locations across the country. 
              Each theater features state-of-the-art technology and comfortable seating.
            </p>
          </div>
        </div>
      </section>

      {/* Theaters Grid */}
      <section className="py-16 bg-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {theaters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No theaters available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {theaters.map((theater) => (
                <TheaterCard key={theater.id} theater={theater} showDetails />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
