import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleSheetsService } from '../../shared/googleSheets.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const posts = await googleSheetsService.getPublishedPosts();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching published posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
