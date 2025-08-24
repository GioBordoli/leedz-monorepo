import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface Lead {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
}

export interface SheetInfo {
  id: string;
  name: string;
  url: string;
}

export interface WorksheetInfo {
  id: number;
  name: string;
}

export interface ExportOptions {
  sheetId?: string;
  sheetName?: string;
  worksheetName?: string;
}

export interface ExportResult {
  success: boolean;
  sheetUrl: string;
  message: string;
  error?: string;
}

export class SheetsService {
  private sheets: sheets_v4.Sheets;
  private auth: OAuth2Client;

  constructor(accessToken: string) {
    this.auth = new OAuth2Client();
    this.auth.setCredentials({ access_token: accessToken });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * List user's spreadsheets (first 50)
   */
  async listSpreadsheets(): Promise<SheetInfo[]> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.auth });
      
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        pageSize: 50,
        fields: 'files(id, name, webViewLink)',
        orderBy: 'modifiedTime desc'
      });

      return response.data.files?.map(file => ({
        id: file.id!,
        name: file.name!,
        url: file.webViewLink!
      })) || [];
    } catch (error) {
      console.error('❌ Error listing spreadsheets:', error);
      
      // If Drive API fails due to scope issues, provide helpful error message
      if (error instanceof Error && error.message.includes('insufficient authentication scopes')) {
        throw new Error('Insufficient Google Drive permissions. Please re-authenticate to grant access to your Google Sheets.');
      }
      
      throw new Error('Failed to list spreadsheets');
    }
  }

  /**
   * Alternative method: List spreadsheets using manual user input (fallback)
   * This method requires users to provide spreadsheet URLs directly
   */
  async validateSpreadsheet(spreadsheetId: string): Promise<SheetInfo | null> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'properties(title)'
      });

      if (response.data.properties?.title) {
        return {
          id: spreadsheetId,
          name: response.data.properties.title,
          url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error validating spreadsheet:', error);
      return null;
    }
  }

  /**
   * Get worksheets/tabs for a specific spreadsheet
   */
  async getWorksheets(spreadsheetId: string): Promise<WorksheetInfo[]> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets(properties(sheetId,title))'
      });

      return response.data.sheets?.map(sheet => ({
        id: sheet.properties!.sheetId!,
        name: sheet.properties!.title!
      })) || [];
    } catch (error) {
      console.error('❌ Error getting worksheets:', error);
      throw new Error('Failed to get worksheets');
    }
  }

  /**
   * Create a new spreadsheet
   */
  async createSpreadsheet(title: string): Promise<SheetInfo> {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title
          },
          sheets: [{
            properties: {
              title: 'Leads'
            }
          }]
        }
      });

      const spreadsheetId = response.data.spreadsheetId!;
      const spreadsheetUrl = response.data.spreadsheetUrl!;

      return {
        id: spreadsheetId,
        name: title,
        url: spreadsheetUrl
      };
    } catch (error) {
      console.error('❌ Error creating spreadsheet:', error);
      throw new Error('Failed to create spreadsheet');
    }
  }

  /**
   * Create a new worksheet in existing spreadsheet
   */
  async createWorksheet(spreadsheetId: string, title: string): Promise<WorksheetInfo> {
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title
              }
            }
          }]
        }
      });

      const addedSheet = response.data.replies?.[0]?.addSheet;
      if (!addedSheet?.properties) {
        throw new Error('Failed to get new worksheet info');
      }

      return {
        id: addedSheet.properties.sheetId!,
        name: addedSheet.properties.title!
      };
    } catch (error) {
      console.error('❌ Error creating worksheet:', error);
      throw new Error('Failed to create worksheet');
    }
  }

  /**
   * Export leads to Google Sheets
   */
  async exportLeads(leads: Lead[], options: ExportOptions): Promise<ExportResult> {
    try {
      let spreadsheetId: string;
      let worksheetName: string;
      let sheetUrl: string;

      // Determine or create the target spreadsheet
      if (options.sheetId) {
        // Use existing spreadsheet
        spreadsheetId = options.sheetId;
        
        // Get the sheet URL
        const drive = google.drive({ version: 'v3', auth: this.auth });
        const fileResponse = await drive.files.get({
          fileId: spreadsheetId,
          fields: 'webViewLink'
        });
        sheetUrl = fileResponse.data.webViewLink!;
      } else {
        // Create new spreadsheet
        const newSheet = await this.createSpreadsheet(
          options.sheetName || 'Leads Export'
        );
        spreadsheetId = newSheet.id;
        sheetUrl = newSheet.url;
      }

      // Determine or create the target worksheet
      if (options.worksheetName) {
        // Check if worksheet exists, create if not
        const worksheets = await this.getWorksheets(spreadsheetId);
        const existingWorksheet = worksheets.find(ws => ws.name === options.worksheetName);
        
        if (!existingWorksheet) {
          await this.createWorksheet(spreadsheetId, options.worksheetName);
        }
        worksheetName = options.worksheetName;
      } else {
        // Use first worksheet or create default
        const worksheets = await this.getWorksheets(spreadsheetId);
        worksheetName = worksheets[0]?.name || 'Sheet1';
      }

      // Prepare data for export
      const headers = ['Name', 'Address', 'Phone', 'Website'];
      const rows = leads.map(lead => [
        lead.name || '',
        lead.address || '',
        lead.phone || '',
        lead.website || ''
      ]);

      // Find the next available row
      const nextRow = await this.findNextAvailableRow(spreadsheetId, worksheetName);
      
      // If this is the first data, add headers
      if (nextRow === 1) {
        await this.appendData(spreadsheetId, worksheetName, [headers, ...rows]);
      } else {
        await this.appendData(spreadsheetId, worksheetName, rows);
      }

      return {
        success: true,
        sheetUrl,
        message: `Successfully exported ${leads.length} leads to Google Sheets`
      };
    } catch (error) {
      console.error('❌ Error exporting leads:', error);
      return {
        success: false,
        sheetUrl: '',
        message: 'Failed to export leads',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find the next available row in a worksheet
   */
  private async findNextAvailableRow(spreadsheetId: string, worksheetName: string): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${worksheetName}!A:A`
      });

      const values = response.data.values || [];
      return values.length + 1;
    } catch (error) {
      // If worksheet doesn't exist or is empty, start at row 1
      return 1;
    }
  }

  /**
   * Append data to a worksheet using batch update for better performance
   */
  private async appendData(spreadsheetId: string, worksheetName: string, data: string[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${worksheetName}!A:D`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: data
        }
      });
    } catch (error) {
      console.error('❌ Error appending data:', error);
      throw new Error('Failed to append data to sheet');
    }
  }

  /**
   * Generate default sheet name based on search parameters
   */
  static generateDefaultSheetName(businessType: string, location: string): string {
    const cleanBusinessType = businessType.charAt(0).toUpperCase() + businessType.slice(1);
    const cleanLocation = location.split(',')[0]; // Take first part (city)
    return `${cleanLocation} ${cleanBusinessType} Leads`;
  }
} 