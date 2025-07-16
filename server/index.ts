import express, { type Express, Request, Response, NextFunction } from "express";
import { IncomingHttpHeaders } from "http";
import { auth } from './auth';
import { createServer } from "http";
import { eq } from "drizzle-orm";
import { db } from "./db";
import path from "path";
import dotenv from "dotenv";
import {
  insertMovieSchema,
  insertContactMessageSchema,
  users,
  movies,
  contactMessages,
} from "@shared/schema";

// Load environment variables
dotenv.config();

const app: Express = express();
app.use(express.json()); // For parsing JSON

// In development, just serve API - frontend runs on Vite dev server
app.get("/", (_req, res) => {
  res.json({ 
    message: "API is running on port 4000! Frontend should run on Vite dev server (port 5173).",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Convert Node headers to Fetch-compatible Headers
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

// Auth middleware wrapper
function withSession(
  handler: (req: Request, res: Response, session: AppSession) => any,
  requireAdmin = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawSession = await auth.api.getSession({ headers: convertHeaders(req.headers) });

      if (!rawSession?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = rawSession.user;

      if (typeof id !== 'string') {
        return res.status(401).json({ message: "Invalid session data" });
      }

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
      return res.status(500).json({ message: "Failed to authenticate user" });
    }
  };
}

// --- API Routes ---

app.get("/api/auth/user", withSession((req, res, session) => res.json(session.user)));

app.post("/api/admin/setup", withSession(async (req, res, session) => {
  const { userId } = req.body;
  if (session.user.id !== userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const [user] = await db.update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ message: "Admin role granted", user });
}));

app.post("/api/contact", async (req, res) => {
  try {
    const validated = insertContactMessageSchema.parse(req.body);
    const [message] = await db.insert(contactMessages).values(validated).returning();
    res.status(201).json(message);
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(400).json({ message: "Invalid data" });
  }
});

app.get("/api/admin/contact-messages", withSession(async (_req, res) => {
  const messages = await db.select().from(contactMessages);
  res.json(messages);
}, true));

app.get("/api/movies", async (_req, res) => {
  const allMovies = await db.select().from(movies);
  res.json(allMovies);
});

app.get("/api/movies/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid movie ID" });
  }
  const [movie] = await db.select().from(movies).where(eq(movies.id, id));
  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }
  res.json(movie);
});

app.post("/api/admin/movies", withSession(async (req, res) => {
  try {
    const validated = insertMovieSchema.parse(req.body);
    const [movie] = await db.insert(movies).values(validated).returning();
    res.status(201).json(movie);
  } catch (error) {
    console.error("Add movie error:", error);
    res.status(400).json({ message: "Invalid movie data" });
  }
}, true));

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(process.cwd(), "dist", "public");
  app.use(express.static(clientDistPath));
  
  // Fallback route to serve index.html for SPA routes in production
  app.get("*", (_req, res) => {
    const indexPath = path.join(clientDistPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).json({ message: "Frontend not built." });
      }
    });
  });
} else {
  // In development, don't handle frontend routes - let Vite handle them
  app.get("*", (_req, res) => {
    res.status(404).json({ 
      message: "API endpoint not found. Frontend should be accessed via Vite dev server." 
    });
  });
}

// Start server
const PORT = process.env.PORT || 4000;
createServer(app).listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📁 Serving static files from: ${path.join(process.cwd(), "dist", "public")}`);
  } else {
    console.log(`🔧 Development mode: API only. Run 'npm run dev:client' for frontend.`);
  }
});