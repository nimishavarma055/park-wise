const { Client } = require('pg');
require('dotenv').config();

async function createTables() {
  let connectionString = process.env.DATABASE_URL;
  
  if (connectionString && connectionString.startsWith('prisma+postgres://')) {
    const apiKey = connectionString.split('api_key=')[1];
    if (apiKey) {
      try {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        const config = JSON.parse(decoded);
        connectionString = config.databaseUrl || config.shadowDatabaseUrl;
      } catch (e) {
        connectionString = 'postgresql://postgres:9440774440%40Ni@localhost:5432/park-wise';
      }
    }
  }

  if (!connectionString) {
    connectionString = 'postgresql://postgres:9440774440%40Ni@localhost:5432/park-wise';
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create users table
    await client.query(`
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
    `);
    console.log('✓ Users table created');

    // Create parking_spaces table
    await client.query(`
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
    `);
    console.log('✓ Parking spaces table created');

    // Create other essential tables
    await client.query(`
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
    `);
    console.log('✓ Bookings table created');

    await client.query(`
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
    `);
    console.log('✓ Payments table created');

    await client.query(`
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
    `);
    console.log('✓ Reviews table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parking_id UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT uk_favorites_user_parking UNIQUE (user_id, parking_id)
      );
    `);
    console.log('✓ Favorites table created');

    console.log('\nAll tables created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();

