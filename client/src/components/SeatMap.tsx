import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SeatMapProps {
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  availableSeats: number;
}

export default function SeatMap({ selectedSeats, onSeatSelect, availableSeats }: SeatMapProps) {
  // Generate seat layout (10 rows, 12 seats per row)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  
  // Simulate some occupied seats (in a real app, this would come from the API)
  const occupiedSeats = ['A3', 'A4', 'B5', 'C7', 'D8', 'E9', 'F2', 'G6'];

  const getSeatStatus = (seatNumber: string) => {
    if (occupiedSeats.includes(seatNumber)) return 'occupied';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-600 cursor-not-allowed';
      case 'selected':
        return 'bg-cinepolis-gold text-cinema-dark cursor-pointer';
      case 'available':
        return 'bg-gray-600 hover:bg-gray-500 cursor-pointer';
      default:
        return 'bg-gray-600';
    }
  };

  const handleSeatClick = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber);
    if (status !== 'occupied') {
      onSeatSelect(seatNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-gray-700 via-gray-400 to-gray-700 h-2 rounded-full mb-2 mx-auto max-w-80"></div>
        <p className="text-gray-400 text-sm">SCREEN</p>
      </div>
      
      {/* Seat Map */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-center gap-2">
            {/* Row Label */}
            <div className="w-6 text-center text-gray-400 font-medium">
              {row}
            </div>
            
            {/* Seats */}
            <div className="flex gap-1">
              {Array.from({ length: seatsPerRow }, (_, index) => {
                const seatNumber = `${row}${index + 1}`;
                const status = getSeatStatus(seatNumber);
                
                return (
                  <button
                    key={seatNumber}
                    className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-colors ${getSeatColor(status)}`}
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={status === 'occupied'}
                    title={`Seat ${seatNumber} - ${status}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Aisle break after seat 6 */}
            {seatsPerRow > 6 && (
              <div className="w-4"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-t"></div>
          <span className="text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cinepolis-gold rounded-t"></div>
          <span className="text-gray-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded-t"></div>
          <span className="text-gray-400">Occupied</span>
        </div>
      </div>
      
      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-cinema-dark p-4 rounded-lg">
          <p className="text-white font-medium">Selected Seats: {selectedSeats.join(', ')}</p>
          <p className="text-gray-400 text-sm">Total: {selectedSeats.length} seat(s)</p>
        </div>
      )}
    </div>
  );
}
