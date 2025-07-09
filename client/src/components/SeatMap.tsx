import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Seat } from '@shared/schema';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatNumbers: string[]) => void;
}

export default function SeatMap({ seats, selectedSeats, onSeatSelect }: SeatMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows alphabetically
  const sortedRows = Object.keys(seatsByRow).sort();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'taken') return;
    
    let newSelectedSeats: string[];
    
    if (selectedSeats.includes(seat.seatNumber)) {
      // Deselect seat
      newSelectedSeats = selectedSeats.filter(s => s !== seat.seatNumber);
    } else {
      // Select seat
      newSelectedSeats = [...selectedSeats, seat.seatNumber];
    }
    
    onSeatSelect(newSelectedSeats);
  };

  const getSeatClassName = (seat: Seat) => {
    if (selectedSeats.includes(seat.seatNumber)) {
      return 'seat-selected';
    }
    
    switch (seat.status) {
      case 'available':
        return 'seat-available';
      case 'taken':
        return 'seat-taken';
      case 'locked':
        return 'seat-locked';
      default:
        return 'seat-available';
    }
  };

  const getSeatIcon = (seat: Seat) => {
    if (seat.status === 'taken') return '✕';
    if (selectedSeats.includes(seat.seatNumber)) return '✓';
    if (seat.status === 'locked') return '🔒';
    return seat.seatNumber.slice(-1); // Show seat number
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Screen */}
      <div className="mb-8">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full mb-2 shadow-lg shadow-cyan-400/50"></div>
        <p className="text-center text-sm text-gray-400 font-medium">SCREEN</p>
      </div>

      {/* Seat Map */}
      <div className="space-y-3 mb-8">
        {sortedRows.map(row => {
          const rowSeats = seatsByRow[row].sort((a, b) => 
            parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1))
          );
          
          return (
            <div key={row} className="flex items-center justify-center gap-2">
              {/* Row Label */}
              <div className="w-6 text-center text-sm text-gray-400 font-medium">
                {row}
              </div>
              
              {/* Seats */}
              <div className="flex gap-1 flex-wrap justify-center">
                {rowSeats.map((seat, index) => {
                  // Add gap in the middle for aisle
                  const isMiddleBreak = index === Math.floor(rowSeats.length / 2);
                  
                  return (
                    <div key={seat.id} className="flex items-center">
                      {isMiddleBreak && <div className="w-8"></div>}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-8 h-8 p-0 rounded text-xs font-medium transition-all duration-200',
                          getSeatClassName(seat),
                          seat.status !== 'taken' && 'seat-hover hover:scale-110 hover:shadow-md',
                          hoveredSeat === seat.seatNumber && 'ring-2 ring-white/50'
                        )}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => setHoveredSeat(seat.seatNumber)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={seat.status === 'taken'}
                        title={`Seat ${seat.seatNumber} - ${seat.status}`}
                      >
                        {getSeatIcon(seat)}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded seat-available"></div>
          <span className="text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded seat-taken"></div>
          <span className="text-gray-400">Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded seat-locked"></div>
          <span className="text-gray-400">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded seat-selected"></div>
          <span className="text-gray-400">Selected</span>
        </div>
      </div>
    </div>
  );
}
