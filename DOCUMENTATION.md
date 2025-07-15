# C Cinema - Technical Documentation

## 📖 Project Overview

C Cinema is a comprehensive full-stack cinema website that provides a complete movie theater booking experience. The application allows users to browse movies, select theaters, book seats, and manage their reservations. Administrators have access to a comprehensive dashboard for managing all aspects of the cinema operation.

### Key Features
- User authentication and role-based access control
- Movie browsing with detailed information
- Theater locations with contact details
- Real-time seat selection and booking
- User dashboard for booking management
- Admin panel for content management
- Contact system for customer support
- Responsive design optimized for all devices

---

## 🗂️ Directory Structure

```
📁 C-Cinema/
├── 📁 client/                    # Frontend React application
│   └── 📁 src/
│       ├── 📁 components/        # Reusable UI components
│       │   ├── 📁 ui/           # shadcn/ui components
│       │   ├── Footer.tsx       # Site footer
│       │   ├── Header.tsx       # Navigation header
│       │   ├── MovieCard.tsx    # Movie display card
│       │   ├── MovieCarousel.tsx # Movie slider
│       │   ├── PromotionCard.tsx # Promotional content
│       │   ├── SeatMap.tsx      # Theater seat selection
│       │   └── TheaterCard.tsx  # Theater information card
│       ├── 📁 hooks/            # Custom React hooks
│       │   ├── use-mobile.tsx   # Mobile detection
│       │   ├── use-toast.ts     # Toast notifications
│       │   └── useAuth.ts       # Authentication state
│       ├── 📁 lib/              # Utility libraries
│       │   ├── authUtils.ts     # Authentication helpers
│       │   ├── queryClient.ts   # TanStack Query setup
│       │   └── utils.ts         # General utilities
│       ├── 📁 pages/            # Application pages
│       │   ├── About.tsx        # About us page
│       │   ├── AdminDashboard.tsx # Admin management panel
│       │   ├── Booking.tsx      # Seat booking interface
│       │   ├── Contact.tsx      # Contact form page
│       │   ├── Dashboard.tsx    # User dashboard
│       │   ├── FAQ.tsx          # Frequently asked questions
│       │   ├── Home.tsx         # Authenticated home page
│       │   ├── Landing.tsx      # Landing page for guests
│       │   ├── MovieDetails.tsx # Individual movie information
│       │   ├── Movies.tsx       # Movie catalog
│       │   ├── NotFound.tsx     # 404 error page
│       │   ├── Privacy.tsx      # Privacy policy
│       │   ├── Terms.tsx        # Terms and conditions
│       │   └── Theaters.tsx     # Theater locations
│       ├── App.tsx              # Main application component
│       ├── index.css            # Global styles
│       └── main.tsx             # Application entry point
├── 📁 server/                   # Backend Express application
│   ├── db.ts                    # Database connection setup
│   ├── index.ts                 # Server entry point
│   ├── replitAuth.ts            # Authentication middleware
│   ├── routes.ts                # API route definitions
│   ├── storage.ts               # Database operations
│   └── vite.ts                  # Development server setup
├── 📁 shared/                   # Shared types and schemas
│   └── schema.ts                # Database schema and types
├── package.json                 # Project dependencies
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── drizzle.config.ts            # Database migration configuration
```

---

## 🔗 Frontend Routes

### Public Routes (Available to all users)
- `/` - Landing page with sign-in prompt
- `/contact` - Contact form and support information
- `/about` - Company information and mission
- `/faq` - Frequently asked questions
- `/terms` - Terms and conditions
- `/privacy` - Privacy policy

### Authenticated Routes (Require login)
- `/` - Home page with featured movies
- `/movies` - Complete movie catalog with filters
- `/movie/:id` - Individual movie details and showtimes
- `/theaters` - Theater locations and information
- `/booking/:showtimeId` - Seat selection and booking
- `/dashboard` - User profile and booking history
- `/admin` - Admin dashboard (admin role required)

---

## 📡 Backend API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/auth/user` | Get current user info | Authenticated |
| GET | `/api/login` | Initiate login flow | Public |
| GET | `/api/logout` | Sign out user | Authenticated |
| GET | `/api/callback` | OAuth callback | Public |

### Public Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/movies` | Get all movies | Public |
| GET | `/api/movies/:id` | Get movie details | Public |
| GET | `/api/theaters` | Get all theaters | Public |
| GET | `/api/theaters/:id` | Get theater details | Public |
| GET | `/api/showtimes` | Get all showtimes | Public |
| GET | `/api/showtimes/movie/:movieId` | Get showtimes for movie | Public |
| GET | `/api/showtimes/theater/:theaterId` | Get showtimes for theater | Public |
| POST | `/api/contact` | Submit contact message | Public |

### User Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/bookings/my-bookings` | Get user's bookings | User |
| POST | `/api/bookings` | Create new booking | User |
| PATCH | `/api/bookings/:id` | Update booking | User |
| DELETE | `/api/bookings/:id` | Cancel booking | User |

### Admin Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| **Movies Management** |
| POST | `/api/admin/movies` | Create new movie | Admin |
| PUT | `/api/admin/movies/:id` | Update movie | Admin |
| DELETE | `/api/admin/movies/:id` | Delete movie | Admin |
| **Theaters Management** |
| POST | `/api/admin/theaters` | Create new theater | Admin |
| PUT | `/api/admin/theaters/:id` | Update theater | Admin |
| DELETE | `/api/admin/theaters/:id` | Delete theater | Admin |
| **Showtimes Management** |
| POST | `/api/admin/showtimes` | Create new showtime | Admin |
| PUT | `/api/admin/showtimes/:id` | Update showtime | Admin |
| DELETE | `/api/admin/showtimes/:id` | Delete showtime | Admin |
| **Bookings Management** |
| GET | `/api/admin/bookings` | View all bookings | Admin |
| **Contact Messages** |
| GET | `/api/admin/contact-messages` | View contact messages | Admin |
| PATCH | `/api/admin/contact-messages/:id` | Update message status | Admin |
| DELETE | `/api/admin/contact-messages/:id` | Delete message | Admin |

---

## 🗄️ Database Schema

### Users Table
```sql
users (
  id VARCHAR PRIMARY KEY,        -- Replit user ID
  email VARCHAR UNIQUE,          -- User email address
  first_name VARCHAR,            -- User's first name
  last_name VARCHAR,             -- User's last name
  profile_image_url VARCHAR,     -- Profile picture URL
  role VARCHAR DEFAULT 'user',   -- 'user' or 'admin'
  created_at TIMESTAMP,          -- Account creation date
  updated_at TIMESTAMP           -- Last profile update
)
```

### Movies Table
```sql
movies (
  id SERIAL PRIMARY KEY,         -- Auto-incrementing ID
  title VARCHAR NOT NULL,        -- Movie title
  description TEXT,              -- Plot synopsis
  genre VARCHAR NOT NULL,        -- Movie genre
  duration INTEGER NOT NULL,     -- Runtime in minutes
  rating VARCHAR NOT NULL,       -- Age rating (PG, PG-13, R, etc.)
  poster_url VARCHAR,            -- Movie poster image
  trailer_url VARCHAR,           -- Trailer video link
  cast TEXT[],                   -- Array of cast members
  status VARCHAR DEFAULT 'Now Playing', -- 'Now Playing' or 'Coming Soon'
  release_date DATE,             -- Movie release date
  created_at TIMESTAMP,          -- Record creation
  updated_at TIMESTAMP           -- Last update
)
```

### Theaters Table
```sql
theaters (
  id SERIAL PRIMARY KEY,         -- Auto-incrementing ID
  name VARCHAR NOT NULL,         -- Theater name
  address VARCHAR NOT NULL,      -- Physical address
  phone VARCHAR,                 -- Contact phone number
  map_link VARCHAR,              -- Google Maps link
  image_url VARCHAR,             -- Theater image
  created_at TIMESTAMP,          -- Record creation
  updated_at TIMESTAMP           -- Last update
)
```

### Showtimes Table
```sql
showtimes (
  id SERIAL PRIMARY KEY,         -- Auto-incrementing ID
  movie_id INTEGER REFERENCES movies(id), -- Foreign key to movies
  theater_id INTEGER REFERENCES theaters(id), -- Foreign key to theaters
  date DATE NOT NULL,            -- Showtime date
  time TIME NOT NULL,            -- Showtime start time
  available_seats INTEGER DEFAULT 100, -- Remaining seats
  price DECIMAL(10,2) NOT NULL,  -- Ticket price
  created_at TIMESTAMP,          -- Record creation
  updated_at TIMESTAMP           -- Last update
)
```

### Bookings Table
```sql
bookings (
  id SERIAL PRIMARY KEY,         -- Auto-incrementing ID
  user_id VARCHAR REFERENCES users(id), -- Foreign key to users
  showtime_id INTEGER REFERENCES showtimes(id), -- Foreign key to showtimes
  seat_numbers TEXT[],           -- Array of booked seat numbers
  total_amount DECIMAL(10,2) NOT NULL, -- Total booking cost
  status VARCHAR DEFAULT 'confirmed', -- 'confirmed' or 'cancelled'
  booked_at TIMESTAMP,           -- Booking creation time
  created_at TIMESTAMP,          -- Record creation
  updated_at TIMESTAMP           -- Last update
)
```

### Contact Messages Table
```sql
contact_messages (
  id SERIAL PRIMARY KEY,         -- Auto-incrementing ID
  name VARCHAR NOT NULL,         -- Sender's name
  email VARCHAR NOT NULL,        -- Sender's email
  subject VARCHAR NOT NULL,      -- Message subject
  message TEXT NOT NULL,         -- Message content
  status VARCHAR DEFAULT 'unread', -- 'unread', 'read', 'responded'
  created_at TIMESTAMP           -- Message timestamp
)
```

### Sessions Table (Required for Authentication)
```sql
sessions (
  sid VARCHAR PRIMARY KEY,       -- Session identifier
  sess JSONB NOT NULL,          -- Session data
  expire TIMESTAMP NOT NULL      -- Expiration time
)
```

---

## 👨‍💻 Admin User Workflow

### 1. Admin Access
- Admins log in using the same Replit authentication
- System checks user role in database
- Admin users gain access to `/admin` route
- Admin-only API endpoints are protected by middleware

### 2. Content Management
**Movies Management:**
- View all movies in searchable table
- Add new movies with complete metadata
- Edit existing movie information
- Delete movies (cascade deletes showtimes)
- Bulk operations for multiple movies

**Theaters Management:**
- Manage theater locations and details
- Add new theater locations
- Update contact information and addresses
- Remove theaters no longer in operation

**Showtimes Management:**
- Create screening schedules
- Link movies to theaters with dates/times
- Set ticket prices and seat availability
- Modify existing showtimes
- Remove cancelled showtimes

### 3. Booking Oversight
- View all customer bookings
- See booking details and customer information
- Monitor revenue and occupancy rates
- Handle booking modifications and cancellations

### 4. Customer Support
- Access contact messages from customers
- Mark messages as read/responded
- Respond to customer inquiries
- Manage customer service workflow

---

## 🙋‍♂️ Regular User Workflow

### 1. Account Creation & Authentication
- Users sign in via Replit authentication
- Account automatically created on first login
- Profile information populated from Replit
- Session management handles authentication state

### 2. Movie Discovery
- Browse featured movies on home page
- Search and filter complete movie catalog
- View detailed movie information
- Watch trailers and view cast information
- Check movie ratings and reviews

### 3. Theater Selection
- View all theater locations
- See theater details and contact information
- Access maps and directions
- Compare amenities and facilities

### 4. Booking Process
- Select movie and preferred showtime
- Choose theater location
- Interactive seat map for selection
- Real-time seat availability updates
- Secure payment processing simulation
- Instant booking confirmation

### 5. Account Management
- View booking history
- Modify or cancel upcoming bookings
- Update profile information
- Manage notification preferences

---

## ⚙️ Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Replit account for authentication

### Local Development Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd c-cinema
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file with required variables:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/cinema_db
SESSION_SECRET=your-super-secret-session-key
REPL_ID=your-replit-app-id
ISSUER_URL=https://replit.com/oidc
```

4. **Database Setup**
```bash
# Push schema to database
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Replit Deployment

1. **Import Project**
- Import repository into Replit
- Dependencies auto-install

2. **Configure Secrets**
- Add environment variables in Replit Secrets
- DATABASE_URL (auto-provided if PostgreSQL enabled)
- SESSION_SECRET (generate secure random string)

3. **Database Setup**
```bash
npm run db:push
```

4. **Run Application**
- Click "Run" in Replit
- Application automatically deploys

---

## 🚀 Deployment Instructions

### Replit Deployment (Recommended)
1. Fork or import project to Replit
2. Enable PostgreSQL database
3. Configure environment secrets
4. Run `npm run db:push`
5. Click "Run" to deploy

### Vercel Frontend + Render Backend

**Frontend (Vercel):**
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables

**Backend (Render):**
1. Create new Web Service on Render
2. Connect repository
3. Set build command: `npm install && npm run build:server`
4. Set start command: `npm run start:server`
5. Configure environment variables
6. Add PostgreSQL database

### Environment Variables Setup

**Required Variables:**
```env
# Database
DATABASE_URL=<postgresql-connection-string>

# Authentication
SESSION_SECRET=<64-character-random-string>
REPL_ID=<your-replit-app-identifier>
ISSUER_URL=https://replit.com/oidc

# Optional
NODE_ENV=production
PORT=5000
```

**Generate SESSION_SECRET:**
```bash
openssl rand -hex 32
```

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | None |
| `SESSION_SECRET` | Session encryption key | Yes | None |
| `REPL_ID` | Replit application identifier | Yes | None |
| `ISSUER_URL` | OpenID Connect issuer URL | No | `https://replit.com/oidc` |
| `NODE_ENV` | Runtime environment | No | `development` |
| `PORT` | Server port number | No | `5000` |

---

## 📝 Known Issues and Limitations

### Current Limitations
1. **Payment Processing**: Currently simulated - requires integration with payment gateway
2. **Email Notifications**: Contact form messages stored locally - no email sending
3. **Real-time Updates**: Seat availability not real-time - requires WebSocket integration
4. **Image Uploads**: Admin forms require external image URLs - no file upload system
5. **Mobile App**: Web-only experience - no native mobile applications

### Performance Considerations
- Database queries not optimized for large datasets
- No caching layer implemented
- Image optimization not implemented
- No CDN integration for static assets

### Security Notes
- Admin role assignment manual - no self-service admin registration
- Rate limiting not implemented on API endpoints
- Input sanitization relies on Zod validation
- No two-factor authentication available

### Browser Compatibility
- Modern browsers only (ES2020+ required)
- Internet Explorer not supported
- Some features require JavaScript enabled

---

## 🔧 Payment Integration with Go

To integrate real payment processing, we recommend implementing a Go-based payment service that handles secure transactions. Here's the architecture:

### Go Payment Service Structure

```go
// main.go - Payment service entry point
package main

import (
    "log"
    "net/http"
    "os"
    
    "github.com/gin-gonic/gin"
    "github.com/stripe/stripe-go/v74"
    "github.com/stripe/stripe-go/v74/paymentintent"
)

type PaymentService struct {
    stripeKey string
}

type PaymentRequest struct {
    Amount   int64  `json:"amount" binding:"required"`
    Currency string `json:"currency" binding:"required"`
    BookingID int   `json:"booking_id" binding:"required"`
}

func main() {
    // Initialize Stripe
    stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
    
    r := gin.Default()
    
    paymentService := &PaymentService{
        stripeKey: os.Getenv("STRIPE_SECRET_KEY"),
    }
    
    // Payment endpoints
    r.POST("/api/payments/create-intent", paymentService.CreatePaymentIntent)
    r.POST("/api/payments/confirm", paymentService.ConfirmPayment)
    r.POST("/api/payments/webhook", paymentService.HandleWebhook)
    
    log.Println("Payment service starting on :8080")
    r.Run(":8080")
}

func (ps *PaymentService) CreatePaymentIntent(c *gin.Context) {
    var req PaymentRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    params := &stripe.PaymentIntentParams{
        Amount:   stripe.Int64(req.Amount),
        Currency: stripe.String(req.Currency),
        Metadata: map[string]string{
            "booking_id": fmt.Sprintf("%d", req.BookingID),
        },
    }
    
    intent, err := paymentintent.New(params)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create payment intent"})
        return
    }
    
    c.JSON(200, gin.H{
        "client_secret": intent.ClientSecret,
        "intent_id": intent.ID,
    })
}

func (ps *PaymentService) ConfirmPayment(c *gin.Context) {
    // Implementation for payment confirmation
    // Update booking status in main database
    // Send confirmation emails
    // Log transaction
}

func (ps *PaymentService) HandleWebhook(c *gin.Context) {
    // Handle Stripe webhooks for payment status updates
    // Ensure idempotency for webhook processing
    // Update booking status based on payment events
}
```

### Integration Steps

1. **Deploy Go Payment Service**
```dockerfile
# Dockerfile for payment service
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o payment-service

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/payment-service .
CMD ["./payment-service"]
```

2. **Environment Variables for Payment Service**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://your-cinema-app.com
```

3. **Frontend Integration**
```typescript
// Update booking flow to use payment service
async function processPayment(bookingData: BookingData) {
  // Create payment intent
  const intent = await fetch('/api/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({
      amount: bookingData.totalAmount * 100, // Convert to cents
      currency: 'usd',
      booking_id: bookingData.id
    })
  });
  
  // Use Stripe.js to handle payment
  const { error } = await stripe.confirmCardPayment(intent.client_secret, {
    payment_method: {
      card: cardElement,
      billing_details: { ... }
    }
  });
  
  if (!error) {
    // Confirm booking in main application
    await confirmBooking(bookingData.id);
  }
}
```

4. **Database Schema for Payments**
```sql
-- Add to existing schema
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  stripe_payment_intent_id VARCHAR UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR DEFAULT 'pending', -- pending, succeeded, failed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

This Go-based payment service provides secure, PCI-compliant payment processing while keeping the main Node.js application focused on business logic.

---

*This documentation is maintained alongside the codebase. For questions or clarifications, please contact the development team or file an issue in the repository.*