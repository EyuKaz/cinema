# CinemaOS - SaaS Cinema Booking Platform

## Overview

CinemaOS is a full-stack SaaS cinema booking platform built with a modern React frontend and Node.js/Express backend. The application supports multi-cinema management, real-time seat booking, and user authentication through Replit's OpenID Connect system. It uses a PostgreSQL database with Drizzle ORM and features real-time WebSocket communication for live seat updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom cinema-themed color palette
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: Context API for booking flow and theme management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect with session management
- **Real-time Communication**: WebSocket integration for live seat updates
- **API Design**: RESTful endpoints with proper error handling and validation

## Key Components

### Database Schema
- **Users**: Profile management with role-based access (user, cinema_owner, admin)
- **Cinemas**: Multi-tenant cinema management with location details
- **Movies**: Movie catalog with metadata, ratings, and poster URLs
- **Showtimes**: Time-based movie scheduling across cinemas
- **Bookings**: Seat reservations with payment tracking
- **Seats**: Dynamic seat layouts with real-time availability status

### Authentication System
- **Provider**: Replit OpenID Connect integration
- **Session Management**: PostgreSQL-backed session store with connect-pg-simple
- **Authorization**: Role-based access control for different user types
- **Security**: HTTP-only cookies with secure session handling

### Real-time Features
- **WebSocket Server**: Live seat selection updates during booking
- **Connection Management**: Automatic reconnection and error handling
- **Room-based Communication**: Showtime-specific channels for seat updates

### UI/UX Design
- **Theme**: Gen-Z friendly design with automatic dark mode detection
- **Responsive Design**: Optimized for desktop and tablet experiences
- **Animations**: Framer Motion for smooth transitions and hover effects
- **Loading States**: Skeleton components for better perceived performance

## Data Flow

1. **User Authentication**: Users authenticate through Replit OAuth flow
2. **Movie Discovery**: Browse movies with search and filtering capabilities
3. **Showtime Selection**: Choose from available showtimes across multiple cinemas
4. **Seat Selection**: Real-time seat map with WebSocket updates
5. **Booking Confirmation**: Secure booking processing with payment integration
6. **Dashboard Management**: User and cinema owner dashboards for booking management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL adapter
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **framer-motion**: Animation library for smooth user interactions
- **wouter**: Lightweight routing solution

### Development Tools
- **TypeScript**: Static type checking for better development experience
- **Vite**: Fast build tool with HMR and optimized production builds
- **TailwindCSS**: Utility-first CSS framework with custom design tokens
- **ESBuild**: Fast JavaScript bundler for server-side code

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Module Replacement**: Instant updates during development
- **Environment Variables**: Secure configuration management

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code for Node.js execution
- **Database**: Drizzle migrations for schema management
- **Static Assets**: Served through Express with proper caching headers

### Architecture Considerations
- **Microservices Ready**: Current monolithic structure can be split into services
- **Scalability**: WebSocket connections can be moved to dedicated service
- **Caching**: Redis integration ready for seat locking and session management
- **CDN Integration**: Static assets can be served from CDN for better performance

The application follows modern full-stack development practices with proper separation of concerns, type safety, and real-time capabilities essential for a cinema booking platform.