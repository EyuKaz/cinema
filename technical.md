# C Cinema - Complete Cinema Website

## Overview

This is a comprehensive full-stack cinema web application rebranded as "C Cinema" (formerly Cinépolis clone). It features a complete movie theater booking experience with React frontend and Express backend, including movie browsing, seat booking, user authentication, comprehensive admin management, and all standard informational pages for a professional cinema website.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

✅ **Completed Major Upgrades:**
- Created all missing informational pages (Contact, About, FAQ, Terms, Privacy, 404)
- Implemented comprehensive contact form with backend API
- Added role-based admin access control middleware
- Created complete admin CRUD API endpoints for all entities
- Updated database schema with contact messages table and seat tracking
- Enhanced navigation and routing for all new pages
- Created comprehensive technical documentation (DOCUMENTATION.md)
- Fixed all LSP errors and optimized database operations

✅ **Completed Admin & Seat Selection Systems:**
- Implemented complete admin account setup system with database updates
- Added admin setup endpoint for programmatic account creation
- Enhanced database schema with seat map tracking and availability
- Created comprehensive seat selection system with real-time booking
- Added seat availability API endpoint for fetching booked seats
- Integrated seat map with booking system for complete user experience
- Created detailed documentation guides for both systems

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom cinema theming (dark mode with red/gold accents)
- **State Management**: TanStack Query for server state and built-in React state for local state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions
- **Authentication**: Replit Auth with OpenID Connect and session management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Admin System**: Role-based access control with admin account setup endpoints
- **Seat Management**: Real-time seat availability tracking and booking system

### Data Storage Solutions
- **Primary Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle with migrations support
- **Session Storage**: PostgreSQL sessions table for authentication state

## Key Components

### Database Schema
The application uses five main tables:
- `users` - User accounts with role-based access (user/admin)
- `movies` - Movie catalog with metadata, cast, and status
- `theaters` - Theater locations with contact information
- `showtimes` - Screening schedules with seat maps and availability tracking
- `bookings` - User ticket reservations with detailed seat selection
- `contact_messages` - Customer support and inquiry management
- `sessions` - Authentication session storage (required for Replit Auth)

### Frontend Pages
- **Landing Page**: Unauthenticated welcome page with sign-in
- **Home**: Featured movie carousel and current/upcoming movies
- **Movies**: Filterable movie catalog with search
- **Movie Details**: Individual movie information with showtimes
- **Theaters**: Theater locations with maps and contact info
- **Booking**: Seat selection and payment simulation
- **Dashboard**: User booking history and account management
- **Admin Dashboard**: CRUD operations for movies, theaters, and showtimes

### Authentication Flow
- Uses Replit's OpenID Connect authentication
- Session-based authentication with PostgreSQL storage
- Role-based access control (user/admin)
- Automatic redirects for unauthorized access

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Movie Browsing**: Frontend fetches movie data from `/api/movies` endpoint
3. **Theater Information**: Theater data retrieved from `/api/theaters` with location details
4. **Booking Process**: 
   - User selects movie and showtime
   - Seat selection interface displays available seats
   - Booking creation stores reservation with selected seats
5. **Admin Operations**: Authenticated admins can manage movies, theaters, and showtimes via dedicated endpoints

## External Dependencies

### Authentication
- **Replit Auth**: Provides OpenID Connect authentication
- **Passport.js**: Handles authentication strategies
- **Session Management**: PostgreSQL-based session storage

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **WebSocket Support**: For serverless database connections

### UI Components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern icon library

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations via Drizzle Kit

### Production Build
- Frontend: Vite build process generating static assets
- Backend: esbuild compilation to ESM modules
- Database: Environment-based connection string configuration

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)

The application is designed for deployment on Replit with automatic database provisioning and authentication setup. The monorepo structure allows for easy deployment while maintaining clear separation between frontend and backend concerns.