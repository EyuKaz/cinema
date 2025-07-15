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
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  genre: varchar("genre").notNull(),
  duration: integer("duration").notNull(), // in minutes
  rating: varchar("rating").notNull(), // PG, PG-13, R, etc.
  posterUrl: varchar("poster_url"),
  trailerUrl: varchar("trailer_url"),
  cast: text("cast").array(),
  status: varchar("status").default("Now Playing").notNull(), // Now Playing, Coming Soon
  releaseDate: date("release_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const theaters = pgTable("theaters", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  phone: varchar("phone"),
  mapLink: varchar("map_link"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => movies.id),
  theaterId: integer("theater_id").notNull().references(() => theaters.id),
  date: date("date").notNull(),
  time: time("time").notNull(),
  availableSeats: integer("available_seats").default(100).notNull(),
  totalSeats: integer("total_seats").default(100).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  seatMap: jsonb("seat_map"), // Store seat layout and availability
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  showtimeId: integer("showtime_id").notNull().references(() => showtimes.id),
  seatNumbers: text("seat_numbers").array(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("confirmed").notNull(), // confirmed, canceled
  bookedAt: timestamp("booked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("unread").notNull(), // unread, read, responded
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const movieRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const theaterRelations = relations(theaters, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const showtimeRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
  theater: one(theaters, {
    fields: [showtimes.theaterId],
    references: [theaters.id],
  }),
  bookings: many(bookings),
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

// Zod schemas
export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTheaterSchema = createInsertSchema(theaters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShowtimeSchema = createInsertSchema(showtimes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  bookedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertTheater = z.infer<typeof insertTheaterSchema>;
export type Theater = typeof theaters.$inferSelect;
export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;
export type Showtime = typeof showtimes.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
