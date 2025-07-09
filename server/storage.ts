import {
  users,
  cinemas,
  auditoriums,
  movies,
  showtimes,
  bookings,
  seats,
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
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Cinema operations
  getCinemas(): Promise<Cinema[]>;
  getCinema(id: number): Promise<CinemaWithDetails | undefined>;
  createCinema(cinema: InsertCinema): Promise<Cinema>;
  updateCinema(id: number, cinema: Partial<InsertCinema>): Promise<Cinema>;
  getCinemasByOwner(ownerId: string): Promise<Cinema[]>;

  // Auditorium operations
  getAuditoriums(cinemaId: number): Promise<Auditorium[]>;
  createAuditorium(auditorium: InsertAuditorium): Promise<Auditorium>;

  // Movie operations
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie>;
  searchMovies(query: string): Promise<Movie[]>;

  // Showtime operations
  getShowtimes(movieId?: number, cinemaId?: number, date?: string): Promise<ShowtimeWithDetails[]>;
  getShowtime(id: number): Promise<ShowtimeWithDetails | undefined>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  updateShowtime(id: number, showtime: Partial<InsertShowtime>): Promise<Showtime>;
  deleteShowtime(id: number): Promise<void>;

  // Booking operations
  getBookings(userId?: string): Promise<BookingWithDetails[]>;
  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  cancelBooking(id: number): Promise<void>;

  // Seat operations
  getSeats(showtimeId: number): Promise<Seat[]>;
  lockSeats(showtimeId: number, seatNumbers: string[], lockedBy: string): Promise<void>;
  unlockSeats(showtimeId: number, seatNumbers: string[]): Promise<void>;
  bookSeats(showtimeId: number, seatNumbers: string[], bookingId: number): Promise<void>;
  cleanupExpiredLocks(): Promise<void>;

  // Admin operations
  getAllTransactions(): Promise<any[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  getTransactionsByCinema(cinemaId: number): Promise<any[]>;
  updateCommissionRate(cinemaId: number, rate: number): Promise<void>;
  getCommissionRate(cinemaId: number): Promise<number>;
  logAdminAction(adminId: string, action: string, details: any): Promise<void>;
  getAdminAuditLogs(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
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

  // Cinema operations
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

  // Auditorium operations
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

  // Movie operations
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

  // Showtime operations
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

  // Booking operations
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

  // Seat operations
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

  // Admin operations
  async getAllTransactions(): Promise<any[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(cinemas, eq(showtimes.cinemaId, cinemas.id))
      .where(eq(bookings.status, "confirmed"))
      .orderBy(desc(bookings.createdAt));

    return results.map(result => ({
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

    return results.map(result => ({
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

    return results.map(result => ({
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
    // This would be implemented with a commission table
    // For now, we'll store it in cinema metadata
    await db
      .update(cinemas)
      .set({ 
        updatedAt: new Date(),
        // We'd need a commission_rate column in the schema
      })
      .where(eq(cinemas.id, cinemaId));
  }

  async getCommissionRate(cinemaId: number): Promise<number> {
    // Default commission rate
    return 0.10; // 10%
  }

  async logAdminAction(adminId: string, action: string, details: any): Promise<void> {
    // This would be implemented with an audit log table
    console.log(`Admin ${adminId} performed action: ${action}`, details);
  }

  async getAdminAuditLogs(): Promise<any[]> {
    // This would return audit logs from a dedicated table
    return [];
  }
}

export const storage = new DatabaseStorage();