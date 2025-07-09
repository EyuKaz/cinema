import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Ticket, Users, DollarSign } from 'lucide-react';

interface BookingSummaryProps {
  selectedSeats: string[];
  totalPrice: number;
  onProceed: () => void;
  isProcessing?: boolean;
}

export default function BookingSummary({ 
  selectedSeats, 
  totalPrice, 
  onProceed, 
  isProcessing = false 
}: BookingSummaryProps) {
  const seatCount = selectedSeats.length;
  const pricePerSeat = seatCount > 0 ? totalPrice / seatCount : 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Ticket className="h-5 w-5 text-purple-400" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Seats */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">Selected Seats</span>
          </div>
          {seatCount === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No seats selected</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {selectedSeats.map(seat => (
                <div
                  key={seat}
                  className="bg-purple-600/20 text-purple-400 text-xs font-medium py-1 px-2 rounded text-center"
                >
                  {seat}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-slate-700" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Price Details</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Seats ({seatCount})</span>
              <span className="text-gray-300">{seatCount} × ${pricePerSeat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-gray-300">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Taxes & Fees</span>
              <span className="text-gray-300">$0.00</span>
            </div>
          </div>
          
          <Separator className="bg-slate-700" />
          
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Total</span>
            <span className="text-white">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <Button
          onClick={onProceed}
          disabled={seatCount === 0 || isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 h-auto"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            `Proceed to Payment (${seatCount} seat${seatCount === 1 ? '' : 's'})`
          )}
        </Button>

        {/* Terms */}
        <div className="text-xs text-gray-400 text-center">
          <p>
            By proceeding, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
