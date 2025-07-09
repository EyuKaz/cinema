import { useState } from 'react';
import { ShowtimeWithDetails } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShowtimeSelectorProps {
  showtimes: ShowtimeWithDetails[];
  onSelectShowtime: (showtime: ShowtimeWithDetails) => void;
}

export default function ShowtimeSelector({ showtimes, onSelectShowtime }: ShowtimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Group showtimes by date
  const showtimesByDate = showtimes.reduce((acc, showtime) => {
    const date = new Date(showtime.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, ShowtimeWithDetails[]>);

  // Sort dates
  const sortedDates = Object.keys(showtimesByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Group by cinema for each date
  const getShowtimesByCinema = (dateShowtimes: ShowtimeWithDetails[]) => {
    return dateShowtimes.reduce((acc, showtime) => {
      const cinemaId = showtime.cinema.id;
      if (!acc[cinemaId]) {
        acc[cinemaId] = {
          cinema: showtime.cinema,
          showtimes: [],
        };
      }
      acc[cinemaId].showtimes.push(showtime);
      return acc;
    }, {} as Record<number, { cinema: any; showtimes: ShowtimeWithDetails[] }>);
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (sortedDates.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No showtimes available for this movie.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue={sortedDates[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-800 border-slate-700 mb-6">
          {sortedDates.slice(0, 6).map(date => (
            <TabsTrigger
              key={date}
              value={date}
              className="data-[state=active]:bg-purple-600 text-xs md:text-sm"
            >
              {formatDate(date)}
            </TabsTrigger>
          ))}
        </TabsList>

        {sortedDates.map(date => (
          <TabsContent key={date} value={date}>
            <div className="space-y-6">
              {Object.values(getShowtimesByCinema(showtimesByDate[date])).map(({ cinema, showtimes: cinemaShowtimes }) => (
                <motion.div
                  key={cinema.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      {/* Cinema Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{cinema.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{cinema.city}, {cinema.state}</span>
                            </div>
                            {cinema.rating && (
                              <div className="flex items-center gap-1">
                                <span>★</span>
                                <span>{cinema.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {cinemaShowtimes.length} show{cinemaShowtimes.length === 1 ? '' : 's'}
                        </Badge>
                      </div>

                      {/* Showtimes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cinemaShowtimes
                          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                          .map(showtime => (
                            <Card key={showtime.id} className="bg-slate-700/50 border-slate-600">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-cyan-400" />
                                    <span className="text-lg font-semibold text-white">
                                      {formatTime(showtime.startTime)}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="border-slate-500 text-xs">
                                    {showtime.auditorium.name}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>${showtime.price}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{showtime.availableSeats} seats</span>
                                  </div>
                                </div>

                                <Button
                                  onClick={() => onSelectShowtime(showtime)}
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                  disabled={showtime.availableSeats === 0}
                                >
                                  {showtime.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
