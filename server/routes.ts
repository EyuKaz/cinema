import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertShowtimeSchema, insertBookingSchema, insertMovieSchema, insertCinemaSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient extends WebSocket {
  showtimeId?: number;
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Movie routes
  app.get('/api/movies', async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get('/api/movies/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      const movies = await storage.searchMovies(q);
      res.json(movies);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  app.post('/api/movies', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'cinema_owner')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  // Cinema routes
  app.get('/api/cinemas', async (req, res) => {
    try {
      const cinemas = await storage.getCinemas();
      res.json(cinemas);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
      res.status(500).json({ message: "Failed to fetch cinemas" });
    }
  });

  app.get('/api/cinemas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cinema = await storage.getCinema(id);
      if (!cinema) {
        return res.status(404).json({ message: "Cinema not found" });
      }
      res.json(cinema);
    } catch (error) {
      console.error("Error fetching cinema:", error);
      res.status(500).json({ message: "Failed to fetch cinema" });
    }
  });

  app.post('/api/cinemas', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'cinema_owner')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const validatedData = insertCinemaSchema.parse({
        ...req.body,
        ownerId: req.user.claims.sub,
      });
      const cinema = await storage.createCinema(validatedData);
      res.status(201).json(cinema);
    } catch (error) {
      console.error("Error creating cinema:", error);
      res.status(500).json({ message: "Failed to create cinema" });
    }
  });

  // Showtime routes
  app.get('/api/showtimes', async (req, res) => {
    try {
      const { movieId, cinemaId, date } = req.query;
      const showtimes = await storage.getShowtimes(
        movieId ? parseInt(movieId as string) : undefined,
        cinemaId ? parseInt(cinemaId as string) : undefined,
        date as string
      );
      res.json(showtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get('/api/showtimes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const showtime = await storage.getShowtime(id);
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      res.json(showtime);
    } catch (error) {
      console.error("Error fetching showtime:", error);
      res.status(500).json({ message: "Failed to fetch showtime" });
    }
  });

  app.post('/api/showtimes', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'cinema_owner')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const validatedData = insertShowtimeSchema.parse(req.body);
      const showtime = await storage.createShowtime(validatedData);
      res.status(201).json(showtime);
    } catch (error) {
      console.error("Error creating showtime:", error);
      res.status(500).json({ message: "Failed to create showtime" });
    }
  });

  // Seat routes
  app.get('/api/showtimes/:id/seats', async (req, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      const seats = await storage.getSeats(showtimeId);
      res.json(seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      res.status(500).json({ message: "Failed to fetch seats" });
    }
  });

  app.post('/api/showtimes/:id/seats/lock', isAuthenticated, async (req: any, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      const { seatNumbers } = req.body;
      const userId = req.user.claims.sub;

      if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(400).json({ message: "Invalid seat numbers" });
      }

      await storage.lockSeats(showtimeId, seatNumbers, userId);
      
      // Broadcast seat lock to all clients watching this showtime
      broadcastSeatUpdate(showtimeId, seatNumbers, 'locked');
      
      res.json({ message: "Seats locked successfully" });
    } catch (error) {
      console.error("Error locking seats:", error);
      res.status(500).json({ message: "Failed to lock seats" });
    }
  });

  app.post('/api/showtimes/:id/seats/unlock', isAuthenticated, async (req: any, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      const { seatNumbers } = req.body;

      if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(400).json({ message: "Invalid seat numbers" });
      }

      await storage.unlockSeats(showtimeId, seatNumbers);
      
      // Broadcast seat unlock to all clients watching this showtime
      broadcastSeatUpdate(showtimeId, seatNumbers, 'available');
      
      res.json({ message: "Seats unlocked successfully" });
    } catch (error) {
      console.error("Error unlocking seats:", error);
      res.status(500).json({ message: "Failed to unlock seats" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = {
        ...req.body,
        userId,
        bookingReference: `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      
      // Book the seats
      await storage.bookSeats(booking.showtimeId, booking.seats as string[], booking.id);
      
      // Broadcast seat booking to all clients watching this showtime
      broadcastSeatUpdate(booking.showtimeId, booking.seats as string[], 'taken');
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Get booking to verify ownership
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.userId !== userId) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.cancelBooking(bookingId);
      
      // Unlock the seats
      await storage.unlockSeats(booking.showtimeId, booking.seats as string[]);
      
      // Broadcast seat unlock to all clients watching this showtime
      broadcastSeatUpdate(booking.showtimeId, booking.seats as string[], 'available');
      
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Admin routes
  app.get("/api/admin/cinemas", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const cinemas = await storage.getCinemas();
      res.json(cinemas);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
      res.status(500).json({ message: "Failed to fetch cinemas" });
    }
  });

  app.get("/api/admin/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const logs = await storage.getAdminAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Cinema owner routes
  app.get("/api/cinema-owner/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "cinema_owner") {
        return res.status(403).json({ message: "Cinema owner access required" });
      }
      const cinemas = await storage.getCinemasByOwner(user.id);
      res.json({ cinemas, analytics: { totalRevenue: 0, totalBookings: 0 } });
    } catch (error) {
      console.error("Error fetching cinema owner dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get('/api/owner/cinemas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'cinema_owner') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const cinemas = await storage.getCinemasByOwner(userId);
      res.json(cinemas);
    } catch (error) {
      console.error("Error fetching owner cinemas:", error);
      res.status(500).json({ message: "Failed to fetch cinemas" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time seat updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, Set<WebSocketClient>>();

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('New WebSocket connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'join_showtime') {
          const { showtimeId, userId } = data;
          ws.showtimeId = showtimeId;
          ws.userId = userId;
          
          if (!clients.has(showtimeId)) {
            clients.set(showtimeId, new Set());
          }
          clients.get(showtimeId)!.add(ws);
          
          console.log(`User ${userId} joined showtime ${showtimeId}`);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (ws.showtimeId) {
        const showtimeClients = clients.get(ws.showtimeId.toString());
        if (showtimeClients) {
          showtimeClients.delete(ws);
          if (showtimeClients.size === 0) {
            clients.delete(ws.showtimeId.toString());
          }
        }
      }
    });
  });

  function broadcastSeatUpdate(showtimeId: number, seatNumbers: string[], status: string) {
    const showtimeClients = clients.get(showtimeId.toString());
    if (showtimeClients) {
      const message = JSON.stringify({
        type: 'seat_update',
        showtimeId,
        seatNumbers,
        status,
      });

      showtimeClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // Cleanup expired locks every 5 minutes
  setInterval(async () => {
    try {
      await storage.cleanupExpiredLocks();
    } catch (error) {
      console.error('Error cleaning up expired locks:', error);
    }
  }, 5 * 60 * 1000);

  return httpServer;
}
