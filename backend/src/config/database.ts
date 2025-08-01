import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private pool: Pool;
  private static instance: Database;

  constructor() {
    // FIXME: CRITICAL - Set DATABASE_URL environment variable for production
    // TODO: Add SSL configuration for production database connections
    // TODO: Add connection retry logic with exponential backoff
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://leedz_user:leedz_password@localhost:5432/leedz_db',
      // Production-ready connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      allowExitOnIdle: true // Allow the process to exit if all clients are idle
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('🔥 Database pool error:', err);
    });

    // Handle pool connection events
    this.pool.on('connect', () => {
      console.log('🔗 New database client connected');
    });

    console.log('📊 Database connection pool initialized');
  }

  /**
   * Get singleton instance of Database
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Execute a query with parameters (SQL injection safe)
   */
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries (> 1000ms) for performance monitoring
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(callback: (client: PoolClient) => Promise<any>): Promise<any> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('🔄 Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as timestamp, version()');
      console.log('✅ Database connection test successful');
      console.log('📅 Server time:', result.rows[0].timestamp);
      console.log('🗄️ Database version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    console.log('🔌 Closing database connection pool...');
    await this.pool.end();
    console.log('✅ Database connection pool closed');
  }

  /**
   * Get pool status for monitoring
   */
  getPoolStatus() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Export singleton instance
export default Database.getInstance(); 