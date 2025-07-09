import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { users, sessions } from "@shared/schema";
import type { RequestHandler, Express, Request, Response } from "express";

// Extend Express Request type to include session with user
declare module "express-serve-static-core" {
  interface Request {
    session?: {
      user?: any;
      [key: string]: any;
    };
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:5001", "http://localhost:3000"],
});

// Convert Express Request to Web API Request
function toWebRequest(req: Request): Request {
  // Create a proper Web API Request-like object
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Create headers object with get method
  const headers = new Map();
  Object.entries(req.headers).forEach(([key, value]) => {
    headers.set(key, Array.isArray(value) ? value[0] : value);
  });
  
  const webRequest = {
    method: req.method,
    url: url.toString(),
    headers: {
      get: (name: string) => headers.get(name.toLowerCase()) || null,
      has: (name: string) => headers.has(name.toLowerCase()),
      forEach: (callback: (value: string, key: string) => void) => {
        headers.forEach((value, key) => callback(value, key));
      },
      entries: () => headers.entries(),
      keys: () => headers.keys(),
      values: () => headers.values(),
    },
    json: () => Promise.resolve(req.body),
    text: () => Promise.resolve(JSON.stringify(req.body)),
    formData: () => Promise.resolve(new FormData()),
    clone: () => webRequest,
  };
  
  return webRequest as any;
}

export async function setupAuth(app: Express) {
  // Set up the auth middleware for /api/auth routes
  app.use("/api/auth/*", async (req: Request, res: Response) => {
    try {
      const webRequest = toWebRequest(req);
      const response = await auth.handler(webRequest);
      
      // Convert Web API Response back to Express response
      if (response) {
        res.status(response.status || 200);
        
        // Set headers
        if (response.headers) {
          response.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value);
          });
        }
        
        // Handle response body
        if (response.body) {
          const body = await response.text();
          res.send(body);
        } else {
          res.end();
        }
      } else {
        res.status(404).json({ error: "Not found" });
      }
    } catch (error) {
      console.error("Auth handler error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const webRequest = toWebRequest(req);
    const session = await auth.api.getSession({
      headers: webRequest.headers,
    });
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.session = { user: session.user };
    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};