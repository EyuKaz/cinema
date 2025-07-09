import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Movie, ShowtimeWithDetails } from '@shared/schema';
import { Calendar, Clock, Star, Play, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useBooking } from '@/contexts/BookingContext';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShowtimeSelector from '@/components/ShowtimeSelector';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { dispatch } = useBooking();

  const { data: movie, isLoading: movieLoading } = useQuery<Movie>({
    queryKey: ['/api/movies', id],
    enabled: !!id,
  });

  const { data: showtimes = [], isLoading: showtimesLoading } = useQuery<ShowtimeWithDetails[]>({
    queryKey: ['/api/showtimes', { movieId: id }],
    enabled: !!id,
  });

  const handleBooking = (showtime: ShowtimeWithDetails) => {
    dispatch({ type: 'SET_SHOWTIME', payload: showtime });
    setLocation('/booking');
  };

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <LoadingSkeleton className="h-96 rounded-2xl" />
              <div className="lg:col-span-2 space-y-4">
                <LoadingSkeleton className="h-8 w-3/4" />
                <LoadingSkeleton className="h-4 w-1/2" />
                <LoadingSkeleton className="h-24 w-full" />
                <LoadingSkeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
              <p className="text-gray-400">The movie you're looking for doesn't exist.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="pt-16">
        {/* Movie Details */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Movie Poster */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={movie.posterUrl || `https://images.unsplash.com/photo-1489599128765-1e7fa10e9d5c?w=400&h=600&fit=crop`}
                      alt={movie.title}
                      className="w-full h-[600px] object-cover"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-4xl font-bold">{movie.title}</h1>
                    {movie.imdbRating && (
                      <div className="flex items-center gap-1 bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{movie.imdbRating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Badge variant="secondary">{movie.genre}</Badge>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{movie.duration} min</span>
                    </div>
                    {movie.rating && (
                      <Badge variant="outline" className="border-slate-600">
                        {movie.rating}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {movie.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {movie.director && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Director</h3>
                        <p className="text-white">{movie.director}</p>
                      </div>
                    )}
                    {movie.cast && movie.cast.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Cast</h3>
                        <p className="text-white">{movie.cast.join(', ')}</p>
                      </div>
                    )}
                    {movie.language && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Language</h3>
                        <p className="text-white">{movie.language}</p>
                      </div>
                    )}
                    {movie.releaseDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Release Date</h3>
                        <p className="text-white">
                          {new Date(movie.releaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {movie.trailerUrl && (
                    <div className="mt-6">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => window.open(movie.trailerUrl, '_blank')}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Trailer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Showtimes */}
        <section className="py-12 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-center">Available Showtimes</h2>
              
              {showtimesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <LoadingSkeleton key={i} className="h-48" />
                  ))}
                </div>
              ) : showtimes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No showtimes available for this movie.</p>
                </div>
              ) : (
                <ShowtimeSelector
                  showtimes={showtimes}
                  onSelectShowtime={handleBooking}
                />
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
