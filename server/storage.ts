import {
  users,
  movies,
  theaters,
  showtimes,
  bookings,
  contactMessages,
  type User,
  type UpsertUser,
  type Movie,
  type InsertMovie,
  type Theater,
  type InsertTheater,
  type Showtime,
  type InsertShowtime,
  type Booking,
  type InsertBooking,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  setUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Movie operations
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<boolean>;
  
  // Theater operations
  getTheaters(): Promise<Theater[]>;
  getTheater(id: number): Promise<Theater | undefined>;
  createTheater(theater: InsertTheater): Promise<Theater>;
  updateTheater(id: number, theater: Partial<InsertTheater>): Promise<Theater | undefined>;
  deleteTheater(id: number): Promise<boolean>;
  
  // Showtime operations
  getShowtimes(): Promise<any[]>;
  getShowtimesByMovie(movieId: number): Promise<any[]>;
  getShowtimesByTheater(theaterId: number): Promise<any[]>;
  getShowtime(id: number): Promise<any | undefined>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  updateShowtime(id: number, showtime: Partial<InsertShowtime>): Promise<Showtime | undefined>;
  deleteShowtime(id: number): Promise<boolean>;
  updateSeatAvailability(showtimeId: number, seatsToBook: string[]): Promise<boolean>;
  
  // Booking operations
  getBookings(): Promise<any[]>;
  getBookingsByUser(userId: string): Promise<any[]>;
  getBookingsByShowtime(showtimeId: number): Promise<any[]>;
  getBooking(id: number): Promise<any | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Contact Message operations
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  async setUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Movie operations
  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined> {
    const [updatedMovie] = await db
      .update(movies)
      .set({ ...movie, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    const result = await db.delete(movies).where(eq(movies.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Theater operations
  async getTheaters(): Promise<Theater[]> {
    return await db.select().from(theaters).orderBy(asc(theaters.name));
  }

  async getTheater(id: number): Promise<Theater | undefined> {
    const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
    return theater;
  }

  async createTheater(theater: InsertTheater): Promise<Theater> {
    const [newTheater] = await db.insert(theaters).values(theater).returning();
    return newTheater;
  }

  async updateTheater(id: number, theater: Partial<InsertTheater>): Promise<Theater | undefined> {
    const [updatedTheater] = await db
      .update(theaters)
      .set({ ...theater, updatedAt: new Date() })
      .where(eq(theaters.id, id))
      .returning();
    return updatedTheater;
  }

  async deleteTheater(id: number): Promise<boolean> {
    const result = await db.delete(theaters).where(eq(theaters.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Showtime operations
  async getShowtimes(): Promise<any[]> {
    return await db
      .select({
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
          duration: movies.duration,
        },
        theater: {
          id: theaters.id,
          name: theaters.name,
          address: theaters.address,
        },
      })
      .from(showtimes)
      .leftJoin(movies, eq(showtimes.movieId, movies.id))
      .leftJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .orderBy(asc(showtimes.date), asc(showtimes.time));
  }

  async getShowtimesByMovie(movieId: number): Promise<any[]> {
    return await db
      .select({
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
          address: theaters.address,
        },
      })
      .from(showtimes)
      .leftJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .where(eq(showtimes.movieId, movieId))
      .orderBy(asc(showtimes.date), asc(showtimes.time));
  }

  async getShowtimesByTheater(theaterId: number): Promise<any[]> {
    return await db
      .select({
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
          duration: movies.duration,
        },
      })
      .from(showtimes)
      .leftJoin(movies, eq(showtimes.movieId, movies.id))
      .where(eq(showtimes.theaterId, theaterId))
      .orderBy(asc(showtimes.date), asc(showtimes.time));
  }

  async getShowtime(id: number): Promise<any | undefined> {
    const [showtime] = await db
      .select({
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
          duration: movies.duration,
        },
        theater: {
          id: theaters.id,
          name: theaters.name,
          address: theaters.address,
        },
      })
      .from(showtimes)
      .leftJoin(movies, eq(showtimes.movieId, movies.id))
      .leftJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .where(eq(showtimes.id, id));
    return showtime;
  }

  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    const [newShowtime] = await db.insert(showtimes).values(showtime).returning();
    return newShowtime;
  }

  async updateShowtime(id: number, showtime: Partial<InsertShowtime>): Promise<Showtime | undefined> {
    const [updatedShowtime] = await db
      .update(showtimes)
      .set({ ...showtime, updatedAt: new Date() })
      .where(eq(showtimes.id, id))
      .returning();
    return updatedShowtime;
  }

  async deleteShowtime(id: number): Promise<boolean> {
    const result = await db.delete(showtimes).where(eq(showtimes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateSeatAvailability(showtimeId: number, seatsToBook: string[]): Promise<boolean> {
    try {
      const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, showtimeId));
      if (!showtime) return false;

      const newAvailableSeats = Math.max(0, showtime.availableSeats - seatsToBook.length);
      
      await db
        .update(showtimes)
        .set({ 
          availableSeats: newAvailableSeats,
          updatedAt: new Date()
        })
        .where(eq(showtimes.id, showtimeId));
      
      return true;
    } catch (error) {
      console.error("Error updating seat availability:", error);
      return false;
    }
  }

  // Booking operations
  async getBookings(): Promise<any[]> {
    return await db
      .select({
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
          lastName: users.lastName,
        },
        showtimeDetails: {
          id: showtimes.id,
          date: showtimes.date,
          time: showtimes.time,
        },
        movieDetails: {
          id: movies.id,
          title: movies.title,
          posterUrl: movies.posterUrl,
        },
        theaterDetails: {
          id: theaters.id,
          name: theaters.name,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .leftJoin(movies, eq(showtimes.movieId, movies.id))
      .leftJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .orderBy(desc(bookings.bookedAt));
  }

  async getBookingsByUser(userId: string): Promise<any[]> {
    return await db
      .select({
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
          time: showtimes.time,
        },
        movieDetails: {
          id: movies.id,
          title: movies.title,
          posterUrl: movies.posterUrl,
        },
        theaterDetails: {
          id: theaters.id,
          name: theaters.name,
          address: theaters.address,
        },
      })
      .from(bookings)
      .leftJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .leftJoin(movies, eq(showtimes.movieId, movies.id))
      .leftJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.bookedAt));
  }

  async getBookingsByShowtime(showtimeId: number): Promise<any[]> {
    return await db
      .select({
        id: bookings.id,
        seatNumbers: bookings.seatNumbers,
        status: bookings.status,
      })
      .from(bookings)
      .where(and(eq(bookings.showtimeId, showtimeId), eq(bookings.status, 'confirmed')));
  }

  async getBooking(id: number): Promise<any | undefined> {
    const [booking] = await db
      .select({
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
          time: showtimes.time,
        },
        movieDetails: {
          id: movies.id,
          title: movies.title,
          posterUrl: movies.posterUrl,
        },
        theaterDetails: {
          id: theaters.id,
          name: theaters.name,
          address: theaters.address,
        },
      })
      .from(bookings)
      .leftJoin(showtimes, eq(bookings.showtimeId, showtimes.id))
      .leftJoin(movies, eq(showtimes.movieId, movies.id))
      .leftJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Update seat availability when creating booking
    if (booking.seatNumbers && booking.seatNumbers.length > 0) {
      await this.updateSeatAvailability(booking.showtimeId, booking.seatNumbers);
    }
    
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Contact Message operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set(message)
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
