import database from '../config/database';
import { encrypt, decrypt, validateApiKeyFormat } from '../utils/encryption';

export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  google_oauth_id: string;
  places_api_key?: string; // This will be encrypted in the database
  subscription_status: 'active' | 'inactive' | 'cancelled';
  daily_usage_count: number;
  usage_reset_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  picture?: string;
  google_oauth_id: string;
}

export interface UpdateUserData {
  name?: string;
  picture?: string;
  places_api_key?: string;
  subscription_status?: 'active' | 'inactive' | 'cancelled';
}

export class UserModel {
  /**
   * Create a new user (typically from OAuth)
   */
  static async create(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, name, picture, google_oauth_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    try {
      const result = await database.query(query, [
        userData.email,
        userData.name,
        userData.picture || null,
        userData.google_oauth_id
      ]);
      
      console.log('✅ User created:', userData.email);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to find user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await database.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to find user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by Google OAuth ID
   */
  static async findByGoogleId(googleId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE google_oauth_id = $1';
    
    try {
      const result = await database.query(query, [googleId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to find user by Google ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Update user data
   */
  static async update(id: number, updateData: UpdateUserData): Promise<User | null> {
    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }

    if (updateData.picture !== undefined) {
      fields.push(`picture = $${paramCount++}`);
      values.push(updateData.picture);
    }

    if (updateData.places_api_key !== undefined) {
      // Validate and encrypt API key
      if (updateData.places_api_key && !validateApiKeyFormat(updateData.places_api_key)) {
        throw new Error('Invalid Google Places API key format');
      }
      
      fields.push(`places_api_key = $${paramCount++}`);
      values.push(updateData.places_api_key ? encrypt(updateData.places_api_key) : null);
    }

    if (updateData.subscription_status !== undefined) {
      fields.push(`subscription_status = $${paramCount++}`);
      values.push(updateData.subscription_status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await database.query(query, values);
      console.log('✅ User updated:', id);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Get decrypted API key for a user
   */
  static async getApiKey(id: number): Promise<string | null> {
    const query = 'SELECT places_api_key FROM users WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      const user = result.rows[0];
      
      if (!user || !user.places_api_key) {
        return null;
      }
      
      return decrypt(user.places_api_key);
    } catch (error) {
      console.error('❌ Failed to get user API key:', error);
      throw new Error('Failed to get API key');
    }
  }

  /**
   * Increment daily usage count
   */
  static async incrementUsage(id: number): Promise<number> {
    const query = `
      UPDATE users 
      SET daily_usage_count = CASE 
        WHEN usage_reset_date < CURRENT_DATE THEN 1
        ELSE daily_usage_count + 1
      END,
      usage_reset_date = CASE 
        WHEN usage_reset_date < CURRENT_DATE THEN CURRENT_DATE
        ELSE usage_reset_date
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING daily_usage_count
    `;

    try {
      const result = await database.query(query, [id]);
      return result.rows[0].daily_usage_count;
    } catch (error) {
      console.error('❌ Failed to increment usage:', error);
      throw new Error('Failed to increment usage');
    }
  }

  /**
   * Get current daily usage for a user
   */
  static async getDailyUsage(id: number): Promise<{ count: number; resetDate: Date }> {
    const query = `
      SELECT 
        CASE 
          WHEN usage_reset_date < CURRENT_DATE THEN 0
          ELSE daily_usage_count
        END as count,
        CASE 
          WHEN usage_reset_date < CURRENT_DATE THEN CURRENT_DATE
          ELSE usage_reset_date
        END as reset_date
      FROM users 
      WHERE id = $1
    `;

    try {
      const result = await database.query(query, [id]);
      const row = result.rows[0];
      return {
        count: row.count,
        resetDate: row.reset_date
      };
    } catch (error) {
      console.error('❌ Failed to get daily usage:', error);
      throw new Error('Failed to get daily usage');
    }
  }

  /**
   * Check if user has reached daily limit (1000 leads)
   */
  static async hasReachedDailyLimit(id: number): Promise<boolean> {
    const usage = await this.getDailyUsage(id);
    return usage.count >= 1000;
  }

  /**
   * Delete a user (cascade will delete related sheet configs)
   */
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      console.log('✅ User deleted:', id);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw new Error('Failed to delete user');
    }
  }
} 