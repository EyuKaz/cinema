import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated } from "./auth.js";
import {
  insertShowtimeSchema,
  insertBookingSchema,
  insertMovieSchema,
  insertCinemaSchema,
  insertCommissionRateSchema,
  auditoriums,
  showtimes,
  cinemas,
  commissionRates,
  adminAuditLogs,
  bookings,
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db.js";
import { eq } from "drizzle-orm";

interface WebSocketClient extends WebSocket {
  showtimeId?: number;
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const movies = await storage.searchMovies(q);
      res.json(movies);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
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

  app.post("/api/movies", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || (user.role !== "admin" && user.role !== "cinema_owner")) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.status(201).json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.get("/api/cinemas", async (req, res) => {
    try {
      const cinemas = await storage.getCinemas();
      res.json(cinemas);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
      res.status(500).json({ message: "Failed to fetch cinemas" });
    }
  });

  app.get("/api/cinemas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cinema ID" });
      }
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

  app.post("/api/cinemas", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || (user.role !== "admin" && user.role !== "cinema_owner")) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const validatedData = insertCinemaSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const cinema = await storage.createCinema(validatedData);
      res.status(201).json(cinema);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating cinema:", error);
      res.status(500).json({ message: "Failed to create cinema" });
    }
  });

  app.get("/api/showtimes", async (req, res) => {
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

  app.get("/api/showtimes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
      }
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

  app.post("/api/showtimes", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || (user.role !== "admin" && user.role !== "cinema_owner")) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const validatedData = insertShowtimeSchema.parse(req.body);
      const showtime = await storage.createShowtime(validatedData);
      res.status(201).json(showtime);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating showtime:", error);
      res.status(500).json({ message: "Failed to create showtime" });
    }
  });

  app.get("/api/showtimes/:id/seats", async (req, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      if (isNaN(showtimeId)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
      }
      const seats = await storage.getSeats(showtimeId);
      res.json(seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      res.status(500).json({ message: "Failed to fetch seats" });
    }
  });

  app.post("/api/showtimes/:id/seats/lock", isAuthenticated, async (req: any, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      if (isNaN(showtimeId)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
      }
      const { seatNumbers } = req.body;
      const userId = req.user.id;

      if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(400).json({ message: "Invalid seat numbers" });
      }

      await storage.lockSeats(showtimeId, seatNumbers, userId);
      broadcastSeatUpdate(showtimeId, seatNumbers, "locked");
      res.json({ message: "Seats locked successfully" });
    } catch (error) {
      console.error("Error locking seats:", error);
      res.status(500).json({ message: "Failed to lock seats" });
    }
  });

  app.post("/api/showtimes/:id/seats/unlock", isAuthenticated, async (req: any, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      if (isNaN(showtimeId)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
      }
      const { seatNumbers } = req.body;

      if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(400).json({ message: "Invalid seat numbers" });
      }

      await storage.unlockSeats(showtimeId, seatNumbers);
      broadcastSeatUpdate(showtimeId, seatNumbers, "available");
      res.json({ message: "Seats unlocked successfully" });
    } catch (error) {
      console.error("Error unlocking seats:", error);
      res.status(500).json({ message: "Failed to unlock seats" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingData = {
        ...req.body,
        userId,
        bookingReference: `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      };
      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      
      await storage.bookSeats(booking.showtimeId, booking.seats as string[], booking.id);
      broadcastSeatUpdate(booking.showtimeId, booking.seats as string[], "taken");
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      const userId = req.user.id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.userId !== userId) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.cancelBooking(bookingId);
      await storage.unlockSeats(booking.showtimeId, booking.seats as string[]);
      broadcastSeatUpdate(booking.showtimeId, booking.seats as string[], "available");
      
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Admin routes
  app.get("/api/admin/cinemas", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
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
      const user = await storage.getUser(req.user.id);
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
      const user = await storage.getUser(req.user.id);
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
      const user = await storage.getUser(req.user.id);
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

  app.post("/api/admin/commission", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const validatedData = insertCommissionRateSchema.parse(req.body);
      
      await db
        .insert(commissionRates)
        .values(validatedData)
        .onConflictDoUpdate({
          target: commissionRates.cinemaId,
          set: { rate: validatedData.rate, effectiveDate: new Date() },
        });

      await db.insert(adminAuditLogs).values({
        adminId: user.id,
        action: "update_commission",
        details: JSON.stringify(validatedData),
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating commission:", error);
      res.status(500).json({ message: "Failed to update commission" });
    }
  });

  // Cinema owner routes
  app.get("/api/cinema-owner/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
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

  app.get("/api/owner/cinemas", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "cinema_owner") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const cinemas = await storage.getCinemasByOwner(userId);
      res.json(cinemas);
    } catch (error) {
      console.error("Error fetching owner cinemas:", error);
      res.status(500).json({ message: "Failed to fetch cinemas" });
    }
  });

  app.patch("/api/cinema/seats", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "cinema_owner") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const { auditoriumId, seatLayout, cinemaId } = req.body;
      
      const cinema = await db
        .select()
        .from(cinemas)
        .where(eq(cinemas.id, cinemaId));

      if (!cinema.length || cinema[0].ownerId !== user.id) {
        return res.status(403).json({ message: "Cinema not owned" });
      }

      await db
        .update(auditoriums)
        .set({ seatLayout })
        .where(eq(auditoriums.id, auditoriumId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating seats:", error);
      res.status(500).json({ message: "Failed to update seats" });
    }
  });

  app.post("/api/cinema/pricing", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "cinema_owner") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      // Implement your pricing logic here
      res.json({ success: true, message: "Pricing endpoint not yet implemented." });
    } catch (error) {
      console.error("Error updating pricing:", error);
      res.status(500).json({ message: "Failed to update pricing" });
    }
  });

  app.get("/api/cinema/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "cinema_owner") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const cinemaId = parseInt(req.query.cinemaId as string);
      
      if (isNaN(cinemaId)) {
        return res.status(400).json({ message: "Invalid cinema ID" });
      }

      // Get all bookings for this cinema
      const bookingResults = await db
        .select()
        .from(bookings)
        .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
        .where(eq(showtimes.cinemaId, cinemaId));

      const analytics = {
        ticketsSold: bookingResults.length,
        revenue: bookingResults.reduce(
          (sum: number, result: any) => sum + parseFloat(result.bookings.totalAmount),
          0
        ),
        byDay: bookingResults.reduce((acc: Record<string, number>, result: any) => {
          const createdAt = result.bookings.createdAt;
          const day = createdAt 
            ? new Date(createdAt).toLocaleDateString("en-US", { weekday: "short" })
            : "Unknown";
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {}),
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Map<string, Set<WebSocketClient>>();

  wss.on("connection", (ws: WebSocketClient) => {
    console.log("New WebSocket connection");

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "join_showtime") {
          const { showtimeId, userId } = data;
          ws.showtimeId = showtimeId;
          ws.userId = userId;

          if (!clients.has(showtimeId.toString())) {
            clients.set(showtimeId.toString(), new Set());
          }
          clients.get(showtimeId.toString())!.add(ws);
          console.log(`User ${userId} joined showtime ${showtimeId}`);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    ws.on("close", () => {
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

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  function broadcastSeatUpdate(showtimeId: number, seatNumbers: string[], status: string) {
    const showtimeClients = clients.get(showtimeId.toString());
    if (showtimeClients) {
      const message = JSON.stringify({
        type: "seat_update",
        showtimeId,
        seatNumbers,
        status,
      });
      
      showtimeClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
          } catch (error) {
            console.error("Error sending WebSocket message:", error);
          }
        }
      });
    }
  }

  // Cleanup expired locks every 5 minutes
  setInterval(async () => {
    try {
      await storage.cleanupExpiredLocks();
    } catch (error) {
      console.error("Error cleaning up expired locks:", error);
    }
  }, 5 * 60 * 1000);

  return httpServer;
}