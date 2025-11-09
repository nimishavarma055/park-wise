# ParkWise Database Schema Documentation

## Overview

This database schema is designed for the ParkWise peer-to-peer parking rental marketplace. It uses PostgreSQL with PostGIS extension for efficient geospatial queries to support location-based parking space searches.

## Database Setup

### Prerequisites

- PostgreSQL 12 or higher
- PostGIS extension (version 3.0 or higher)

### Installation

1. **Install PostGIS extension:**

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

2. **Run the schema:**

```bash
# Using psql
psql -U your_username -d parkwise_db -f database/schema.sql

# Or run the migration
psql -U your_username -d parkwise_db -f database/migrations/001_initial_schema.sql
```

## Schema Design

### Core Tables

#### 1. `users`
Stores all user accounts (drivers, parking owners, and admins).

**Key Fields:**
- `id`: UUID primary key
- `email`: Unique email address
- `role`: Enum ('user', 'owner', 'admin')
- `verified`: Boolean flag for account verification
- `deleted_at`: Soft delete timestamp

**Indexes:**
- Email (for login lookups)
- Phone (for OTP verification)
- Role (for filtering by user type)

#### 2. `parking_spaces`
Stores parking space listings with location data.

**Key Fields:**
- `id`: UUID primary key
- `owner_id`: Foreign key to users table
- `location`: PostGIS GEOGRAPHY(POINT) for spatial queries
- `latitude`, `longitude`: Decimal coordinates (for compatibility)
- `type`: Enum ('covered', 'open')
- `vehicle_type`: Enum ('2W', '4W', 'both')
- `status`: Enum ('pending', 'approved', 'rejected')
- `price_per_hour`, `price_per_day`, `price_per_month`: Pricing tiers

**Indexes:**
- **GIST spatial index** on `location` (critical for nearby searches)
- Owner ID, status, type, vehicle_type
- Composite index on (status, type)

#### 3. `parking_availability`
Stores recurring weekly availability schedules.

**Key Fields:**
- `parking_id`: Foreign key
- `day_of_week`: Integer (0=Sunday, 6=Saturday)
- `start_time`, `end_time`: Time ranges
- `is_available`: Boolean flag

**Constraints:**
- Unique constraint on (parking_id, day_of_week)
- Check constraint: start_time < end_time

#### 4. `parking_time_slots`
Stores hourly time slot availability for hourly bookings.

**Key Fields:**
- `parking_id`: Foreign key
- `start_hour`, `end_hour`: Hour range (0-23)
- `available_hours`: Integer array of available hours

**Indexes:**
- GIN index on `available_hours` array for fast lookups

#### 5. `parking_amenities`
Many-to-many relationship for parking amenities.

**Key Fields:**
- `parking_id`: Foreign key
- `amenity_name`: String (e.g., 'CCTV', 'EV Charging', 'Security Guard')

**Constraints:**
- Unique constraint on (parking_id, amenity_name)

#### 6. `parking_images`
Stores image URLs for parking spaces.

**Key Fields:**
- `parking_id`: Foreign key
- `image_url`: Full URL to image
- `display_order`: Integer for sorting
- `is_primary`: Boolean flag for primary image

#### 7. `bookings`
Stores booking transactions.

**Key Fields:**
- `id`: UUID primary key
- `user_id`, `parking_id`: Foreign keys
- `booking_type`: Enum ('hourly', 'daily', 'monthly')
- `start_time`, `end_time`: Timestamp range
- `total_amount`: Decimal amount
- `booking_status`: Enum ('active', 'cancelled', 'completed')
- `payment_status`: Enum ('pending', 'completed', 'failed')

**Indexes:**
- User ID, parking ID, status fields
- Composite index for active bookings query

#### 8. `payments`
Stores payment transaction details.

**Key Fields:**
- `booking_id`, `user_id`: Foreign keys
- `amount`: Decimal amount
- `payment_method`: Enum ('upi', 'razorpay')
- `payment_status`: Enum ('pending', 'completed', 'failed')
- `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`: Razorpay integration fields
- `transaction_id`: Generic transaction ID
- `failure_reason`: Text field for error messages

**Constraints:**
- Unique constraints on Razorpay IDs

#### 9. `reviews`
Stores reviews and ratings for parking spaces.

**Key Fields:**
- `parking_id`, `user_id`, `booking_id`: Foreign keys
- `rating`: Integer (1-5)
- `review_text`: Optional text review

**Constraints:**
- Unique constraint on booking_id (one review per booking)
- Check constraint: rating between 1 and 5

#### 10. `favorites`
Stores user's favorite parking spaces.

**Key Fields:**
- `user_id`, `parking_id`: Foreign keys
- `deleted_at`: Soft delete for unfavoriting

**Constraints:**
- Unique constraint on (user_id, parking_id) where deleted_at IS NULL

## PostGIS Integration

### Why PostGIS?

PostGIS provides efficient spatial indexing and querying capabilities, essential for:
- Finding nearby parking spaces within a radius
- Calculating distances accurately
- Supporting complex geospatial queries

### Spatial Data Type

The `parking_spaces.location` column uses `GEOGRAPHY(POINT, 4326)`:
- **GEOGRAPHY**: Uses spherical calculations (more accurate for distances)
- **POINT**: Stores a single coordinate pair
- **4326**: WGS84 coordinate system (standard GPS coordinates)

### Helper Functions

#### `calculate_distance(lat1, lon1, lat2, lon2)`
Calculates distance between two points in kilometers.

**Example:**
```sql
SELECT calculate_distance(12.9716, 77.5946, 12.9352, 77.6245);
-- Returns: ~4.2 (kilometers)
```

#### `find_nearby_parking_spaces(user_lat, user_lon, radius_km, limit_count)`
Finds parking spaces within a specified radius.

**Example:**
```sql
SELECT * FROM find_nearby_parking_spaces(
    12.9716,  -- User latitude
    77.5946,  -- User longitude
    5.0,      -- Radius in kilometers
    20        -- Limit results
);
```

**Returns:**
- All parking space fields
- `distance_km`: Calculated distance from user location
- Sorted by distance (nearest first)

#### `get_parking_with_distance(parking_uuid, user_lat, user_lon)`
Gets a specific parking space with distance calculation.

**Example:**
```sql
SELECT * FROM get_parking_with_distance(
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    12.9716,
    77.5946
);
```

## Common Queries

### 1. Find Nearby Parking Spaces

```sql
-- Using PostGIS function
SELECT * FROM find_nearby_parking_spaces(12.9716, 77.5946, 10.0, 50);

-- Using direct PostGIS query
SELECT 
    ps.*,
    ST_Distance(
        ps.location,
        ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography
    ) / 1000.0 AS distance_km
FROM parking_spaces ps
WHERE 
    ps.deleted_at IS NULL
    AND ps.status = 'approved'
    AND ST_DWithin(
        ps.location,
        ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
        10000  -- 10km in meters
    )
ORDER BY distance_km ASC
LIMIT 20;
```

### 2. Filter by Type and Vehicle

```sql
SELECT ps.*
FROM parking_spaces ps
WHERE 
    ps.deleted_at IS NULL
    AND ps.status = 'approved'
    AND ps.type = 'covered'
    AND ps.vehicle_type IN ('4W', 'both')
ORDER BY ps.price_per_day ASC;
```

### 3. Filter by Amenities

```sql
SELECT DISTINCT ps.*
FROM parking_spaces ps
INNER JOIN parking_amenities pa ON ps.id = pa.parking_id
WHERE 
    ps.deleted_at IS NULL
    AND ps.status = 'approved'
    AND pa.amenity_name IN ('CCTV', 'EV Charging', 'Security Guard')
GROUP BY ps.id
HAVING COUNT(DISTINCT pa.amenity_name) = 3;  -- Has all 3 amenities
```

### 4. Get Parking with All Related Data

```sql
SELECT 
    ps.*,
    json_agg(DISTINCT pa.amenity_name) AS amenities,
    json_agg(
        json_build_object(
            'url', pi.image_url,
            'is_primary', pi.is_primary,
            'order', pi.display_order
        ) ORDER BY pi.display_order
    ) AS images,
    pts.available_hours,
    (SELECT AVG(rating) FROM reviews r 
     WHERE r.parking_id = ps.id AND r.deleted_at IS NULL) AS avg_rating,
    (SELECT COUNT(*) FROM reviews r 
     WHERE r.parking_id = ps.id AND r.deleted_at IS NULL) AS review_count
FROM parking_spaces ps
LEFT JOIN parking_amenities pa ON ps.id = pa.parking_id
LEFT JOIN parking_images pi ON ps.id = pi.parking_id
LEFT JOIN parking_time_slots pts ON ps.id = pts.parking_id
WHERE ps.id = '123e4567-e89b-12d3-a456-426614174000'::UUID
    AND ps.deleted_at IS NULL
GROUP BY ps.id, pts.available_hours;
```

### 5. Check Availability for a Time Slot

```sql
-- Check if parking is available for hourly booking
SELECT 
    ps.*,
    pts.available_hours
FROM parking_spaces ps
INNER JOIN parking_time_slots pts ON ps.id = pts.parking_id
WHERE 
    ps.id = '123e4567-e89b-12d3-a456-426614174000'::UUID
    AND ps.deleted_at IS NULL
    AND 14 = ANY(pts.available_hours)  -- Check if hour 14 (2 PM) is available
    AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.parking_id = ps.id
            AND b.booking_status = 'active'
            AND b.deleted_at IS NULL
            AND b.start_time <= '2024-01-20 14:00:00'::timestamp
            AND b.end_time > '2024-01-20 14:00:00'::timestamp
    );
```

### 6. Get User Bookings with Parking Details

```sql
SELECT 
    b.*,
    ps.name AS parking_name,
    ps.address AS parking_address,
    p.payment_status,
    p.razorpay_order_id
FROM bookings b
INNER JOIN parking_spaces ps ON b.parking_id = ps.id
LEFT JOIN payments p ON b.id = p.booking_id
WHERE 
    b.user_id = '123e4567-e89b-12d3-a456-426614174000'::UUID
    AND b.deleted_at IS NULL
ORDER BY b.created_at DESC;
```

### 7. Get Parking Owner's Listings

```sql
SELECT 
    ps.*,
    COUNT(DISTINCT b.id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN b.booking_status = 'active' THEN b.id END) AS active_bookings,
    AVG(r.rating) AS avg_rating
FROM parking_spaces ps
LEFT JOIN bookings b ON ps.id = b.parking_id AND b.deleted_at IS NULL
LEFT JOIN reviews r ON ps.id = r.parking_id AND r.deleted_at IS NULL
WHERE 
    ps.owner_id = '123e4567-e89b-12d3-a456-426614174000'::UUID
    AND ps.deleted_at IS NULL
GROUP BY ps.id
ORDER BY ps.created_at DESC;
```

### 8. Get Reviews with User Info

```sql
SELECT 
    r.*,
    u.name AS user_name,
    ps.name AS parking_name
FROM reviews r
INNER JOIN users u ON r.user_id = u.id
INNER JOIN parking_spaces ps ON r.parking_id = ps.id
WHERE 
    r.parking_id = '123e4567-e89b-12d3-a456-426614174000'::UUID
    AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;
```

## Soft Delete Pattern

All main tables use soft delete via `deleted_at` timestamp:

- **To soft delete:** Set `deleted_at = CURRENT_TIMESTAMP`
- **To restore:** Set `deleted_at = NULL`
- **To query active records:** Use `WHERE deleted_at IS NULL`
- **Views available:** `active_users`, `active_parking_spaces`, `active_bookings`, etc.

**Example:**
```sql
-- Soft delete a parking space
UPDATE parking_spaces 
SET deleted_at = CURRENT_TIMESTAMP 
WHERE id = '123e4567-e89b-12d3-a456-426614174000'::UUID;

-- Restore a parking space
UPDATE parking_spaces 
SET deleted_at = NULL 
WHERE id = '123e4567-e89b-12d3-a456-426614174000'::UUID;
```

## Auto-Update Timestamps

All tables with `updated_at` columns automatically update via triggers:

```sql
-- Trigger function updates updated_at on any UPDATE
CREATE TRIGGER update_parking_spaces_updated_at 
BEFORE UPDATE ON parking_spaces
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Indexes Strategy

### Spatial Indexes
- **GIST index** on `parking_spaces.location` - Critical for PostGIS queries

### B-Tree Indexes
- Foreign keys (for JOIN performance)
- Status fields (for filtering)
- Timestamps (for sorting)
- Unique constraints (for data integrity)

### Partial Indexes
- Many indexes include `WHERE deleted_at IS NULL` to exclude soft-deleted records
- Reduces index size and improves query performance

### Composite Indexes
- `(status, type)` on parking_spaces for common filter combinations
- `(parking_id, booking_status, start_time, end_time)` for availability checks

## Performance Considerations

1. **Spatial Queries:** Always use PostGIS functions with spatial indexes for location-based queries
2. **Soft Deletes:** Use partial indexes to exclude deleted records
3. **Pagination:** Always use LIMIT/OFFSET for large result sets
4. **JSON Aggregation:** Use `json_agg()` for related data to reduce query count
5. **Connection Pooling:** Use connection pooling (e.g., PgBouncer) for production

## Migration Guide

### Running Migrations

```bash
# Run migration
psql -U username -d parkwise_db -f database/migrations/001_initial_schema.sql

# Rollback (see rollback script in migration file)
psql -U username -d parkwise_db -f rollback_script.sql
```

### Version Control

- Each migration file should be numbered sequentially
- Include rollback scripts in comments
- Test migrations on development before production

## Security Considerations

1. **Password Storage:** Use `password_hash` field with bcrypt/argon2
2. **SQL Injection:** Always use parameterized queries
3. **Access Control:** Implement row-level security (RLS) if needed
4. **Audit Logging:** Consider adding audit tables for sensitive operations

## Future Enhancements

- Add full-text search on parking names and descriptions
- Implement materialized views for analytics
- Add database-level caching for frequently accessed data
- Consider partitioning large tables (bookings, payments) by date
- Add database-level rate limiting for API endpoints

## Support

For questions or issues with the database schema, refer to:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [ParkWise Implementation Plan](../docs/IMPLEMENTATION_PLAN.md)

