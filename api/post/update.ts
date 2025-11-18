import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleSheetsService } from '../../shared/googleSheets.js';
import { updateCellSchema } from '../../shared/schema.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { rowId, column, content } = updateCellSchema.parse(req.body);

    // Update in Google Sheets only
    await googleSheetsService.updateCell(rowId, column, content);

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.errors });
    }
    console.error("Error updating cell:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
