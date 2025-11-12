# ParkWise API

NestJS backend API for ParkWise - a peer-to-peer parking rental marketplace.

## Features

- **Authentication**: JWT-based authentication with role-based access control (user, owner, admin)
- **Parking Management**: CRUD operations for parking spaces with PostGIS location search
- **Bookings**: Create, cancel, and manage bookings with availability checking
- **Payments**: Mock Razorpay integration for payment processing
- **Reviews**: Post and manage reviews for parking spaces
- **Favorites**: Save and manage favorite parking spaces
- **PostGIS Integration**: Efficient nearby parking search using geospatial queries
- **Soft Delete**: All main entities support soft delete
- **Swagger Documentation**: Complete API documentation at `/api/docs`

## Tech Stack

- **NestJS**: Progressive Node.js framework
- **Prisma**: Modern ORM for PostgreSQL
- **PostgreSQL**: Database with PostGIS extension
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **Swagger**: API documentation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your database credentials and JWT secret.

3. Set up the database:
```bash
# Run the database schema from the root database/schema.sql
psql -U your_username -d parkwise_db -f ../database/schema.sql
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`
Swagger documentation: `http://localhost:3000/api/docs`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile

### Parking
- `POST /api/parking` - Create parking space (Owner only)
- `GET /api/parking` - List all parking spaces with filters
- `GET /api/parking/search` - Search nearby parking (PostGIS)
- `GET /api/parking/:id` - Get parking details
- `PATCH /api/parking/:id` - Update parking space (Owner only)
- `DELETE /api/parking/:id` - Delete parking space (Owner only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/owner` - Get owner bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/initiate` - Initiate payment (Mock Razorpay)
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id` - Get payment details

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/parking/:parkingId` - Get reviews for parking
- `DELETE /api/reviews/:id` - Delete review

### Favorites
- `POST /api/favorites/:parkingId` - Add to favorites
- `DELETE /api/favorites/:parkingId` - Remove from favorites
- `GET /api/favorites` - Get all favorites

## Environment Variables

```env
# Standard PostgreSQL connection (for local development)
DATABASE_URL=postgresql://postgres:9440774440%40Ni@localhost:5432/park-wise

# Or use Prisma Accelerate connection string if using Prisma Accelerate
# DATABASE_URL=prisma+postgres://localhost:5432/?api_key=your_api_key_here

JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Database Schema

The database schema is defined in `../database/schema.sql` and includes:
- Users with roles (user, owner, admin)
- Parking spaces with PostGIS location
- Bookings with status tracking
- Payments with Razorpay integration
- Reviews and ratings
- Favorites
- Soft delete support for all entities

## PostGIS Search

The parking search uses PostGIS for efficient geospatial queries:
- `ST_Distance`: Calculate distance between points
- `ST_DWithin`: Find parking within radius
- Results sorted by distance

## Testing

Use Swagger UI at `/api/docs` to test all endpoints interactively.

## License

ISC

