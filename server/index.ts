import express from 'express';
import dotenv from 'dotenv';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { pool, db } from './db';
import { registerRoutes } from './routes';

// Load environment variables first
dotenv.config();

const app = express();

// Initialize Better Auth
export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  trustedOrigins: ['http://localhost:5173'],
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
});

app.use(express.json());
app.use(auth.handler);

// Register routes
const server = await registerRoutes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
