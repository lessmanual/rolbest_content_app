import { google } from 'googleapis';
import { type Post } from '@shared/schema';

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';

    if (credentials && this.spreadsheetId) {
      try {
        const parsedCredentials = JSON.parse(credentials);
        
        // Validate that required fields exist
        if (!parsedCredentials.client_email || !parsedCredentials.private_key) {
          console.error('Google Service Account credentials are missing required fields (client_email, private_key)');
          return;
        }

        const auth = new google.auth.GoogleAuth({
          credentials: parsedCredentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        console.log('Google Sheets service initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Sheets service:', error);
        console.error('Make sure GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is a valid JSON string');
      }
    } else {
      console.log('Google Sheets service not initialized - missing credentials or sheet ID');
    }
  }

  async getCurrentPost(): Promise<Post | null> {
    if (!this.sheets) return null;

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Artykuły!A:J', // Get data from "Artykuły" sheet, columns A to J
      });

      const rows = response.data.values;
      if (!rows) return null;

      // Get today's date in DD-MM-YYYY format (with dashes to match Excel format)
      const today = new Date();
      const todayStr = today.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\./g, '-'); // Replace dots with dashes to match Excel format


      // Find row with today's date (no longer filtering by main status)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowDate = row[0] || ''; // Column A - data
        
        if (rowDate === todayStr) {
          return {
            rowId: `ROW_${i + 1}`,
            status: "Do akceptacji", // Default status since we show all posts
            blogTitle: row[1] || '', // Column B - tytuł
            blogContent: row[2] || '', // Column C - Blog Wordpress text (for editing)
            blogContentHtml: row[3] || '', // Column D - Blog Wordpress HTML (for preview)
            facebookContent: row[4] || '', // Column E - Post Facebook
            instagramContent: row[5] || '', // Column F - Post Instagram
            imageUrl: row[6] || '', // Column G - Grafika
            publishedDate: row[0] || '', // Column A - data
            statusWP: row[8] || '', // Column I - WordPress status
            statusSM: row[9] || '', // Column J - Social Media status
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
        range: 'Artykuły!A:J', // Get data from "Artykuły" sheet, columns A to J
      });

      const rows = response.data.values;
      if (!rows) return [];

      const publishedPosts: Post[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const statusWP = row[8] || ''; // Column I - WordPress status
        const statusSM = row[9] || ''; // Column J - Social Media status

        // Show posts that have 'Opublikowano' in at least one of the status columns
        if (statusWP === 'Opublikowano' || statusSM === 'Opublikowano') {
          publishedPosts.push({
            rowId: `ROW_${i + 1}`,
            status: "Opublikowano" as const,
            blogTitle: row[1] || '', // Column B - tytuł
            blogContent: row[2] || '', // Column C - Blog Wordpress text (for editing)
            blogContentHtml: row[3] || '', // Column D - Blog Wordpress HTML (for preview)
            facebookContent: row[4] || '', // Column E - Post Facebook
            instagramContent: row[5] || '', // Column F - Post Instagram
            imageUrl: row[6] || '', // Column G - Grafika
            publishedDate: row[0] || '', // Column A - data
            statusWP, // Column I - WordPress status
            statusSM, // Column J - Social Media status
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

  async getArchivedPosts(): Promise<Post[]> {
    if (!this.sheets) return [];

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Artykuły!A:J', // Get data from "Artykuły" sheet, columns A to J
      });

      const rows = response.data.values;
      if (!rows) return [];

      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const archivedPosts: Post[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const dateStr = row[0] || ''; // Column A - data
        const statusWP = row[8] || ''; // Column I - WordPress status
        const statusSM = row[9] || ''; // Column J - Social Media status

        // Skip if no date
        if (!dateStr) continue;

        // Parse date DD-MM-YYYY
        const dateParts = dateStr.split('-');
        if (dateParts.length !== 3) continue;

        const [day, month, year] = dateParts.map(Number);
        const postDate = new Date(year, month - 1, day);
        postDate.setHours(0, 0, 0, 0);

        // Check: past date AND not published (both statuses must not be 'Opublikowano')
        const isPast = postDate < today;
        const notPublished = statusWP !== 'Opublikowano' && statusSM !== 'Opublikowano';

        if (isPast && notPublished) {
          archivedPosts.push({
            rowId: `ROW_${i + 1}`,
            status: "Archiwum" as const,
            blogTitle: row[1] || '', // Column B - tytuł
            blogContent: row[2] || '', // Column C - Blog Wordpress text (for editing)
            blogContentHtml: row[3] || '', // Column D - Blog Wordpress HTML (for preview)
            facebookContent: row[4] || '', // Column E - Post Facebook
            instagramContent: row[5] || '', // Column F - Post Instagram
            imageUrl: row[6] || '', // Column G - Grafika
            publishedDate: dateStr, // Column A - data
            statusWP, // Column I - WordPress status
            statusSM, // Column J - Social Media status
          });
        }
      }

      // Sort DESC (newest first)
      return archivedPosts.sort((a, b) =>
        (b.publishedDate || "").localeCompare(a.publishedDate || "")
      );
    } catch (error) {
      console.error('Error fetching archived posts:', error);
      return [];
    }
  }

  async updateCell(rowId: string, column: string, content: string): Promise<void> {
    if (!this.sheets) return;

    try {
      const rowNumber = parseInt(rowId.replace('ROW_', ''));
      const columnMap: { [key: string]: string } = {
        'publishedDate': 'A', // Column A - data
        'blogTitle': 'B', // Column B - tytuł
        'blogContent': 'C', // Column C - Blog Wordpress text
        'blogContentHtml': 'D', // Column D - Blog Wordpress HTML
        'facebookContent': 'E', // Column E - Post Facebook
        'instagramContent': 'F', // Column F - Post Instagram
        'imageUrl': 'G', // Column G - Grafika
        'status': 'H', // Column H - Main Status
        'statusWP': 'I', // Column I - WordPress status
        'statusSM': 'J' // Column J - Social Media status
      };

      const sheetColumn = columnMap[column];
      if (!sheetColumn) return;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Artykuły!${sheetColumn}${rowNumber}`,
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
    await this.updateCell(rowId, 'status', 'Opublikowano');
    // publishedDate nie jest aktualizowana, bo data już jest w kolumnie A
  }

  async publishWordPress(rowId: string): Promise<void> {
    await this.updateCell(rowId, 'statusWP', 'Opublikowano');
  }

  async publishSocialMedia(rowId: string): Promise<void> {
    await this.updateCell(rowId, 'statusSM', 'Opublikowano');
  }
}

export const googleSheetsService = new GoogleSheetsService();
