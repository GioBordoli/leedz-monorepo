#!/usr/bin/env node

/**
 * Simple Migration Runner for Leedz Database
 * Executes SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://leedz_user:leedz_password@localhost:5432/leedz_db'
});

async function runMigrations() {
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Create migrations table to track executed migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    const migrationsDir = __dirname;
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    for (const filename of migrationFiles) {
      console.log(`\n🔄 Processing: ${filename}`);

      // Check if migration already executed
      const result = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [filename]
      );

      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      // Read and execute migration file
      const filePath = path.join(migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`⚡ Executing ${filename}...`);
      await client.query(sql);

      // Record migration as executed
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );

      console.log(`✅ Completed ${filename}`);
    }

    console.log('\n🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 