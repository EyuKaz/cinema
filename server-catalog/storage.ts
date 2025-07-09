import {
  users,
  cinemas,
  auditoriums,
  movies,
  showtimes,
  bookings,
  seats,
  commissionRates,
  adminAuditLogs,
  type UpsertUser,
  type User,
  type Cinema,
  type InsertCinema,
  type Auditorium,
  type InsertAuditorium,
  type Movie,
  type InsertMovie,
  type Showtime,
  type InsertShowtime,
  type Booking,
  type InsertBooking,
  type Seat,
  type InsertSeat,
  type ShowtimeWithDetails,
  type BookingWithDetails,
  type CinemaWithDetails,
} from "@shared/schema";
import { db } from "./db";

// Import necessary functions from drizzle-orm
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getCinemas(): Promise<Cinema[]>;
  getCinema(id: number): Promise<CinemaWithDetails | undefined>;
  createCinema(cinema: InsertCinema): Promise<Cinema>;
  updateCinema(id: number, cinema: Partial<InsertCinema>): Promise<Cinema>;
  getCinemasByOwner(ownerId: string): Promise<Cinema[]>;
  getAuditoriums(cinemaId: number): Promise<Auditorium[]>;
  createAuditorium(auditorium: InsertAuditorium): Promise<Auditorium>;
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie>;
  searchMovies(query: string): Promise<Movie[]>;
  getShowtimes(movieId?: number, cinemaId?: number, date?: string): Promise<ShowtimeWithDetails[]>;
  getShowtime(id: number): Promise<ShowtimeWithDetails | undefined>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  updateShowtime(id: number, showtime: Partial<InsertShowtime>): Promise<Showtime>;
  deleteShowtime(id: number): Promise<void>;
  getBookings(userId?: string): Promise<BookingWithDetails[]>;
  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  cancelBooking(id: number): Promise<void>;
  getSeats(showtimeId: number): Promise<Seat[]>;
  lockSeats(showtimeId: number, seatNumbers: string[], lockedBy: string): Promise<void>;
  unlockSeats(showtimeId: number, seatNumbers: string[]): Promise<void>;
  bookSeats(showtimeId: number, seatNumbers: string[], bookingId: number): Promise<void>;
  cleanupExpiredLocks(): Promise<void>;
  getAllTransactions(): Promise<any[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  getTransactionsByCinema(cinemaId: number): Promise<any[]>;
  updateCommissionRate(cinemaId: number, rate: number): Promise<void>;
  getCommissionRate(cinemaId: number): Promise<number>;
  logAdminAction(adminId: string, action: string, details: any): Promise<void>;
  getAdminAuditLogs(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getCinemas(): Promise<Cinema[]> {
    return await db.select().from(cinemas).orderBy(asc(cinemas.name));
  }

  async getCinema(id: number): Promise<CinemaWithDetails | undefined> {
    const [cinema] = await db.select().from(cinemas).where(eq(cinemas.id, id));
    if (!cinema) return undefined;

    const cinemaAuditoriums = await db
      .select()
      .from(auditoriums)
      .where(eq(auditoriums.cinemaId, id));

    return {
      ...cinema,
      auditoriums: cinemaAuditoriums,
    };
  }

  async createCinema(cinema: InsertCinema): Promise<Cinema> {
    const [newCinema] = await db.insert(cinemas).values(cinema).returning();
    return newCinema;
  }

  async updateCinema(id: number, cinemaData: Partial<InsertCinema>): Promise<Cinema> {
    const [updatedCinema] = await db
      .update(cinemas)
      .set({ ...cinemaData, updatedAt: new Date() })
      .where(eq(cinemas.id, id))
      .returning();
    return updatedCinema;
  }

  async getCinemasByOwner(ownerId: string): Promise<Cinema[]> {
    return await db
      .select()
      .from(cinemas)
      .where(eq(cinemas.ownerId, ownerId))
      .orderBy(asc(cinemas.name));
  }

  async getAuditoriums(cinemaId: number): Promise<Auditorium[]> {
    return await db
      .select()
      .from(auditoriums)
      .where(eq(auditoriums.cinemaId, cinemaId))
      .orderBy(asc(auditoriums.name));
  }

  async createAuditorium(auditorium: InsertAuditorium): Promise<Auditorium> {
    const [newAuditorium] = await db.insert(auditoriums).values(auditorium).returning();
    return newAuditorium;
  }

  async getMovies(): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .where(eq(movies.status, "active"))
      .orderBy(desc(movies.releaseDate));
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  async updateMovie(id: number, movieData: Partial<InsertMovie>): Promise<Movie> {
    const [updatedMovie] = await db
      .update(movies)
      .set({ ...movieData, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return updatedMovie;
  }

  async searchMovies(query: string): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .where(
        and(
          eq(movies.status, "active"),
          sql`${movies.title} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(movies.releaseDate));
  }

  async getShowtimes(movieId?: number, cinemaId?: number, date?: string): Promise<ShowtimeWithDetails[]> {
    let query = db
      .select()
      .from(showtimes)
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .innerJoin(auditoriums, eq(showtimes.auditoriumId, auditoriums.id))
      .where(eq(showtimes.isActive, true));

    if (movieId) {
      query = query.where(eq(showtimes.movieId, movieId));
    }

    if (cinemaId) {
      query = query.where(eq(showtimes.cinemaId, cinemaId));
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.where(
        and(
          gte(showtimes.startTime, startOfDay),
          lte(showtimes.startTime, endOfDay)
        )
      );
    }

    const results = await query.orderBy(asc(showtimes.startTime));

    return results.map(result => ({
      ...result.showtimes,
      movie: result.movies,
      cinema: result.cinemas,
      auditorium: result.auditoriums,
    }));
  }

  async getShowtime(id: number): Promise<ShowtimeWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(showtimes)
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .innerJoin(auditoriums, eq(showtimes.auditoriumId, auditoriums.id))
      .where(eq(showtimes.id, id));

    if (!result) return undefined;

    return {
      ...result.showtimes,
      movie: result.movies,
      cinema: result.cinemas,
      auditorium: result.auditoriums,
    };
  }

  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    const [newShowtime] = await db.insert(showtimes).values(showtime).returning();
    return newShowtime;
  }

  async updateShowtime(id: number, showtimeData: Partial<InsertShowtime>): Promise<Showtime> {
    const [updatedShowtime] = await db
      .update(showtimes)
      .set({ ...showtimeData, updatedAt: new Date() })
      .where(eq(showtimes.id, id))
      .returning();
    return updatedShowtime;
  }

  async deleteShowtime(id: number): Promise<void> {
    await db.delete(showtimes).where(eq(showtimes.id, id));
  }

  async getBookings(userId?: string): Promise<BookingWithDetails[]> {
    let query = db
      .select()
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .innerJoin(auditoriums, eq(showtimes.auditoriumId, auditoriums.id));

    if (userId) {
      query = query.where(eq(bookings.userId, userId));
    }

    const results = await query.orderBy(desc(bookings.createdAt));

    return results.map(result => ({
      ...result.bookings,
      showtime: {
        ...result.showtimes,
        movie: result.movies,
        cinema: result.cinemas,
        auditorium: result.auditoriums,
      },
    }));
  }

  async getBooking(id: number): Promise<BookingWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .innerJoin(auditoriums, eq(showtimes.auditoriumId, auditoriums.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result.bookings,
      showtime: {
        ...result.showtimes,
        movie: result.movies,
        cinema: result.cinemas,
        auditorium: result.auditoriums,
      },
    };
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async cancelBooking(id: number): Promise<void> {
    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  async getSeats(showtimeId: number): Promise<Seat[]> {
    return await db
      .select()
      .from(seats)
      .where(eq(seats.showtimeId, showtimeId))
      .orderBy(asc(seats.row), asc(seats.seatNumber));
  }

  async lockSeats(showtimeId: number, seatNumbers: string[], lockedBy: string): Promise<void> {
    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    for (const seatNumber of seatNumbers) {
      await db
        .update(seats)
        .set({
          status: "locked",
          lockedAt: lockExpiry,
          lockedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seats.showtimeId, showtimeId),
            eq(seats.seatNumber, seatNumber),
            eq(seats.status, "available")
          )
        );
    }
  }

  async unlockSeats(showtimeId: number, seatNumbers: string[]): Promise<void> {
    for (const seatNumber of seatNumbers) {
      await db
        .update(seats)
        .set({
          status: "available",
          lockedAt: null,
          lockedBy: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seats.showtimeId, showtimeId),
            eq(seats.seatNumber, seatNumber),
            eq(seats.status, "locked")
          )
        );
    }
  }

  async bookSeats(showtimeId: number, seatNumbers: string[], bookingId: number): Promise<void> {
    for (const seatNumber of seatNumbers) {
      await db
        .update(seats)
        .set({
          status: "taken",
          bookingId,
          lockedAt: null,
          lockedBy: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seats.showtimeId, showtimeId),
            eq(seats.seatNumber, seatNumber)
          )
        );
    }
  }

  async cleanupExpiredLocks(): Promise<void> {
    const now = new Date();
    await db
      .update(seats)
      .set({
        status: "available",
        lockedAt: null,
        lockedBy: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(seats.status, "locked"),
          lte(seats.lockedAt!, now)
        )
      );
  }

  async getAllTransactions(): Promise<any[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .where(eq(bookings.status, "confirmed"))
      .orderBy(desc(bookings.createdAt));

    return results.map((result) => ({
      bookingId: result.bookings.id,
      bookingReference: result.bookings.bookingReference,
      amount: result.bookings.totalAmount,
      seats: result.bookings.seats,
      movieTitle: result.movies.title,
      cinemaName: result.cinemas.name,
      showtime: result.showtimes.startTime,
      createdAt: result.bookings.createdAt,
    }));
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .where(
        and(
          eq(bookings.status, "confirmed"),
          gte(bookings.createdAt!, startDate),
          lte(bookings.createdAt!, endDate)
        )
      )
      .orderBy(desc(bookings.createdAt));

    return results.map((result) => ({
      bookingId: result.bookings.id,
      bookingReference: result.bookings.bookingReference,
      amount: result.bookings.totalAmount,
      seats: result.bookings.seats,
      movieTitle: result.movies.title,
      cinemaName: result.cinemas.name,
      showtime: result.showtimes.startTime,
      createdAt: result.bookings.createdAt,
    }));
  }

  async getTransactionsByCinema(cinemaId: number): Promise<any[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .where(
        and(
          eq(bookings.status, "confirmed"),
          eq(cinemas.id, cinemaId)
        )
      )
      .orderBy(desc(bookings.createdAt));

    return results.map((result) => ({
      bookingId: result.bookings.id,
      bookingReference: result.bookings.bookingReference,
      amount: result.bookings.totalAmount,
      seats: result.bookings.seats,
      movieTitle: result.movies.title,
      cinemaName: result.cinemas.name,
      showtime: result.showtimes.startTime,
      createdAt: result.bookings.createdAt,
    }));
  }

  async updateCommissionRate(cinemaId: number, rate: number): Promise<void> {
    await db
      .insert(commissionRates)
      .values({ cinemaId, rate, effectiveDate: new Date() })
      .onConflictDoUpdate({
        target: commissionRates.cinemaId,
        set: { rate, effectiveDate: new Date() },
      });
  }

  async getCommissionRate(cinemaId: number): Promise<number> {
    const [commission] = await db
      .select({ rate: commissionRates.rate })
      .from(commissionRates)
      .where(eq(commissionRates.cinemaId, cinemaId))
      .limit(1);
    return commission?.rate ?? 0.10; // Default 10% if not found
  }

  async logAdminAction(adminId: string, action: string, details: any): Promise<void> {
    await db.insert(adminAuditLogs).values({
      adminId,
      action,
      details: JSON.stringify(details),
      ipAddress: "unknown", // Update if you have access to request IP
      userAgent: "unknown", // Update if you have access to user agent
    });
  }

  async getAdminAuditLogs(): Promise<any[]> {
    return await db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();