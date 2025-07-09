import { Cinema } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Phone, Car } from 'lucide-react';
import { motion } from 'framer-motion';

interface CinemaCardProps {
  cinema: Cinema;
  variant?: 'grid' | 'list';
}

export default function CinemaCard({ cinema, variant = 'grid' }: CinemaCardProps) {
  const cinemaImage = `https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=400&fit=crop`;

  if (variant === 'list') {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <img
                src={cinemaImage}
                alt={cinema.name}
                className="w-32 h-24 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{cinema.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="text-gray-400 text-sm">{cinema.city}, {cinema.state}</span>
                  </div>
                </div>
                {cinema.rating && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm">{cinema.rating}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {cinema.description}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  View Showtimes
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600">
                  Details
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
              src={cinemaImage}
              alt={cinema.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4">
              {cinema.rating && (
                <div className="flex items-center gap-1 bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">{cinema.rating}</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
              {cinema.name}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">{cinema.city}, {cinema.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{cinema.address}</span>
              </div>
              {cinema.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-400 text-sm">{cinema.phone}</span>
                </div>
              )}
            </div>
            
            {cinema.amenities && cinema.amenities.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {cinema.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="border-slate-600 text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {cinema.amenities.length > 3 && (
                    <Badge variant="outline" className="border-slate-600 text-xs">
                      +{cinema.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {cinema.description}
            </p>
            
            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-cyan-600 transition-all duration-300">
                View Showtimes
              </Button>
              <Button variant="outline" className="border-slate-600">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
