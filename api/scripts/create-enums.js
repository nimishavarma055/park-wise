const { Client } = require('pg');
require('dotenv').config();

async function createEnums() {
  let connectionString = process.env.DATABASE_URL;
  
  if (connectionString && connectionString.startsWith('prisma+postgres://')) {
    const apiKey = connectionString.split('api_key=')[1];
    if (apiKey) {
      try {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        const config = JSON.parse(decoded);
        connectionString = config.databaseUrl || config.shadowDatabaseUrl;
      } catch (e) {
        connectionString = 'postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable';
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

    // Create enum types if they don't exist
    const enumQueries = [
      `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE parking_type AS ENUM ('covered', 'open'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE vehicle_type AS ENUM ('2W', '4W', 'both'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE parking_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE booking_type AS ENUM ('hourly', 'daily', 'monthly'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('active', 'cancelled', 'completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('upi', 'razorpay'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    ];

    for (const query of enumQueries) {
      try {
        await client.query(query);
        console.log('✓ Enum type created or already exists');
      } catch (error) {
        console.error('Error creating enum:', error.message);
      }
    }

    console.log('\nEnum types are ready!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createEnums();

