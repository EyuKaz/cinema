import { Link } from 'wouter';
import { Movie } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
  variant?: 'grid' | 'list';
}

export default function MovieCard({ movie, variant = 'grid' }: MovieCardProps) {
  const posterUrl = movie.posterUrl || `https://images.unsplash.com/photo-1489599128765-1e7fa10e9d5c?w=400&h=600&fit=crop`;

  if (variant === 'list') {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-24 h-36 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{movie.title}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary">{movie.genre}</Badge>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{movie.duration} min</span>
                    </div>
                    {movie.imdbRating && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{movie.imdbRating}</span>
                      </div>
                    )}
                  </div>
                </div>
                {movie.rating && (
                  <Badge variant="outline" className="border-slate-600">
                    {movie.rating}
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {movie.description}
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Link href={`/movie/${movie.id}`}>
                    <Play className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
    >
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden hover:bg-slate-800/70 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/25">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4">
              {movie.imdbRating && (
                <div className="flex items-center gap-1 bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">{movie.imdbRating}</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {movie.genre}
                </Badge>
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{movie.duration}m</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">
                {movie.director && `Directed by ${movie.director}`}
              </span>
              {movie.rating && (
                <Badge variant="outline" className="border-slate-600 text-xs">
                  {movie.rating}
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {movie.description}
            </p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-cyan-600 transition-all duration-300">
              <Link href={`/movie/${movie.id}`}>
                <Play className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
