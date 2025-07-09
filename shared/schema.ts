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
  boolean,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, cinema_owner, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cinema table
export const cinemas = pgTable("cinemas", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  phone: varchar("phone"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  description: text("description"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auditorium table
export const auditoriums = pgTable("auditoriums", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  cinemaId: integer("cinema_id").references(() => cinemas.id).notNull(),
  totalSeats: integer("total_seats").notNull(),
  seatLayout: jsonb("seat_layout").$type<any>().notNull(),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Movie table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  genre: varchar("genre").notNull(),
  duration: integer("duration").notNull(), // in minutes
  rating: varchar("rating"), // PG, PG-13, R, etc.
  director: varchar("director"),
  cast: jsonb("cast").$type<string[]>().default([]),
  releaseDate: timestamp("release_date"),
  posterUrl: varchar("poster_url"),
  trailerUrl: varchar("trailer_url"),
  imdbRating: decimal("imdb_rating", { precision: 2, scale: 1 }),
  language: varchar("language").default("English"),
  status: varchar("status").default("active"), // active, inactive, coming_soon
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Showtime table
export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  cinemaId: integer("cinema_id").references(() => cinemas.id).notNull(),
  auditoriumId: integer("auditorium_id").references(() => auditoriums.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer("available_seats").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showtimeId: integer("showtime_id").references(() => showtimes.id).notNull(),
  seats: jsonb("seats").$type<string[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("confirmed"), // confirmed, cancelled, pending
  bookingReference: varchar("booking_reference").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seat table for real-time seat tracking
export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  showtimeId: integer("showtime_id").references(() => showtimes.id).notNull(),
  seatNumber: varchar("seat_number").notNull(),
  row: varchar("row").notNull(),
  status: varchar("status").default("available"), // available, taken, locked
  lockedAt: timestamp("locked_at"),
  lockedBy: varchar("locked_by"),
  bookingId: integer("booking_id").references(() => bookings.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.showtimeId, table.seatNumber),
]);

// Commission rates for cinemas
export const commissionRates = pgTable("commission_rates", {
  id: serial("id").primaryKey(),
  cinemaId: integer("cinema_id").references(() => cinemas.id).notNull(),
  rate: decimal("rate", { precision: 5, scale: 4 }).notNull(), // 0.1000 = 10%
  effectiveDate: timestamp("effective_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin audit logs
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedCinemas: many(cinemas),
  bookings: many(bookings),
}));

export const cinemasRelations = relations(cinemas, ({ one, many }) => ({
  owner: one(users, { fields: [cinemas.ownerId], references: [users.id] }),
  auditoriums: many(auditoriums),
  showtimes: many(showtimes),
}));

export const auditoriumsRelations = relations(auditoriums, ({ one, many }) => ({
  cinema: one(cinemas, { fields: [auditoriums.cinemaId], references: [cinemas.id] }),
  showtimes: many(showtimes),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, { fields: [showtimes.movieId], references: [movies.id] }),
  cinema: one(cinemas, { fields: [showtimes.cinemaId], references: [cinemas.id] }),
  auditorium: one(auditoriums, { fields: [showtimes.auditoriumId], references: [auditoriums.id] }),
  bookings: many(bookings),
  seats: many(seats),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  showtime: one(showtimes, { fields: [bookings.showtimeId], references: [showtimes.id] }),
  seats: many(seats),
}));

export const seatsRelations = relations(seats, ({ one }) => ({
  showtime: one(showtimes, { fields: [seats.showtimeId], references: [showtimes.id] }),
  booking: one(bookings, { fields: [seats.bookingId], references: [bookings.id] }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCinemaSchema = createInsertSchema(cinemas);
export const insertAuditoriumSchema = createInsertSchema(auditoriums);
export const insertMovieSchema = createInsertSchema(movies);
export const insertShowtimeSchema = createInsertSchema(showtimes);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertSeatSchema = createInsertSchema(seats);
export const insertCommissionRateSchema = createInsertSchema(commissionRates);
export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs);

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Cinema = typeof cinemas.$inferSelect;
export type InsertCinema = z.infer<typeof insertCinemaSchema>;
export type Auditorium = typeof auditoriums.$inferSelect;
export type InsertAuditorium = z.infer<typeof insertAuditoriumSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Showtime = typeof showtimes.$inferSelect;
export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Seat = typeof seats.$inferSelect;
export type InsertSeat = z.infer<typeof insertSeatSchema>;
export type CommissionRate = typeof commissionRates.$inferSelect;
export type InsertCommissionRate = z.infer<typeof insertCommissionRateSchema>;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;

// Extended types for API responses
export type ShowtimeWithDetails = Showtime & {
  movie: Movie;
  cinema: Cinema;
  auditorium: Auditorium;
};

export type BookingWithDetails = Booking & {
  showtime: ShowtimeWithDetails;
};

export type CinemaWithDetails = Cinema & {
  auditoriums: Auditorium[];
};