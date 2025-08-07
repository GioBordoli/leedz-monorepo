import database from '../config/database';
import { encrypt, decrypt, validateApiKeyFormat } from '../utils/encryption';

export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  google_oauth_id: string;
  places_api_key?: string; // This will be encrypted in the database
  google_access_token?: string; // OAuth access token for Sheets API
  google_refresh_token?: string; // OAuth refresh token for token renewal
  subscription_status: 'active' | 'inactive' | 'cancelled';
  daily_usage_count: number;
  usage_reset_date: Date;
  // NEW: Monthly usage tracking (10,000/month limit)
  monthly_usage_count: number;
  usage_reset_month: Date;
  // 🆕 NEW ONBOARDING TRACKING FIELDS
  has_completed_onboarding: boolean;
  onboarding_completed_at?: Date;
  first_login_at: Date;
  last_login_at: Date;
  created_at: Date;
  updated_at: Date;
  // 🆕 STRIPE INTEGRATION FIELDS
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_plan: string;
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
  google_access_token?: string;
  google_refresh_token?: string;
  subscription_status?: 'active' | 'inactive' | 'cancelled';
  daily_usage_count?: number;
  usage_reset_date?: Date;
  // NEW: Monthly usage fields
  monthly_usage_count?: number;
  usage_reset_month?: Date;
  // 🆕 NEW ONBOARDING UPDATE FIELDS
  has_completed_onboarding?: boolean;
  onboarding_completed_at?: Date;
  last_login_at?: Date;
  // 🆕 STRIPE UPDATE FIELDS
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_plan?: string;
}

export class UserModel {
  /**
   * Create a new user (typically from OAuth)
   */
  static async create(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, name, picture, google_oauth_id, first_login_at, last_login_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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

    if (updateData.daily_usage_count !== undefined) {
      fields.push(`daily_usage_count = $${paramCount++}`);
      values.push(updateData.daily_usage_count);
    }

    if (updateData.usage_reset_date !== undefined) {
      fields.push(`usage_reset_date = $${paramCount++}`);
      values.push(updateData.usage_reset_date);
    }

    // NEW: Monthly usage fields
    if (updateData.monthly_usage_count !== undefined) {
      fields.push(`monthly_usage_count = $${paramCount++}`);
      values.push(updateData.monthly_usage_count);
    }

    if (updateData.usage_reset_month !== undefined) {
      fields.push(`usage_reset_month = $${paramCount++}`);
      values.push(updateData.usage_reset_month);
    }

    // OAuth token fields for Google Sheets integration
    if (updateData.google_access_token !== undefined) {
      fields.push(`google_access_token = $${paramCount++}`);
      values.push(updateData.google_access_token);
    }

    if (updateData.google_refresh_token !== undefined) {
      fields.push(`google_refresh_token = $${paramCount++}`);
      values.push(updateData.google_refresh_token);
    }

    // 🆕 NEW ONBOARDING FIELDS
    if (updateData.has_completed_onboarding !== undefined) {
      fields.push(`has_completed_onboarding = $${paramCount++}`);
      values.push(updateData.has_completed_onboarding);
    }

    if (updateData.onboarding_completed_at !== undefined) {
      fields.push(`onboarding_completed_at = $${paramCount++}`);
      values.push(updateData.onboarding_completed_at);
    }

    if (updateData.last_login_at !== undefined) {
      fields.push(`last_login_at = $${paramCount++}`);
      values.push(updateData.last_login_at);
    }

    // 🆕 STRIPE FIELDS
    if (updateData.stripe_customer_id !== undefined) {
      fields.push(`stripe_customer_id = $${paramCount++}`);
      values.push(updateData.stripe_customer_id);
    }

    if (updateData.stripe_subscription_id !== undefined) {
      fields.push(`stripe_subscription_id = $${paramCount++}`);
      values.push(updateData.stripe_subscription_id);
    }

    if (updateData.subscription_plan !== undefined) {
      fields.push(`subscription_plan = $${paramCount++}`);
      values.push(updateData.subscription_plan);
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

  // 🆕 NEW METHOD: Complete onboarding for a user
  /**
   * Mark user as having completed onboarding
   */
  static async completeOnboarding(id: number): Promise<User | null> {
    const query = `
      UPDATE users 
      SET has_completed_onboarding = TRUE,
          onboarding_completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await database.query(query, [id]);
      console.log('✅ User completed onboarding:', id);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  // 🆕 NEW METHOD: Update last login timestamp
  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(id: number): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      await database.query(query, [id]);
    } catch (error) {
      console.error('❌ Failed to update last login:', error);
      throw new Error('Failed to update last login');
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
   * NEW: Get current monthly usage for a user (10,000/month limit)
   */
  static async getMonthlyUsage(id: number): Promise<{ count: number; resetMonth: Date; limit: number }> {
    const query = `
      SELECT 
        CASE 
          WHEN usage_reset_month < DATE_TRUNC('month', CURRENT_DATE) THEN 0
          ELSE monthly_usage_count
        END as count,
        CASE 
          WHEN usage_reset_month < DATE_TRUNC('month', CURRENT_DATE) THEN DATE_TRUNC('month', CURRENT_DATE)
          ELSE usage_reset_month
        END as reset_month
      FROM users 
      WHERE id = $1
    `;

    try {
      const result = await database.query(query, [id]);
      const row = result.rows[0];
      return {
        count: row.count || 0,
        resetMonth: row.reset_month,
        limit: 10000
      };
    } catch (error) {
      console.error('❌ Failed to get monthly usage:', error);
      throw new Error('Failed to get monthly usage');
    }
  }

  /**
   * NEW: Increment monthly usage count
   */
  static async incrementMonthlyUsage(id: number, amount: number = 1): Promise<number> {
    const query = `
      UPDATE users 
      SET monthly_usage_count = CASE 
        WHEN usage_reset_month < DATE_TRUNC('month', CURRENT_DATE) THEN $2
        ELSE monthly_usage_count + $2
      END,
      usage_reset_month = CASE 
        WHEN usage_reset_month < DATE_TRUNC('month', CURRENT_DATE) THEN DATE_TRUNC('month', CURRENT_DATE)
        ELSE usage_reset_month
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING monthly_usage_count
    `;

    try {
      const result = await database.query(query, [id, amount]);
      return result.rows[0].monthly_usage_count;
    } catch (error) {
      console.error('❌ Failed to increment monthly usage:', error);
      throw new Error('Failed to increment monthly usage');
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
   * NEW: Check if user has reached monthly limit (10,000 leads)
   */
  static async hasReachedMonthlyLimit(id: number): Promise<boolean> {
    const usage = await this.getMonthlyUsage(id);
    return usage.count >= 10000;
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

  /**
   * 🆕 STRIPE METHODS
   */

  /**
   * Find user by Stripe customer ID
   */
  static async findByStripeCustomerId(customerId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE stripe_customer_id = $1';
    
    try {
      const result = await database.query(query, [customerId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to find user by Stripe customer ID:', error);
      throw new Error('Failed to find user by Stripe customer ID');
    }
  }

  /**
   * Update user's Stripe customer ID
   */
  static async updateStripeCustomerId(id: number, customerId: string): Promise<User | null> {
    return this.update(id, { stripe_customer_id: customerId });
  }

  /**
   * Update user's subscription status and Stripe subscription ID
   */
  static async updateSubscription(
    id: number, 
    subscriptionId: string, 
    status: 'active' | 'inactive' | 'cancelled',
    plan: string = 'basic'
  ): Promise<User | null> {
    return this.update(id, { 
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      subscription_plan: plan
    });
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(id: number): Promise<boolean> {
    const user = await this.findById(id);
    return user ? user.subscription_status === 'active' : false;
  }

  /**
   * Get decrypted API key for a user
   */
  static async getDecryptedApiKey(id: number): Promise<string | null> {
    const query = 'SELECT places_api_key FROM users WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      const user = result.rows[0];
      
      if (!user || !user.places_api_key) {
        return null;
      }
      
      return decrypt(user.places_api_key);
    } catch (error) {
      console.error('❌ Failed to get decrypted API key:', error);
      
      // Check if this is an encryption key mismatch (common in development)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('decrypt') || errorMessage.includes('authenticate')) {
        console.warn('🔄 Encryption key mismatch detected - API key needs to be re-entered');
        // Clear the corrupted API key from database
        try {
          await database.query(`UPDATE users SET places_api_key = NULL WHERE id = $1`, [id]);
          console.info('✅ Corrupted API key cleared - user needs to re-enter it');
        } catch (clearError) {
          console.error('❌ Failed to clear corrupted API key:', clearError);
        }
        return null; // Return null so user is prompted to re-enter API key
      }
      
      throw new Error('Failed to get API key');
    }
  }
} 