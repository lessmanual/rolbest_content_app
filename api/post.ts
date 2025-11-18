import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleSheetsService } from '../shared/googleSheets.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const post = await googleSheetsService.getCurrentPost();

    if (!post) {
      return res.status(404).json({ message: "No post found for today with status 'Do akceptacji'" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching current post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
