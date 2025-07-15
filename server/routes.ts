import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { 
  insertMovieSchema, 
  insertTheaterSchema, 
  insertShowtimeSchema, 
  insertBookingSchema,
  insertContactMessageSchema 
} from "@shared/schema";

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

  // Admin setup route (for initial admin creation)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.setUserRole(userId, "admin");
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
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(400).json({ message: "Invalid contact message data" });
    }
  });

  // Admin contact routes
  app.get("/api/admin/contact-messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.patch("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedMessage = await storage.updateContactMessage(id, req.body);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContactMessage(id);
      if (!success) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json({ message: "Contact message deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Movies routes
  app.get('/api/movies', async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const movie = await storage.getMovie(parseInt(req.params.id));
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // Admin movie routes
  app.post("/api/admin/movies", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(400).json({ message: "Invalid movie data" });
    }
  });

  app.put("/api/admin/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMovieSchema.partial().parse(req.body);
      const movie = await storage.updateMovie(id, validatedData);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(400).json({ message: "Invalid movie data" });
    }
  });

  app.delete("/api/admin/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMovie(id);
      if (!success) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  // Theater routes
  app.get('/api/theaters', async (req, res) => {
    try {
      const theaters = await storage.getTheaters();
      res.json(theaters);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });

  app.get('/api/theaters/:id', async (req, res) => {
    try {
      const theater = await storage.getTheater(parseInt(req.params.id));
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      res.json(theater);
    } catch (error) {
      console.error("Error fetching theater:", error);
      res.status(500).json({ message: "Failed to fetch theater" });
    }
  });

  // Admin only theater routes
  app.post('/api/theaters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const theaterData = insertTheaterSchema.parse(req.body);
      const theater = await storage.createTheater(theaterData);
      res.status(201).json(theater);
    } catch (error) {
      console.error("Error creating theater:", error);
      res.status(500).json({ message: "Failed to create theater" });
    }
  });

  app.put('/api/theaters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const theaterData = insertTheaterSchema.partial().parse(req.body);
      const theater = await storage.updateTheater(parseInt(req.params.id), theaterData);
      
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      
      res.json(theater);
    } catch (error) {
      console.error("Error updating theater:", error);
      res.status(500).json({ message: "Failed to update theater" });
    }
  });

  app.delete('/api/theaters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteTheater(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Theater not found" });
      }
      
      res.json({ message: "Theater deleted successfully" });
    } catch (error) {
      console.error("Error deleting theater:", error);
      res.status(500).json({ message: "Failed to delete theater" });
    }
  });

  // Showtime routes
  app.get('/api/showtimes', async (req, res) => {
    try {
      const showtimes = await storage.getShowtimes();
      res.json(showtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get('/api/showtimes/movie/:movieId', async (req, res) => {
    try {
      const showtimes = await storage.getShowtimesByMovie(parseInt(req.params.movieId));
      res.json(showtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get('/api/showtimes/theater/:theaterId', async (req, res) => {
    try {
      const showtimes = await storage.getShowtimesByTheater(parseInt(req.params.theaterId));
      res.json(showtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get('/api/showtimes/:id', async (req, res) => {
    try {
      const showtime = await storage.getShowtime(parseInt(req.params.id));
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      res.json(showtime);
    } catch (error) {
      console.error("Error fetching showtime:", error);
      res.status(500).json({ message: "Failed to fetch showtime" });
    }
  });

  // Admin only showtime routes
  app.post('/api/showtimes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const showtimeData = insertShowtimeSchema.parse(req.body);
      const showtime = await storage.createShowtime(showtimeData);
      res.status(201).json(showtime);
    } catch (error) {
      console.error("Error creating showtime:", error);
      res.status(500).json({ message: "Failed to create showtime" });
    }
  });

  app.put('/api/showtimes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const showtimeData = insertShowtimeSchema.partial().parse(req.body);
      const showtime = await storage.updateShowtime(parseInt(req.params.id), showtimeData);
      
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      
      res.json(showtime);
    } catch (error) {
      console.error("Error updating showtime:", error);
      res.status(500).json({ message: "Failed to update showtime" });
    }
  });

  app.delete('/api/showtimes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteShowtime(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      
      res.json({ message: "Showtime deleted successfully" });
    } catch (error) {
      console.error("Error deleting showtime:", error);
      res.status(500).json({ message: "Failed to delete showtime" });
    }
  });

  // Booking routes
  app.get('/api/bookings/my-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const userId = req.user.claims.sub;
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user owns this booking or is admin
      const user = await storage.getUser(userId);
      if (booking.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Admin only - get all bookings
  app.get('/api/bookings/all', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin CRUD routes
  app.post('/api/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (error: any) {
      console.error("Error creating movie:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid movie data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.put('/api/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const movieData = insertMovieSchema.partial().parse(req.body);
      const movie = await storage.updateMovie(id, movieData);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error: any) {
      console.error("Error updating movie:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid movie data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete('/api/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const success = await storage.deleteMovie(id);
      
      if (!success) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  // Admin Theater CRUD
  app.post('/api/admin/theaters', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const theaterData = insertTheaterSchema.parse(req.body);
      const theater = await storage.createTheater(theaterData);
      res.status(201).json(theater);
    } catch (error: any) {
      console.error("Error creating theater:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create theater" });
    }
  });

  app.put('/api/admin/theaters/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid theater ID" });
      }
      
      const theaterData = insertTheaterSchema.partial().parse(req.body);
      const theater = await storage.updateTheater(id, theaterData);
      
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      
      res.json(theater);
    } catch (error: any) {
      console.error("Error updating theater:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update theater" });
    }
  });

  app.delete('/api/admin/theaters/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid theater ID" });
      }
      
      const success = await storage.deleteTheater(id);
      
      if (!success) {
        return res.status(404).json({ message: "Theater not found" });
      }
      
      res.json({ message: "Theater deleted successfully" });
    } catch (error) {
      console.error("Error deleting theater:", error);
      res.status(500).json({ message: "Failed to delete theater" });
    }
  });

  // Admin Showtime CRUD
  app.post('/api/admin/showtimes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const showtimeData = insertShowtimeSchema.parse(req.body);
      const showtime = await storage.createShowtime(showtimeData);
      res.status(201).json(showtime);
    } catch (error: any) {
      console.error("Error creating showtime:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid showtime data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create showtime" });
    }
  });

  app.put('/api/admin/showtimes/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
      }
      
      const showtimeData = insertShowtimeSchema.partial().parse(req.body);
      const showtime = await storage.updateShowtime(id, showtimeData);
      
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      
      res.json(showtime);
    } catch (error: any) {
      console.error("Error updating showtime:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid showtime data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update showtime" });
    }
  });

  app.delete('/api/admin/showtimes/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
      }
      
      const success = await storage.deleteShowtime(id);
      
      if (!success) {
        return res.status(404).json({ message: "Showtime not found" });
      }
      
      res.json({ message: "Showtime deleted successfully" });
    } catch (error) {
      console.error("Error deleting showtime:", error);
      res.status(500).json({ message: "Failed to delete showtime" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
