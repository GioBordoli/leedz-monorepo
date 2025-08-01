import database from '../config/database';

export interface SheetConfig {
  id: number;
  user_id: number;
  spreadsheet_id: string;
  spreadsheet_name: string;
  sheet_tab_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSheetConfigData {
  user_id: number;
  spreadsheet_id: string;
  spreadsheet_name: string;
  sheet_tab_name: string;
}

export interface UpdateSheetConfigData {
  spreadsheet_id?: string;
  spreadsheet_name?: string;
  sheet_tab_name?: string;
  is_active?: boolean;
}

export class SheetConfigModel {
  /**
   * Create a new sheet configuration for a user
   * Automatically deactivates any existing active config
   */
  static async create(configData: CreateSheetConfigData): Promise<SheetConfig> {
    return await database.transaction(async (client) => {
      // Deactivate any existing active configurations for this user
      await client.query(
        'UPDATE sheet_configs SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_active = true',
        [configData.user_id]
      );

      // Create new active configuration
      const query = `
        INSERT INTO sheet_configs (user_id, spreadsheet_id, spreadsheet_name, sheet_tab_name, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `;

      const result = await client.query(query, [
        configData.user_id,
        configData.spreadsheet_id,
        configData.spreadsheet_name,
        configData.sheet_tab_name
      ]);

      console.log('✅ Sheet config created for user:', configData.user_id);
      return result.rows[0];
    });
  }

  /**
   * Find sheet config by ID
   */
  static async findById(id: number): Promise<SheetConfig | null> {
    const query = 'SELECT * FROM sheet_configs WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to find sheet config by ID:', error);
      throw new Error('Failed to find sheet config');
    }
  }

  /**
   * Get active sheet configuration for a user
   */
  static async getActiveConfig(userId: number): Promise<SheetConfig | null> {
    const query = 'SELECT * FROM sheet_configs WHERE user_id = $1 AND is_active = true';
    
    try {
      const result = await database.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to get active sheet config:', error);
      throw new Error('Failed to get active sheet config');
    }
  }

  /**
   * Get all sheet configurations for a user (active and inactive)
   */
  static async getAllForUser(userId: number): Promise<SheetConfig[]> {
    const query = `
      SELECT * FROM sheet_configs 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await database.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get user sheet configs:', error);
      throw new Error('Failed to get user sheet configs');
    }
  }

  /**
   * Update a sheet configuration
   */
  static async update(id: number, updateData: UpdateSheetConfigData): Promise<SheetConfig | null> {
    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.spreadsheet_id !== undefined) {
      fields.push(`spreadsheet_id = $${paramCount++}`);
      values.push(updateData.spreadsheet_id);
    }

    if (updateData.spreadsheet_name !== undefined) {
      fields.push(`spreadsheet_name = $${paramCount++}`);
      values.push(updateData.spreadsheet_name);
    }

    if (updateData.sheet_tab_name !== undefined) {
      fields.push(`sheet_tab_name = $${paramCount++}`);
      values.push(updateData.sheet_tab_name);
    }

    if (updateData.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.is_active);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE sheet_configs 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      // If setting this config to active, need to deactivate others first
      if (updateData.is_active === true) {
        // Get the user_id for this config
        const configResult = await database.query('SELECT user_id FROM sheet_configs WHERE id = $1', [id]);
        const userId = configResult.rows[0]?.user_id;
        
        if (userId) {
          await database.query(
            'UPDATE sheet_configs SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND id != $2',
            [userId, id]
          );
        }
      }

      const result = await database.query(query, values);
      console.log('✅ Sheet config updated:', id);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to update sheet config:', error);
      throw new Error('Failed to update sheet config');
    }
  }

  /**
   * Activate a specific sheet configuration (deactivates others for the user)
   */
  static async activate(id: number): Promise<SheetConfig | null> {
    return await database.transaction(async (client) => {
      // Get the user_id for this config
      const configResult = await client.query('SELECT user_id FROM sheet_configs WHERE id = $1', [id]);
      const config = configResult.rows[0];
      
      if (!config) {
        throw new Error('Sheet config not found');
      }

      // Deactivate all other configs for this user
      await client.query(
        'UPDATE sheet_configs SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND id != $2',
        [config.user_id, id]
      );

      // Activate this config
      const result = await client.query(
        'UPDATE sheet_configs SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );

      console.log('✅ Sheet config activated:', id);
      return result.rows[0] || null;
    });
  }

  /**
   * Deactivate a sheet configuration
   */
  static async deactivate(id: number): Promise<SheetConfig | null> {
    const query = `
      UPDATE sheet_configs 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await database.query(query, [id]);
      console.log('✅ Sheet config deactivated:', id);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Failed to deactivate sheet config:', error);
      throw new Error('Failed to deactivate sheet config');
    }
  }

  /**
   * Delete a sheet configuration
   */
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM sheet_configs WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      console.log('✅ Sheet config deleted:', id);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('❌ Failed to delete sheet config:', error);
      throw new Error('Failed to delete sheet config');
    }
  }

  /**
   * Check if user has any sheet configurations
   */
  static async hasAnyConfig(userId: number): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM sheet_configs WHERE user_id = $1';
    
    try {
      const result = await database.query(query, [userId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('❌ Failed to check if user has configs:', error);
      throw new Error('Failed to check user configs');
    }
  }
} 