require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:9440774440%40Ni@localhost:5432/park-wise';

async function insertSampleData() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Start transaction
    await client.query('BEGIN');

    // 1. Insert Users (password: password123 for all)
    console.log('Inserting users...');
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    const usersResult = await client.query(`
      INSERT INTO users (id, email, password_hash, name, phone, role, verified, created_at, updated_at)
      VALUES
        (gen_random_uuid(), 'admin@parkwise.com', $1, 'Admin User', '+919876543210', 'admin', true, NOW(), NOW()),
        (gen_random_uuid(), 'owner1@parkwise.com', $1, 'John Owner', '+919876543211', 'owner', true, NOW(), NOW()),
        (gen_random_uuid(), 'owner2@parkwise.com', $1, 'Sarah Owner', '+919876543212', 'owner', true, NOW(), NOW()),
        (gen_random_uuid(), 'user1@parkwise.com', $1, 'Alice Driver', '+919876543213', 'user', true, NOW(), NOW()),
        (gen_random_uuid(), 'user2@parkwise.com', $1, 'Bob Driver', '+919876543214', 'user', true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        verified = EXCLUDED.verified
      RETURNING id, email, role
    `, [passwordHash]);

    // Get user IDs
    let owner1Id, owner2Id, user1Id, user2Id;
    
    for (const row of usersResult.rows) {
      if (row.email === 'owner1@parkwise.com') owner1Id = row.id;
      if (row.email === 'owner2@parkwise.com') owner2Id = row.id;
      if (row.email === 'user1@parkwise.com') user1Id = row.id;
      if (row.email === 'user2@parkwise.com') user2Id = row.id;
    }

    // If users weren't returned (already existed), fetch them
    if (!owner1Id || !owner2Id || !user1Id || !user2Id) {
      const existingUsers = await client.query(`
        SELECT id, email FROM users WHERE email IN ('owner1@parkwise.com', 'owner2@parkwise.com', 'user1@parkwise.com', 'user2@parkwise.com')
      `);
      for (const u of existingUsers.rows) {
        if (u.email === 'owner1@parkwise.com') owner1Id = u.id;
        if (u.email === 'owner2@parkwise.com') owner2Id = u.id;
        if (u.email === 'user1@parkwise.com') user1Id = u.id;
        if (u.email === 'user2@parkwise.com') user2Id = u.id;
      }
    }

    if (!owner1Id || !owner2Id || !user1Id || !user2Id) {
      throw new Error('Failed to get user IDs');
    }

    // 2. Insert Parking Spaces (Delhi, Mumbai, Bangalore locations)
    console.log('Inserting parking spaces...');
    const parkingSpaces = await client.query(`
      INSERT INTO parking_spaces (
        id, owner_id, name, address, location, latitude, longitude, type, vehicle_type,
        description, status, price_per_hour, price_per_day, price_per_month, created_at, updated_at
      )
      VALUES
        -- Delhi Parkings (Owner 1)
        (gen_random_uuid(), $1, 'Connaught Place Covered Parking', 'Connaught Place, New Delhi', 
         ST_SetSRID(ST_MakePoint(77.2167, 28.6333), 4326)::geography, 28.6333, 77.2167, 'covered', 'both',
         'Secure covered parking in the heart of Connaught Place. CCTV surveillance, 24/7 security.', 
         'approved', 50, 400, 10000, NOW(), NOW()),
        
        (gen_random_uuid(), $1, 'Khan Market Open Parking', 'Khan Market, New Delhi',
         ST_SetSRID(ST_MakePoint(77.2250, 28.6000), 4326)::geography, 28.6000, 77.2250, 'open', '4W',
         'Open parking space near Khan Market. Easy access, well-lit area.', 
         'approved', NULL, 300, 8000, NOW(), NOW()),
        
        (gen_random_uuid(), $1, 'Saket EV Charging Parking', 'Saket, New Delhi',
         ST_SetSRID(ST_MakePoint(77.2000, 28.5167), 4326)::geography, 28.5167, 77.2000, 'covered', '4W',
         'Modern covered parking with EV charging facility. CCTV and gated access.', 
         'approved', 60, 500, 12000, NOW(), NOW()),
        
        -- Mumbai Parkings (Owner 2)
        (gen_random_uuid(), $2, 'Bandra Covered Parking', 'Bandra West, Mumbai',
         ST_SetSRID(ST_MakePoint(72.8267, 19.0556), 4326)::geography, 19.0556, 72.8267, 'covered', 'both',
         'Premium covered parking in Bandra. CCTV, security guard, and easy access.', 
         'approved', 70, 600, 15000, NOW(), NOW()),
        
        (gen_random_uuid(), $2, 'Andheri Open Parking', 'Andheri East, Mumbai',
         ST_SetSRID(ST_MakePoint(72.8667, 19.1167), 4326)::geography, 19.1167, 72.8667, 'open', '2W',
         'Affordable open parking for two-wheelers. Well-maintained area.', 
         'approved', 30, 200, 5000, NOW(), NOW()),
        
        (gen_random_uuid(), $2, 'Powai Gated Parking', 'Powai, Mumbai',
         ST_SetSRID(ST_MakePoint(72.9000, 19.1167), 4326)::geography, 19.1167, 72.9000, 'covered', '4W',
         'Secure gated parking with CCTV. Perfect for long-term parking.', 
         'approved', NULL, 450, 11000, NOW(), NOW()),
        
        -- Bangalore Parkings (Owner 1)
        (gen_random_uuid(), $1, 'Koramangala Covered Parking', 'Koramangala, Bangalore',
         ST_SetSRID(ST_MakePoint(77.6250, 12.9356), 4326)::geography, 12.9356, 77.6250, 'covered', 'both',
         'Tech hub parking with EV charging. CCTV surveillance and 24/7 access.', 
         'approved', 55, 450, 11000, NOW(), NOW()),
        
        (gen_random_uuid(), $1, 'Indiranagar Open Parking', 'Indiranagar, Bangalore',
         ST_SetSRID(ST_MakePoint(77.6417, 12.9783), 4326)::geography, 12.9783, 77.6417, 'open', '2W',
         'Convenient open parking for two-wheelers. Near metro station.', 
         'approved', 25, 180, 4500, NOW(), NOW())
      RETURNING id, name, owner_id
    `, [owner1Id, owner2Id]);

    const parkingIds = parkingSpaces.rows.map(p => p.id);

    // 3. Insert Parking Amenities
    console.log('Inserting parking amenities...');
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parking_amenities'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      for (let i = 0; i < parkingIds.length; i++) {
        const parkingId = parkingIds[i];
        const amenities = i % 3 === 0 
          ? ['CCTV', 'EV Charging', 'Gated', 'Security Guard']
          : i % 3 === 1
          ? ['CCTV', 'Well Lit', 'Easy Access']
          : ['CCTV', 'Gated', '24/7 Access'];
        
        for (const amenity of amenities) {
          await client.query(`
            INSERT INTO parking_amenities (parking_id, amenity_name, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT DO NOTHING
          `, [parkingId, amenity]);
        }
      }
    } else {
      console.log('⚠️  parking_amenities table does not exist. Skipping amenities insertion.');
      console.log('   Please run: npm run db:apply-schema');
    }

    // 4. Insert Parking Images
    console.log('Inserting parking images...');
    const imagesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parking_images'
      );
    `);
    
    if (imagesTableCheck.rows[0].exists) {
      const sampleImages = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ];
      
      for (let i = 0; i < parkingIds.length; i++) {
        const parkingId = parkingIds[i];
        for (let j = 0; j < 2; j++) {
          await client.query(`
            INSERT INTO parking_images (parking_id, image_url, display_order, is_primary, created_at)
            VALUES ($1, $2, $3, $4, NOW())
          `, [parkingId, sampleImages[j], j, j === 0]);
        }
      }
    } else {
      console.log('⚠️  parking_images table does not exist. Skipping images insertion.');
    }

    // 5. Insert Parking Time Slots
    console.log('Inserting parking time slots...');
    const timeSlotsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parking_time_slots'
      );
    `);
    
    if (timeSlotsTableCheck.rows[0].exists) {
      for (const parkingId of parkingIds) {
        await client.query(`
          INSERT INTO parking_time_slots (parking_id, start_hour, end_hour, available_hours, created_at, updated_at)
          VALUES ($1, 6, 22, ARRAY[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]::integer[], NOW(), NOW())
          ON CONFLICT DO NOTHING
        `, [parkingId]);
      }
    } else {
      console.log('⚠️  parking_time_slots table does not exist. Skipping time slots insertion.');
    }

    // 6. Insert Bookings
    console.log('Inserting bookings...');
    if (parkingIds.length >= 2) {
      const booking1 = await client.query(`
        INSERT INTO bookings (
          id, user_id, parking_id, booking_type, start_time, end_time, total_amount,
          booking_status, payment_status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, 'daily', 
          NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
          400, 'completed', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
        )
        RETURNING id
      `, [user1Id, parkingIds[0]]);

      const booking2 = await client.query(`
        INSERT INTO bookings (
          id, user_id, parking_id, booking_type, start_time, end_time, total_amount,
          booking_status, payment_status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, 'hourly',
          NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours',
          150, 'active', 'completed', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'
        )
        RETURNING id
      `, [user2Id, parkingIds[1]]);

      const booking3 = await client.query(`
        INSERT INTO bookings (
          id, user_id, parking_id, booking_type, start_time, end_time, total_amount,
          booking_status, payment_status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, 'monthly',
          NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days',
          10000, 'active', 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
        )
        RETURNING id
      `, [user1Id, parkingIds[3]]);

      const bookingIds = [
        booking1.rows[0]?.id,
        booking2.rows[0]?.id,
        booking3.rows[0]?.id,
      ].filter(Boolean);

      // 7. Insert Payments
      console.log('Inserting payments...');
      for (let i = 0; i < bookingIds.length; i++) {
        await client.query(`
          INSERT INTO payments (
            id, booking_id, user_id, amount, payment_method, payment_status,
            razorpay_order_id, razorpay_payment_id, transaction_id, created_at, updated_at
          )
          VALUES (
            gen_random_uuid(), $1, $2, $3, 'razorpay', 'completed',
            'order_' || substr(md5(random()::text), 1, 14),
            'pay_' || substr(md5(random()::text), 1, 14),
            'txn_' || substr(md5(random()::text), 1, 14),
            NOW() - INTERVAL '${i + 1} days', NOW() - INTERVAL '${i + 1} days'
          )
        `, [
          bookingIds[i],
          i === 0 ? user1Id : user2Id,
          i === 0 ? 400 : i === 1 ? 150 : 10000,
        ]);
      }

      // 8. Insert Reviews
      console.log('Inserting reviews...');
      if (bookingIds.length >= 2) {
        await client.query(`
          INSERT INTO reviews (id, parking_id, user_id, booking_id, rating, review_text, created_at, updated_at)
          VALUES
            (gen_random_uuid(), $1, $2, $3, 5, 'Excellent parking space! Very secure and well-maintained.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
            (gen_random_uuid(), $4, $5, $6, 4, 'Good location and easy access. Would recommend!', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
        `, [
          parkingIds[0], user1Id, bookingIds[0],
          parkingIds[1], user2Id, bookingIds[1],
        ]);
      }
    }

    // 9. Insert Favorites
    console.log('Inserting favorites...');
    if (parkingIds.length >= 2) {
      await client.query(`
        INSERT INTO favorites (id, user_id, parking_id, created_at)
        VALUES
          (gen_random_uuid(), $1, $2, NOW()),
          (gen_random_uuid(), $1, $3, NOW()),
          (gen_random_uuid(), $4, $5, NOW())
        ON CONFLICT DO NOTHING
      `, [user1Id, parkingIds[0], parkingIds[1], user2Id, parkingIds[2]]);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Sample data inserted successfully!');
    console.log('\nSample Users:');
    console.log('  - Admin: admin@parkwise.com (password: password123)');
    console.log('  - Owner 1: owner1@parkwise.com (password: password123)');
    console.log('  - Owner 2: owner2@parkwise.com (password: password123)');
    console.log('  - User 1: user1@parkwise.com (password: password123)');
    console.log('  - User 2: user2@parkwise.com (password: password123)');
    console.log(`\nInserted ${parkingSpaces.rows.length} parking spaces`);
    console.log('Note: All passwords are hashed. Use signup/login API to create accounts with actual passwords.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting sample data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
insertSampleData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });

