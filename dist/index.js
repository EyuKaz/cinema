var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bookingRelations: () => bookingRelations,
  bookings: () => bookings,
  contactMessages: () => contactMessages,
  insertBookingSchema: () => insertBookingSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertMovieSchema: () => insertMovieSchema,
  insertShowtimeSchema: () => insertShowtimeSchema,
  insertTheaterSchema: () => insertTheaterSchema,
  movieRelations: () => movieRelations,
  movies: () => movies,
  sessions: () => sessions,
  showtimeRelations: () => showtimeRelations,
  showtimes: () => showtimes,
  theaterRelations: () => theaterRelations,
  theaters: () => theaters,
  userRelations: () => userRelations,
  users: () => users
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  time
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(),
  // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  genre: varchar("genre").notNull(),
  duration: integer("duration").notNull(),
  // in minutes
  rating: varchar("rating").notNull(),
  // PG, PG-13, R, etc.
  posterUrl: varchar("poster_url"),
  trailerUrl: varchar("trailer_url"),
  cast: text("cast").array(),
  status: varchar("status").default("Now Playing").notNull(),
  // Now Playing, Coming Soon
  releaseDate: date("release_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var theaters = pgTable("theaters", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  phone: varchar("phone"),
  mapLink: varchar("map_link"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => movies.id),
  theaterId: integer("theater_id").notNull().references(() => theaters.id),
  date: date("date").notNull(),
  time: time("time").notNull(),
  availableSeats: integer("available_seats").default(100).notNull(),
  totalSeats: integer("total_seats").default(100).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  seatMap: jsonb("seat_map"),
  // Store seat layout and availability
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  showtimeId: integer("showtime_id").notNull().references(() => showtimes.id),
  seatNumbers: text("seat_numbers").array(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("confirmed").notNull(),
  // confirmed, canceled
  bookedAt: timestamp("booked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("unread").notNull(),
  // unread, read, responded
  createdAt: timestamp("created_at").defaultNow()
});
var movieRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes)
}));
var theaterRelations = relations(theaters, ({ many }) => ({
  showtimes: many(showtimes)
}));
var showtimeRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id]
  }),
  theater: one(theaters, {
    fields: [showtimes.theaterId],
    references: [theaters.id]
  }),
  bookings: many(bookings)
}));
var bookingRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id]
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id]
  })
}));
var userRelations = relations(users, ({ many }) => ({
  bookings: many(bookings)
}));
var insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTheaterSchema = createInsertSchema(theaters).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertShowtimeSchema = createInsertSchema(showtimes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  bookedAt: true
});
var insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, asc, and } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async setUserRole(id, role) {
    const [user] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  // Movie operations
  async getMovies() {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }
  async getMovie(id) {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }
  async createMovie(movie) {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }
  async updateMovie(id, movie) {
    const [updatedMovie] = await db.update(movies).set({ ...movie, updatedAt: /* @__PURE__ */ new Date() }).where(eq(movies.id, id)).returning();
    return updatedMovie;
  }
  async deleteMovie(id) {
    const result = await db.delete(movies).where(eq(movies.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Theater operations
  async getTheaters() {
    return await db.select().from(theaters).orderBy(asc(theaters.name));
  }
  async getTheater(id) {
    const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
    return theater;
  }
  async createTheater(theater) {
    const [newTheater] = await db.insert(theaters).values(theater).returning();
    return newTheater;
  }
  async updateTheater(id, theater) {
    const [updatedTheater] = await db.update(theaters).set({ ...theater, updatedAt: /* @__PURE__ */ new Date() }).where(eq(theaters.id, id)).returning();
    return updatedTheater;
  }
  async deleteTheater(id) {
    const result = await db.delete(theaters).where(eq(theaters.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Showtime operations
  async getShowtimes() {
    return await db.select({
      id: showtimes.id,
      movieId: showtimes.movieId,
      theaterId: showtimes.theaterId,
      date: showtimes.date,
      time: showtimes.time,
      availableSeats: showtimes.availableSeats,
      price: showtimes.price,
      movie: {
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl,
        rating: movies.rating,
        duration: movies.duration
      },
      theater: {
        id: theaters.id,
        name: theaters.name,
        address: theaters.address
      }
    }).from(showtimes).leftJoin(movies, eq(showtimes.movieId, movies.id)).leftJoin(theaters, eq(showtimes.theaterId, theaters.id)).orderBy(asc(showtimes.date), asc(showtimes.time));
  }
  async getShowtimesByMovie(movieId) {
    return await db.select({
      id: showtimes.id,
      movieId: showtimes.movieId,
      theaterId: showtimes.theaterId,
      date: showtimes.date,
      time: showtimes.time,
      availableSeats: showtimes.availableSeats,
      price: showtimes.price,
      theater: {
        id: theaters.id,
        name: theaters.name,
        address: theaters.address
      }
    }).from(showtimes).leftJoin(theaters, eq(showtimes.theaterId, theaters.id)).where(eq(showtimes.movieId, movieId)).orderBy(asc(showtimes.date), asc(showtimes.time));
  }
  async getShowtimesByTheater(theaterId) {
    return await db.select({
      id: showtimes.id,
      movieId: showtimes.movieId,
      theaterId: showtimes.theaterId,
      date: showtimes.date,
      time: showtimes.time,
      availableSeats: showtimes.availableSeats,
      price: showtimes.price,
      movie: {
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl,
        rating: movies.rating,
        duration: movies.duration
      }
    }).from(showtimes).leftJoin(movies, eq(showtimes.movieId, movies.id)).where(eq(showtimes.theaterId, theaterId)).orderBy(asc(showtimes.date), asc(showtimes.time));
  }
  async getShowtime(id) {
    const [showtime] = await db.select({
      id: showtimes.id,
      movieId: showtimes.movieId,
      theaterId: showtimes.theaterId,
      date: showtimes.date,
      time: showtimes.time,
      availableSeats: showtimes.availableSeats,
      price: showtimes.price,
      movie: {
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl,
        rating: movies.rating,
        duration: movies.duration
      },
      theater: {
        id: theaters.id,
        name: theaters.name,
        address: theaters.address
      }
    }).from(showtimes).leftJoin(movies, eq(showtimes.movieId, movies.id)).leftJoin(theaters, eq(showtimes.theaterId, theaters.id)).where(eq(showtimes.id, id));
    return showtime;
  }
  async createShowtime(showtime) {
    const [newShowtime] = await db.insert(showtimes).values(showtime).returning();
    return newShowtime;
  }
  async updateShowtime(id, showtime) {
    const [updatedShowtime] = await db.update(showtimes).set({ ...showtime, updatedAt: /* @__PURE__ */ new Date() }).where(eq(showtimes.id, id)).returning();
    return updatedShowtime;
  }
  async deleteShowtime(id) {
    const result = await db.delete(showtimes).where(eq(showtimes.id, id));
    return (result.rowCount || 0) > 0;
  }
  async updateSeatAvailability(showtimeId, seatsToBook) {
    try {
      const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, showtimeId));
      if (!showtime) return false;
      const newAvailableSeats = Math.max(0, showtime.availableSeats - seatsToBook.length);
      await db.update(showtimes).set({
        availableSeats: newAvailableSeats,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(showtimes.id, showtimeId));
      return true;
    } catch (error) {
      console.error("Error updating seat availability:", error);
      return false;
    }
  }
  // Booking operations
  async getBookings() {
    return await db.select({
      id: bookings.id,
      userId: bookings.userId,
      showtimeId: bookings.showtimeId,
      seatNumbers: bookings.seatNumbers,
      totalAmount: bookings.totalAmount,
      status: bookings.status,
      bookedAt: bookings.bookedAt,
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      },
      showtimeDetails: {
        id: showtimes.id,
        date: showtimes.date,
        time: showtimes.time
      },
      movieDetails: {
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl
      },
      theaterDetails: {
        id: theaters.id,
        name: theaters.name
      }
    }).from(bookings).leftJoin(users, eq(bookings.userId, users.id)).leftJoin(showtimes, eq(bookings.showtimeId, showtimes.id)).leftJoin(movies, eq(showtimes.movieId, movies.id)).leftJoin(theaters, eq(showtimes.theaterId, theaters.id)).orderBy(desc(bookings.bookedAt));
  }
  async getBookingsByUser(userId) {
    return await db.select({
      id: bookings.id,
      userId: bookings.userId,
      showtimeId: bookings.showtimeId,
      seatNumbers: bookings.seatNumbers,
      totalAmount: bookings.totalAmount,
      status: bookings.status,
      bookedAt: bookings.bookedAt,
      showtimeDetails: {
        id: showtimes.id,
        date: showtimes.date,
        time: showtimes.time
      },
      movieDetails: {
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl
      },
      theaterDetails: {
        id: theaters.id,
        name: theaters.name,
        address: theaters.address
      }
    }).from(bookings).leftJoin(showtimes, eq(bookings.showtimeId, showtimes.id)).leftJoin(movies, eq(showtimes.movieId, movies.id)).leftJoin(theaters, eq(showtimes.theaterId, theaters.id)).where(eq(bookings.userId, userId)).orderBy(desc(bookings.bookedAt));
  }
  async getBookingsByShowtime(showtimeId) {
    return await db.select({
      id: bookings.id,
      seatNumbers: bookings.seatNumbers,
      status: bookings.status
    }).from(bookings).where(and(eq(bookings.showtimeId, showtimeId), eq(bookings.status, "confirmed")));
  }
  async getBooking(id) {
    const [booking] = await db.select({
      id: bookings.id,
      userId: bookings.userId,
      showtimeId: bookings.showtimeId,
      seatNumbers: bookings.seatNumbers,
      totalAmount: bookings.totalAmount,
      status: bookings.status,
      bookedAt: bookings.bookedAt,
      showtimeDetails: {
        id: showtimes.id,
        date: showtimes.date,
        time: showtimes.time
      },
      movieDetails: {
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl
      },
      theaterDetails: {
        id: theaters.id,
        name: theaters.name,
        address: theaters.address
      }
    }).from(bookings).leftJoin(showtimes, eq(bookings.showtimeId, showtimes.id)).leftJoin(movies, eq(showtimes.movieId, movies.id)).leftJoin(theaters, eq(showtimes.theaterId, theaters.id)).where(eq(bookings.id, id));
    return booking;
  }
  async createBooking(booking) {
    if (booking.seatNumbers && booking.seatNumbers.length > 0) {
      await this.updateSeatAvailability(booking.showtimeId, booking.seatNumbers);
    }
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }
  async updateBooking(id, booking) {
    const [updatedBooking] = await db.update(bookings).set({ ...booking, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookings.id, id)).returning();
    return updatedBooking;
  }
  async deleteBooking(id) {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Contact Message operations
  async getContactMessages() {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  async getContactMessage(id) {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }
  async createContactMessage(message) {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }
  async updateContactMessage(id, message) {
    const [updatedMessage] = await db.update(contactMessages).set(message).where(eq(contactMessages.id, id)).returning();
    return updatedMessage;
  }
  async deleteContactMessage(id) {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return (result.rowCount || 0) > 0;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
var isAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    return next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/admin/setup", async (req, res) => {
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
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(400).json({ message: "Invalid contact message data" });
    }
  });
  app2.get("/api/admin/contact-messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });
  app2.patch("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app2.delete("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app2.get("/api/movies", async (req, res) => {
    try {
      const movies2 = await storage.getMovies();
      res.json(movies2);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });
  app2.get("/api/movies/:id", async (req, res) => {
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
  app2.post("/api/admin/movies", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(400).json({ message: "Invalid movie data" });
    }
  });
  app2.put("/api/admin/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app2.delete("/api/admin/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app2.get("/api/theaters", async (req, res) => {
    try {
      const theaters2 = await storage.getTheaters();
      res.json(theaters2);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });
  app2.get("/api/theaters/:id", async (req, res) => {
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
  app2.post("/api/theaters", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
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
  app2.put("/api/theaters/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
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
  app2.delete("/api/theaters/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
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
  app2.get("/api/showtimes", async (req, res) => {
    try {
      const showtimes2 = await storage.getShowtimes();
      res.json(showtimes2);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });
  app2.get("/api/showtimes/movie/:movieId", async (req, res) => {
    try {
      const showtimes2 = await storage.getShowtimesByMovie(parseInt(req.params.movieId));
      res.json(showtimes2);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });
  app2.get("/api/showtimes/theater/:theaterId", async (req, res) => {
    try {
      const showtimes2 = await storage.getShowtimesByTheater(parseInt(req.params.theaterId));
      res.json(showtimes2);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });
  app2.get("/api/showtimes/:id", async (req, res) => {
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
  app2.post("/api/showtimes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
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
  app2.put("/api/showtimes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
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
  app2.delete("/api/showtimes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
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
  app2.get("/api/bookings/my-bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings2 = await storage.getBookingsByUser(userId);
      res.json(bookings2);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  app2.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId
      });
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  app2.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
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
      const user = await storage.getUser(userId);
      if (booking.userId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });
  app2.get("/api/bookings/all", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookings2 = await storage.getBookings();
      res.json(bookings2);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  app2.post("/api/admin/movies", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid movie data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create movie" });
    }
  });
  app2.put("/api/admin/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
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
    } catch (error) {
      console.error("Error updating movie:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid movie data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update movie" });
    }
  });
  app2.delete("/api/admin/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app2.post("/api/admin/theaters", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const theaterData = insertTheaterSchema.parse(req.body);
      const theater = await storage.createTheater(theaterData);
      res.status(201).json(theater);
    } catch (error) {
      console.error("Error creating theater:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create theater" });
    }
  });
  app2.put("/api/admin/theaters/:id", isAuthenticated, isAdmin, async (req, res) => {
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
    } catch (error) {
      console.error("Error updating theater:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid theater data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update theater" });
    }
  });
  app2.delete("/api/admin/theaters/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app2.post("/api/admin/showtimes", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const showtimeData = insertShowtimeSchema.parse(req.body);
      const showtime = await storage.createShowtime(showtimeData);
      res.status(201).json(showtime);
    } catch (error) {
      console.error("Error creating showtime:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid showtime data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create showtime" });
    }
  });
  app2.put("/api/admin/showtimes/:id", isAuthenticated, isAdmin, async (req, res) => {
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
    } catch (error) {
      console.error("Error updating showtime:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid showtime data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update showtime" });
    }
  });
  app2.delete("/api/admin/showtimes/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
