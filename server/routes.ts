import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { Auth } from "better-auth";
import {
  insertMovieSchema,
  insertTheaterSchema,
  insertShowtimeSchema,
  insertBookingSchema,
  insertContactMessageSchema,
  users,
  movies,
  theaters,
  showtimes,
  bookings,
  contactMessages,
} from "@shared/schema";

// Initialize auth instance
const auth = new Auth();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes are handled by Better Auth middleware
  // No need for setupAuth, isAuthenticated, or isAdmin

  // Auth user route
  app.get("/api/auth/user", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(session.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin setup route
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { userId } = req.body;
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user || session.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [user] = await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Admin role granted successfully", user });
    } catch (error) {
      console.error("Error setting admin role:", error);
      res.status(500).json({ message: "Failed to set admin role" });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const [message] = await db
        .insert(contactMessages)
        .values(validatedData)
        .returning();
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(400).json({ message: "Invalid contact message data" });
    }
  });

  // Admin contact routes
  app.get("/api/admin/contact-messages", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const messages = await db.select().from(contactMessages);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.patch("/api/admin/contact-messages/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const [updatedMessage] = await db
        .update(contactMessages)
        .set(req.body)
        .where(eq(contactMessages.id, id))
        .returning();
      if (!updatedMessage) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const [deleted] = await db
        .delete(contactMessages)
        .where(eq(contactMessages.id, id))
        .returning();
      if (!deleted) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json({ message: "Contact message deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Movies routes
  app.get("/api/movies", async (req, res) => {
    try {
      const moviesList = await db.select().from(movies);
      res.json(moviesList);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [movie] = await db.select().from(movies).where(eq(movies.id, id));
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  app.post("/api/admin/movies", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const validatedData = insertMovieSchema.parse(req.body);
      const [movie] = await db.insert(movies).values(validatedData).returning();
      res.status(201).json(movie);
    } catch (error: any) {
      console.error("Error creating movie:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid movie data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.put("/api/admin/movies/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const validatedData = insertMovieSchema.partial().parse(req.body);
      const [movie] = await db
        .update(movies)
        .set(validatedData)
        .where(eq(movies.id, id))
        .returning();
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error: any) {
      console.error("Error updating movie:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid movie data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete("/api/admin/movies/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const [deleted] = await db
        .delete(movies)
        .where(eq(movies.id, id))
        .returning();
      if (!deleted) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  // Theater routes
  app.get("/api/theaters", async (req, res) => {
    try {
      const theatersList = await db.select().from(theaters);
      res.json(theatersList);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });

  app.get("/api/theaters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      res.json(theater);
    } catch (error) {
      console.error("Error fetching theater:", error);
      res.status(500).json({ message: "Failed to fetch theater" });
    }
  });

  app.post("/api/admin/theaters", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const theaterData = insertTheaterSchema.parse(req.body);
      const [theater] = await db.insert(theaters).values(theaterData).returning();
      res.status(201).json(theater);
    } catch (error: any) {
      console.error("Error creating theater:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create theater" });
    }
  });

  app.put("/api/admin/theaters/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const theaterData = insertTheaterSchema.partial().parse(req.body);
      const [theater] = await db
        .update(theaters)
        .set(theaterData)
        .where(eq(theaters.id, id))
        .returning();
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      res.json(theater);
    } catch (error: any) {
      console.error("Error updating theater:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update theater" });
    }
  });

  app.delete("/api/admin/theaters/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const [deleted] = await db
        .delete(theaters)
        .where(eq(theaters.id, id))
        .returning();
      if (!deleted) {
        return res.status(404).json({ message: "Theater not found" });
      }
      res.json({ message: "Theater deleted successfully" });
    } catch (error) {
      console.error("Error deleting theater:", error);
      res.status(500).json({ message: "Failed to delete theater" });
    }
  });

  // Showtime routes
  app.get("/api/showtimes", async (req, res) => {
    try {
      const showtimesList = await db.select().from(showtimes);
      res.json(showtimesList);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get("/api/showtimes/movie/:movieId", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const showtimesList = await db
        .select()
        .from(showtimes)
        .where(eq(showtimes.movieId, movieId));
      res.json(showtimesList);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get("/api/showtimes/theater/:theaterId", async (req, res) => {
    try {
      const theaterId = parseInt(req.params.theaterId);
      const showtimesList = await db
        .select()
        .from(showtimes)
        .where(eq(showtimes.theaterId, theaterId));
      res.json(showtimesList);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get("/api/showtimes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, id));
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      res.json(showtime);
    } catch (error) {
      console.error("Error fetching showtime:", error);
      res.status(500).json({ message: "Failed to fetch showtime" });
    }
  });

  app.post("/api/admin/showtimes", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const showtimeData = insertShowtimeSchema.parse(req.body);
      const [showtime] = await db.insert(showtimes).values(showtimeData).returning();
      res.status(201).json(showtime);
    } catch (error: any) {
      console.error("Error creating showtime:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid showtime data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create showtime" });
    }
  });

  app.put("/api/admin/showtimes/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const showtimeData = insertShowtimeSchema.partial().parse(req.body);
      const [showtime] = await db
        .update(showtimes)
        .set(showtimeData)
        .where(eq(showtimes.id, id))
        .returning();
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      res.json(showtime);
    } catch (error: any) {
      console.error("Error updating showtime:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid showtime data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update showtime" });
    }
  });

  app.delete("/api/admin/showtimes/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const [deleted] = await db
        .delete(showtimes)
        .where(eq(showtimes.id, id))
        .returning();
      if (!deleted) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      res.json({ message: "Showtime deleted successfully" });
    } catch (error) {
      console.error("Error deleting showtime:", error);
      res.status(500).json({ message: "Failed to delete showtime" });
    }
  });

  // Booking routes
  app.get("/api/bookings/my-bookings", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const bookingsList = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, session.user.id));
      res.json(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: session.user.id,
      });
      const [booking] = await db.insert(bookings).values(bookingData).returning();
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.userId !== session.user.id && session.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.get("/api/bookings/all", async (req, res) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user || session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const bookingsList = await db.select().from(bookings);
      res.json(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}