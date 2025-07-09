import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Movie, Cinema, Showtime, ShowtimeWithDetails } from '@shared/schema';

interface BookingState {
  selectedMovie: Movie | null;
  selectedCinema: Cinema | null;
  selectedShowtime: ShowtimeWithDetails | null;
  selectedSeats: string[];
  selectedDate: string;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

type BookingAction =
  | { type: 'SET_MOVIE'; payload: Movie }
  | { type: 'SET_CINEMA'; payload: Cinema }
  | { type: 'SET_SHOWTIME'; payload: ShowtimeWithDetails }
  | { type: 'SET_SEATS'; payload: string[] }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
  selectedMovie: null,
  selectedCinema: null,
  selectedShowtime: null,
  selectedSeats: [],
  selectedDate: '',
  totalPrice: 0,
  isLoading: false,
  error: null,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_MOVIE':
      return { ...state, selectedMovie: action.payload };
    case 'SET_CINEMA':
      return { ...state, selectedCinema: action.payload };
    case 'SET_SHOWTIME':
      return { 
        ...state, 
        selectedShowtime: action.payload,
        selectedMovie: action.payload.movie,
        selectedCinema: action.payload.cinema,
      };
    case 'SET_SEATS':
      const seats = action.payload;
      const price = state.selectedShowtime ? parseFloat(state.selectedShowtime.price) : 0;
      return { 
        ...state, 
        selectedSeats: seats,
        totalPrice: seats.length * price,
      };
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_BOOKING':
      return initialState;
    default:
      return state;
  }
}

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | null>(null);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
