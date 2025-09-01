import { google } from 'googleapis';
import { type Post } from '@shared/schema';

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';

    if (credentials) {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
    }
  }

  async getCurrentPost(): Promise<Post | null> {
    if (!this.sheets) return null;

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:H', // Adjust range based on your sheet structure
      });

      const rows = response.data.values;
      if (!rows) return null;

      // Find first row with status "DO_SPRAWDZENIA" in column H
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[7] === 'DO_SPRAWDZENIA') { // Column H is index 7
          return {
            rowId: `ROW_${i + 1}`,
            status: row[7] as "DO_SPRAWDZENIA",
            blogTitle: row[0] || '',
            blogContent: row[1] || '',
            facebookContent: row[2] || '',
            instagramContent: row[3] || '',
            imageUrl: row[4] || '',
            publishedDate: row[5] || '',
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching current post:', error);
      return null;
    }
  }

  async getPublishedPosts(): Promise<Post[]> {
    if (!this.sheets) return [];

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:H',
      });

      const rows = response.data.values;
      if (!rows) return [];

      const publishedPosts: Post[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[7] === 'OPUBLIKOWANE') {
          publishedPosts.push({
            rowId: `ROW_${i + 1}`,
            status: row[7] as "OPUBLIKOWANE",
            blogTitle: row[0] || '',
            blogContent: row[1] || '',
            facebookContent: row[2] || '',
            instagramContent: row[3] || '',
            imageUrl: row[4] || '',
            publishedDate: row[5] || '',
          });
        }
      }

      return publishedPosts.sort((a, b) => 
        (b.publishedDate || "").localeCompare(a.publishedDate || "")
      );
    } catch (error) {
      console.error('Error fetching published posts:', error);
      return [];
    }
  }

  async updateCell(rowId: string, column: string, content: string): Promise<void> {
    if (!this.sheets) return;

    try {
      const rowNumber = parseInt(rowId.replace('ROW_', ''));
      const columnMap: { [key: string]: string } = {
        'blogTitle': 'A',
        'blogContent': 'B',
        'facebookContent': 'C',
        'instagramContent': 'D',
        'imageUrl': 'E',
        'publishedDate': 'F',
        'status': 'H'
      };

      const sheetColumn = columnMap[column];
      if (!sheetColumn) return;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetColumn}${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[content]],
        },
      });
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  }

  async publishPost(rowId: string): Promise<void> {
    await this.updateCell(rowId, 'status', 'OPUBLIKOWANE');
    await this.updateCell(rowId, 'publishedDate', new Date().toISOString());
  }
}

export const googleSheetsService = new GoogleSheetsService();
