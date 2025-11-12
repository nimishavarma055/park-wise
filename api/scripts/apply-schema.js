const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applySchema() {
  // Parse DATABASE_URL - handle both regular postgres:// and prisma+postgres://
  let connectionString = process.env.DATABASE_URL;
  
  if (connectionString && connectionString.startsWith('prisma+postgres://')) {
    // Extract the actual postgres URL from the Prisma connection string
    // The format is: prisma+postgres://host:port/?api_key=base64_encoded_json
    const apiKey = connectionString.split('api_key=')[1];
    if (apiKey) {
      try {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        const config = JSON.parse(decoded);
        connectionString = config.databaseUrl || config.shadowDatabaseUrl;
        console.log('Extracted connection string from Prisma URL');
      } catch (e) {
        console.error('Failed to parse Prisma connection string:', e.message);
        // Fallback: use the user's provided info
        // User said: host:localhost username:postgres password:postgres port:51214
        connectionString = 'postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable';
        console.log('Using fallback connection string');
      }
    }
  }

  // If still no connection string, use default
  if (!connectionString) {
    connectionString = 'postgresql://postgres:9440774440%40Ni@localhost:5432/park-wise';
    console.log('Using default connection string');
  }

  console.log('Connecting to database...');
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read the schema file (use schema.sql which is simpler than migration file)
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema...');
    
    // Execute the entire SQL file as a single transaction
    // This handles multi-line statements, functions, and triggers properly
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Schema applied successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      
      // If it's an "already exists" error, that's okay - schema might already be applied
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate')) {
        console.log('Schema objects already exist. This is okay.');
        console.log('If you need to recreate, drop existing objects first.');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error applying schema:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();

