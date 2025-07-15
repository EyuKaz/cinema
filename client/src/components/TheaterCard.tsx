import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Navigation } from "lucide-react";
import { Theater } from "@shared/schema";

interface TheaterCardProps {
  theater: Theater;
  showDetails?: boolean;
}

export default function TheaterCard({ theater, showDetails = false }: TheaterCardProps) {
  const handleViewShowtimes = () => {
    window.location.href = `/theaters/${theater.id}/showtimes`;
  };

  const handleGetDirections = () => {
    if (theater.mapLink) {
      window.open(theater.mapLink, '_blank');
    } else {
      // Fallback to Google Maps search
      const encodedAddress = encodeURIComponent(theater.address);
      window.open(`https://maps.google.com?q=${encodedAddress}`, '_blank');
    }
  };

  return (
    <Card className="bg-cinema-charcoal border-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {/* Theater Image */}
      {theater.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={theater.imageUrl} 
            alt={`${theater.name} theater exterior`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Theater Name */}
          <h3 className="text-xl font-semibold text-white">
            {theater.name}
          </h3>
          
          {/* Address */}
          <div className="flex items-start gap-2 text-gray-400 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{theater.address}</span>
          </div>
          
          {/* Phone */}
          {theater.phone && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Phone className="h-4 w-4" />
              <a 
                href={`tel:${theater.phone}`}
                className="hover:text-white transition-colors"
              >
                {theater.phone}
              </a>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              className="bg-cinepolis-red hover:bg-red-700 text-white flex-1"
              onClick={handleViewShowtimes}
            >
              View Showtimes
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white flex-1"
              onClick={handleGetDirections}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
          </div>
          
          {/* Additional Details for detailed view */}
          {showDetails && (
            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-1">Features</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Luxury Reclining Seats</li>
                    <li>• IMAX Theater</li>
                    <li>• Dolby Atmos Sound</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Amenities</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Full Bar & Grill</li>
                    <li>• Reserved Seating</li>
                    <li>• Parking Available</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
