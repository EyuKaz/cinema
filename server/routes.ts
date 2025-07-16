import type { Express, Request, Response, NextFunction } from "express";
import { IncomingHttpHeaders } from "http";
import { auth } from "./auth";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { db } from "./db";
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

function convertHeaders(headersObj: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(headersObj)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else if (value !== undefined) {
      headers.set(key, String(value));
    }
  }
  return headers;
}

type AppSession = {
  user: {
    id: string;
    role: string;
  };
};

function withSession(
  handler: (req: Request, res: Response, session: AppSession) => any,
  requireAdmin = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawSession = await auth.api.getSession({ headers: convertHeaders(req.headers) });

      if (!rawSession || !rawSession.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = rawSession.user;

      if (typeof id !== 'string') {
        return res.status(401).json({ message: "Invalid session data" });
      }

      // Fetch user role from the database
      const [userRecord] = await db.select().from(users).where(eq(users.id, id));
      if (!userRecord || typeof userRecord.role !== 'string') {
        return res.status(401).json({ message: "User role not found" });
      }

      const session: AppSession = { user: { id, role: userRecord.role } };

      if (requireAdmin && session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      return handler(req, res, session);
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(500).json({ message: "Failed to authenticate user" });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/user", withSession((req, res, session) => res.json(session.user)));

  app.post("/api/admin/setup", withSession(async (req, res, session) => {
    const { userId } = req.body;
    if (session.user.id !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const [user] = await db.update(users).set({ role: "admin", updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Admin role granted", user });
  }));

  app.post("/api/contact", async (req, res) => {
    try {
      const validated = insertContactMessageSchema.parse(req.body);
      const [message] = await db.insert(contactMessages).values(validated).returning();
      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.get("/api/admin/contact-messages", withSession(async (_req, res) => {
    const messages = await db.select().from(contactMessages);
    res.json(messages);
  }, true));

  app.get("/api/movies", async (_req, res) => res.json(await db.select().from(movies)));

  app.get("/api/movies/:id", async (req, res) => {
    const [movie] = await db.select().from(movies).where(eq(movies.id, +req.params.id));
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  });

  app.post("/api/admin/movies", withSession(async (req, res) => {
    const validated = insertMovieSchema.parse(req.body);
    const [movie] = await db.insert(movies).values(validated).returning();
    res.status(201).json(movie);
  }, true));

  const httpServer = createServer(app);
  return httpServer;
}
