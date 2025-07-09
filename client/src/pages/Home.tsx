import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Movie, Cinema } from '@shared/schema';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import CinemaCard from '@/components/CinemaCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: movies = [], isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });

  const { data: cinemas = [], isLoading: cinemasLoading } = useQuery<Cinema[]>({
    queryKey: ['/api/cinemas'],
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies/search', { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  const filteredMovies = searchQuery ? searchResults : movies.filter(movie => {
    const genreMatch = selectedGenre === 'all' || movie.genre === selectedGenre;
    return genreMatch;
  });

  const filteredCinemas = cinemas.filter(cinema => {
    const cityMatch = selectedCity === 'all' || cinema.city === selectedCity;
    return cityMatch;
  });

  const uniqueGenres = [...new Set(movies.map(movie => movie.genre))];
  const uniqueCities = [...new Set(cinemas.map(cinema => cinema.city))];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Discover Your Next
                <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Cinema Adventure
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Browse movies and cinemas, find perfect showtimes, and book your seats instantly.
              </p>
            </motion.div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search movies, genres, or actors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-gray-400 pl-10 h-12"
                  />
                </div>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white h-12">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {uniqueGenres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white h-12">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="movies" className="w-full">
              <div className="flex items-center justify-between mb-8">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="movies" className="data-[state=active]:bg-purple-600">
                    Movies ({filteredMovies.length})
                  </TabsTrigger>
                  <TabsTrigger value="cinemas" className="data-[state=active]:bg-purple-600">
                    Cinemas ({filteredCinemas.length})
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="border-slate-700"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="border-slate-700"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="movies">
                {moviesLoading || searchLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <LoadingSkeleton key={i} className="h-96" />
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredMovies.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <MovieCard movie={movie} variant={viewMode} />
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {!moviesLoading && !searchLoading && filteredMovies.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cinemas">
                {cinemasLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <LoadingSkeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredCinemas.map((cinema, index) => (
                      <motion.div
                        key={cinema.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <CinemaCard cinema={cinema} variant={viewMode} />
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {!cinemasLoading && filteredCinemas.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No cinemas found in the selected city.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
