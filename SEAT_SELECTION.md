# Seat Selection System Guide

## Overview

The C Cinema application features a comprehensive seat selection system that allows users to visually choose their preferred seats for movie showtimes. The system tracks seat availability in real-time and prevents double bookings.

## How the Seat Map Works

### Frontend Layout

The seat map is implemented as a React component (`SeatMap.tsx`) that renders:

#### Theater Layout
- **10 Rows**: Labeled A through J (front to back)
- **12 Seats per Row**: Numbered 1-12 (left to right)
- **Visual Screen**: Shows the movie screen location
- **Seat Status Indicators**: Different colors for available, selected, and occupied seats

#### Seat Status Colors
- **Green**: Available seats (can be selected)
- **Gold**: Currently selected seats
- **Red**: Occupied/booked seats (cannot be selected)
- **Gray**: Disabled or out-of-service seats

### Interactive Features
- **Click to Select**: Users can click available seats to select them
- **Click to Deselect**: Clicking selected seats removes them from selection
- **Visual Feedback**: Seats scale and change color when selected
- **Hover Effects**: Available seats highlight on mouse hover

## Database Schema

### Showtimes Table
The seat availability is tracked in the `showtimes` table:

```sql
CREATE TABLE showtimes (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL,
  theater_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  available_seats INTEGER DEFAULT 100 NOT NULL,
  total_seats INTEGER DEFAULT 100 NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  seat_map JSONB, -- Store seat layout and availability
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table
Selected seats are stored in the `bookings` table:

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  showtime_id INTEGER NOT NULL,
  seat_numbers TEXT[], -- Array of selected seat numbers
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'confirmed',
  booked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Example Data

#### Showtime Record
```json
{
  "id": 1,
  "movieId": 1,
  "theaterId": 1,
  "date": "2025-01-20",
  "time": "19:30:00",
  "availableSeats": 95,
  "totalSeats": 120,
  "price": "12.50",
  "seatMap": {
    "layout": "standard",
    "rows": 10,
    "seatsPerRow": 12,
    "aisles": [6]
  }
}
```

#### Booking Record
```json
{
  "id": 1,
  "userId": "39729340",
  "showtimeId": 1,
  "seatNumbers": ["D5", "D6"],
  "totalAmount": "25.00",
  "status": "confirmed",
  "bookedAt": "2025-01-15T20:30:00Z"
}
```

## How Available/Occupied Seats Are Handled

### Frontend Process

1. **Load Showtime Data**: The booking page fetches showtime details including available seat count
2. **Fetch Booked Seats**: Query all existing bookings for the showtime to determine occupied seats
3. **Generate Seat Map**: Create visual representation showing available vs occupied seats
4. **Real-time Updates**: Seat availability updates immediately when selections change

### Backend Logic

#### Getting Booked Seats
```javascript
// Get all booked seats for a specific showtime
const bookedSeats = await db
  .select({ seatNumbers: bookings.seatNumbers })
  .from(bookings)
  .where(eq(bookings.showtimeId, showtimeId));

// Flatten the array of seat arrays
const occupiedSeats = bookedSeats
  .flatMap(booking => booking.seatNumbers || []);
```

#### Seat Status Determination
```javascript
const getSeatStatus = (seatNumber, selectedSeats, occupiedSeats) => {
  if (occupiedSeats.includes(seatNumber)) return 'occupied';
  if (selectedSeats.includes(seatNumber)) return 'selected';
  return 'available';
};
```

## How Selected Seats Are Sent to Backend

### Frontend Data Flow

1. **Seat Selection**: User clicks on available seats
2. **State Management**: Selected seats stored in React state
3. **Validation**: Ensure selected seats are still available
4. **Booking Submission**: Send booking data to backend API

### API Request Format

```javascript
// Booking API request
const bookingData = {
  showtimeId: 1,
  seatNumbers: ["D5", "D6"],
  totalAmount: 25.00
};

// POST /api/bookings
fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});
```

### Backend Processing

```javascript
// Create booking endpoint
app.post('/api/bookings', async (req, res) => {
  const { showtimeId, seatNumbers, totalAmount } = req.body;
  
  // Validate seat availability
  const bookedSeats = await getBookedSeatsForShowtime(showtimeId);
  const conflicts = seatNumbers.filter(seat => bookedSeats.includes(seat));
  
  if (conflicts.length > 0) {
    return res.status(400).json({ 
      error: 'Selected seats are no longer available',
      conflicts 
    });
  }
  
  // Create booking and update availability
  const booking = await storage.createBooking({
    userId: req.user.id,
    showtimeId,
    seatNumbers,
    totalAmount,
    status: 'confirmed'
  });
  
  res.json(booking);
});
```

## How Seat Availability Updates After Booking

### Automatic Updates

When a booking is successfully created:

1. **Seat Count Reduction**: Available seats count decreases by number of booked seats
2. **Database Update**: Showtime record updated with new available seat count
3. **Seat Tracking**: Booked seat numbers stored in booking record

### Update Process

```javascript
// Update seat availability in showtimes table
async updateSeatAvailability(showtimeId, seatsToBook) {
  const showtime = await db.select()
    .from(showtimes)
    .where(eq(showtimes.id, showtimeId));
  
  const newAvailableSeats = Math.max(0, 
    showtime.availableSeats - seatsToBook.length
  );
  
  await db.update(showtimes)
    .set({ 
      availableSeats: newAvailableSeats,
      updatedAt: new Date()
    })
    .where(eq(showtimes.id, showtimeId));
}
```

### Real-time Sync

- **Frontend Refresh**: After successful booking, user is redirected to dashboard
- **Cache Invalidation**: React Query cache is invalidated to fetch fresh data
- **Live Updates**: New users see updated seat availability immediately

## Component Integration

### SeatMap Component Usage

```jsx
import SeatMap from '@/components/SeatMap';

// In booking page
<SeatMap
  selectedSeats={selectedSeats}
  onSeatSelect={handleSeatSelect}
  availableSeats={showtime.availableSeats}
  bookedSeats={occupiedSeats}
  showtimeId={showtime.id}
/>
```

### State Management

```javascript
const [selectedSeats, setSelectedSeats] = useState([]);

const handleSeatSelect = (seatNumber) => {
  setSelectedSeats(prev => 
    prev.includes(seatNumber)
      ? prev.filter(seat => seat !== seatNumber)
      : [...prev, seatNumber]
  );
};
```

## Known Limitations

### Current Limitations

1. **Static Theater Layout**: All theaters use the same 10x12 seat configuration
2. **No Seat Types**: All seats are treated equally (no premium/standard distinction)
3. **Basic Validation**: Limited seat conflict resolution
4. **No Hold System**: Seats aren't temporarily reserved during selection

### Future Enhancements

1. **Dynamic Layouts**: Support for different theater configurations
2. **Seat Categories**: Premium, standard, accessible seating options
3. **Temporary Holds**: Reserve seats for a few minutes during booking process
4. **Real-time Updates**: WebSocket integration for live seat availability
5. **Seat Preferences**: Remember user seating preferences

## Error Handling

### Common Scenarios

#### Seat Already Booked
```json
{
  "error": "Selected seats are no longer available",
  "conflicts": ["D5", "D6"],
  "availableAlternatives": ["D7", "D8"]
}
```

#### Showtime Full
```json
{
  "error": "Showtime is fully booked",
  "availableSeats": 0,
  "alternativeShowtimes": [...]
}
```

#### Invalid Seat Selection
```json
{
  "error": "Invalid seat numbers provided",
  "invalidSeats": ["Z99"],
  "validRange": "A1-J12"
}
```

## Testing the System

### Manual Testing Steps

1. **Load Booking Page**: Navigate to `/booking/:showtimeId`
2. **Select Seats**: Click on available (green) seats
3. **Verify Selection**: Selected seats turn gold and show in summary
4. **Test Conflicts**: Try selecting occupied (red) seats
5. **Complete Booking**: Submit booking and verify seat count updates
6. **Check Database**: Verify booking record and seat availability

### Database Queries for Testing

```sql
-- Check seat availability
SELECT id, available_seats, total_seats 
FROM showtimes 
WHERE id = 1;

-- View all bookings for a showtime
SELECT id, user_id, seat_numbers, total_amount 
FROM bookings 
WHERE showtime_id = 1;

-- Get occupied seats
SELECT UNNEST(seat_numbers) as occupied_seat 
FROM bookings 
WHERE showtime_id = 1 AND status = 'confirmed';
```

---

**Note**: The seat selection system is designed to be scalable and can be extended to support more complex theater layouts and seating options as needed.