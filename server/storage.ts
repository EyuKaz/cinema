import { db } from './db';
import { eq } from 'drizzle-orm';
import {
  users,
  movies,
  theaters,
  showtimes,
  bookings,
  contactMessages,
  type InsertMovie,
  type InsertTheater,
  type InsertShowtime,
  type InsertBooking,
  type InsertContactMessage,
} from '@shared/schema';

export const storage = {
  async getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  },
  async setUserRole(userId: string, role: string) {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },
  async createContactMessage(data: InsertContactMessage) {
    const [message] = await db.insert(contactMessages).values(data).returning();
    return message;
  },
  async getContactMessages() {
    return db.select().from(contactMessages);
  },
  async updateContactMessage(id: number, data: Partial<InsertContactMessage>) {
    const [message] = await db
      .update(contactMessages)
      .set(data)
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  },
  async deleteContactMessage(id: number) {
    const [deleted] = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning();
    return !!deleted;
  },
  async getMovies() {
    return db.select().from(movies);
  },
  async getMovie(id: number) {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  },
  async createMovie(data: InsertMovie) {
    const [movie] = await db.insert(movies).values(data).returning();
    return movie;
  },
  async updateMovie(id: number, data: Partial<InsertMovie>) {
    const [movie] = await db
      .update(movies)
      .set(data)
      .where(eq(movies.id, id))
      .returning();
    return movie;
  },
  async deleteMovie(id: number) {
    const [deleted] = await db.delete(movies).where(eq(movies.id, id)).returning();
    return !!deleted;
  },
  async getTheaters() {
    return db.select().from(theaters);
  },
  async getTheater(id: number) {
    const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
    return theater;
  },
  async createTheater(data: InsertTheater) {
    const [theater] = await db.insert(theaters).values(data).returning();
    return theater;
  },
  async updateTheater(id: number, data: Partial<InsertTheater>) {
    const [theater] = await db
      .update(theaters)
      .set(data)
      .where(eq(theaters.id, id))
      .returning();
    return theater;
  },
  async deleteTheater(id: number) {
    const [deleted] = await db
      .delete(theaters)
      .where(eq(theaters.id, id))
      .returning();
    return !!deleted;
  },
  async getShowtimes() {
    return db.select().from(showtimes);
  },
  async getShowtimesByMovie(movieId: number) {
    return db.select().from(showtimes).where(eq(showtimes.movieId, movieId));
  },
  async getShowtimesByTheater(theaterId: number) {
    return db.select().from(showtimes).where(eq(showtimes.theaterId, theaterId));
  },
  async getShowtime(id: number) {
    const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, id));
    return showtime;
  },
  async createShowtime(data: InsertShowtime) {
    const [showtime] = await db.insert(showtimes).values(data).returning();
    return showtime;
  },
  async updateShowtime(id: number, data: Partial<InsertShowtime>) {
    const [showtime] = await db
      .update(showtimes)
      .set(data)
      .where(eq(showtimes.id, id))
      .returning();
    return showtime;
  },
  async deleteShowtime(id: number) {
    const [deleted] = await db
      .delete(showtimes)
      .where(eq(showtimes.id, id))
      .returning();
    return !!deleted;
  },
  async getBookings() {
    return db.select().from(bookings);
  },
  async getBookingsByUser(userId: string) {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  },
  async getBooking(id: number) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  },
  async createBooking(data: InsertBooking) {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  },
};