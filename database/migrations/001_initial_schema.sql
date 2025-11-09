-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for ParkWise application
-- Created: 2024-01-01
-- Rollback: See rollback section at the end

BEGIN;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE parking_type AS ENUM ('covered', 'open');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('2W', '4W', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE parking_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_type AS ENUM ('hourly', 'daily', 'monthly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('active', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('upi', 'razorpay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    verified BOOLEAN NOT NULL DEFAULT false,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- ============================================================================
-- PARKING SPACES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS parking_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    type parking_type NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    description TEXT,
    status parking_status NOT NULL DEFAULT 'pending',
    price_per_hour DECIMAL(10, 2),
    price_per_day DECIMAL(10, 2) NOT NULL,
    price_per_month DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_parking_prices CHECK (
        price_per_day > 0 AND 
        price_per_month > 0 AND 
        (price_per_hour IS NULL OR price_per_hour > 0)
    ),
    CONSTRAINT chk_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT chk_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

CREATE INDEX IF NOT EXISTS idx_parking_spaces_location ON parking_spaces USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_owner_id ON parking_spaces(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_parking_spaces_status ON parking_spaces(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_parking_spaces_type ON parking_spaces(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_parking_spaces_vehicle_type ON parking_spaces(vehicle_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_parking_spaces_deleted_at ON parking_spaces(deleted_at);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_status_type ON parking_spaces(status, type) WHERE deleted_at IS NULL;

-- ============================================================================
-- PARKING AVAILABILITY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS parking_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_availability_time CHECK (start_time < end_time),
    CONSTRAINT uk_parking_availability UNIQUE (parking_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_parking_availability_parking_id ON parking_availability(parking_id);
CREATE INDEX IF NOT EXISTS idx_parking_availability_day ON parking_availability(day_of_week);

-- ============================================================================
-- PARKING TIME SLOTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS parking_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
    end_hour INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 23),
    available_hours INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_time_slots_hours CHECK (start_hour < end_hour),
    CONSTRAINT uk_parking_time_slots UNIQUE (parking_id)
);

CREATE INDEX IF NOT EXISTS idx_parking_time_slots_parking_id ON parking_time_slots(parking_id);
CREATE INDEX IF NOT EXISTS idx_parking_time_slots_available_hours ON parking_time_slots USING GIN(available_hours);

-- ============================================================================
-- PARKING AMENITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS parking_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_parking_amenities UNIQUE (parking_id, amenity_name)
);

CREATE INDEX IF NOT EXISTS idx_parking_amenities_parking_id ON parking_amenities(parking_id);
CREATE INDEX IF NOT EXISTS idx_parking_amenities_name ON parking_amenities(amenity_name);

-- ============================================================================
-- PARKING IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS parking_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parking_images_parking_id ON parking_images(parking_id);
CREATE INDEX IF NOT EXISTS idx_parking_images_primary ON parking_images(parking_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_parking_images_order ON parking_images(parking_id, display_order);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    booking_type booking_type NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    booking_status booking_status NOT NULL DEFAULT 'active',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_booking_time CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_parking_id ON bookings(parking_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON bookings(end_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_active ON bookings(parking_id, booking_status, start_time, end_time) 
    WHERE booking_status = 'active' AND deleted_at IS NULL;

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    transaction_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_razorpay_order_id UNIQUE (razorpay_order_id),
    CONSTRAINT uk_razorpay_payment_id UNIQUE (razorpay_payment_id)
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_review_booking UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_parking_id ON reviews(parking_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_favorites_user_parking UNIQUE (user_id, parking_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_favorites_parking_id ON favorites(parking_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_favorites_deleted_at ON favorites(deleted_at);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_spaces_updated_at BEFORE UPDATE ON parking_spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_availability_updated_at BEFORE UPDATE ON parking_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_time_slots_updated_at BEFORE UPDATE ON parking_time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POSTGIS HELPER FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000.0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION find_nearby_parking_spaces(
    user_lat DECIMAL,
    user_lon DECIMAL,
    radius_km DECIMAL DEFAULT 10.0,
    limit_count INTEGER DEFAULT 50
) RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    type parking_type,
    vehicle_type vehicle_type,
    price_per_hour DECIMAL,
    price_per_day DECIMAL,
    price_per_month DECIMAL,
    distance_km DECIMAL,
    status parking_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.name,
        ps.address,
        ps.latitude,
        ps.longitude,
        ps.type,
        ps.vehicle_type,
        ps.price_per_hour,
        ps.price_per_day,
        ps.price_per_month,
        ST_Distance(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) / 1000.0 AS distance_km,
        ps.status
    FROM parking_spaces ps
    WHERE 
        ps.deleted_at IS NULL
        AND ps.status = 'approved'
        AND ST_DWithin(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
            radius_km * 1000
        )
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_parking_with_distance(
    parking_uuid UUID,
    user_lat DECIMAL,
    user_lon DECIMAL
) RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    type parking_type,
    vehicle_type vehicle_type,
    description TEXT,
    price_per_hour DECIMAL,
    price_per_day DECIMAL,
    price_per_month DECIMAL,
    status parking_status,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.name,
        ps.address,
        ps.latitude,
        ps.longitude,
        ps.type,
        ps.vehicle_type,
        ps.description,
        ps.price_per_hour,
        ps.price_per_day,
        ps.price_per_month,
        ps.status,
        ST_Distance(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) / 1000.0 AS distance_km
    FROM parking_spaces ps
    WHERE 
        ps.id = parking_uuid
        AND ps.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- VIEWS FOR SOFT DELETE FILTERING
-- ============================================================================
CREATE OR REPLACE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_parking_spaces AS
SELECT * FROM parking_spaces WHERE deleted_at IS NULL AND status = 'approved';

CREATE OR REPLACE VIEW active_bookings AS
SELECT * FROM bookings WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_reviews AS
SELECT * FROM reviews WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_favorites AS
SELECT * FROM favorites WHERE deleted_at IS NULL;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================
-- To rollback this migration, run the following:

/*
BEGIN;

-- Drop views
DROP VIEW IF EXISTS active_favorites;
DROP VIEW IF EXISTS active_reviews;
DROP VIEW IF EXISTS active_bookings;
DROP VIEW IF EXISTS active_parking_spaces;
DROP VIEW IF EXISTS active_users;

-- Drop functions
DROP FUNCTION IF EXISTS get_parking_with_distance(UUID, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS find_nearby_parking_spaces(DECIMAL, DECIMAL, DECIMAL, INTEGER);
DROP FUNCTION IF EXISTS calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS parking_images CASCADE;
DROP TABLE IF EXISTS parking_amenities CASCADE;
DROP TABLE IF EXISTS parking_time_slots CASCADE;
DROP TABLE IF EXISTS parking_availability CASCADE;
DROP TABLE IF EXISTS parking_spaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS booking_status;
DROP TYPE IF EXISTS booking_type;
DROP TYPE IF EXISTS parking_status;
DROP TYPE IF EXISTS vehicle_type;
DROP TYPE IF EXISTS parking_type;
DROP TYPE IF EXISTS user_role;

-- Drop extension
DROP EXTENSION IF EXISTS postgis;

COMMIT;
*/

