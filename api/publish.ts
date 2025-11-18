import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleSheetsService } from '../shared/googleSheets.js';
import { publishSchema } from '../shared/schema.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { rowId, publishType } = publishSchema.parse(req.body);

    // Update appropriate status in Google Sheets based on publish type
    if (publishType === "social-media") {
      await googleSheetsService.publishSocialMedia(rowId);
    } else if (publishType === "wordpress") {
      await googleSheetsService.publishWordPress(rowId);
    }

    // Trigger appropriate webhook based on publish type
    if (publishType === "social-media") {
      const webhookUrl = process.env.MAKE_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          // Extract row number from rowId (ROW_5 -> 5)
          const rowNumber = parseInt(rowId.replace('ROW_', ''));

          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rowId,           // ROW_5 format
              rowNumber,       // 5 (just the number)
              status: 'Opublikowano',
              action: 'publish_post',
              timestamp: new Date().toISOString()
            })
          });
          console.log(`Social media webhook triggered successfully for ${rowId} (row ${rowNumber})`);
        } catch (webhookError) {
          console.error("Social media webhook error:", webhookError);
          // Don't fail the request if webhook fails
        }
      }
    } else if (publishType === "wordpress") {
      const wordpressWebhookUrl = process.env.WORDPRESS_WEBHOOK_URL;
      const wordpressUsername = process.env.WORDPRESS_WEBHOOK_USERNAME;
      const wordpressPassword = process.env.WORDPRESS_WEBHOOK_PASSWORD;

      if (wordpressWebhookUrl && wordpressUsername && wordpressPassword) {
        try {
          // Extract row number from rowId (ROW_5 -> 5)
          const rowNumber = parseInt(rowId.replace('ROW_', ''));

          // Create basic auth header
          const basicAuth = Buffer.from(`${wordpressUsername}:${wordpressPassword}`).toString('base64');

          await fetch(wordpressWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${basicAuth}`
            },
            body: JSON.stringify({
              rowId,           // ROW_5 format
              rowNumber,       // 5 (just the number)
              status: 'Opublikowano',
              action: 'publish_wordpress',
              timestamp: new Date().toISOString()
            })
          });
          console.log(`WordPress webhook triggered successfully for ${rowId} (row ${rowNumber})`);
        } catch (webhookError) {
          console.error("WordPress webhook error:", webhookError);
          // Don't fail the request if webhook fails
        }
      } else {
        console.log("WordPress webhook not configured - missing URL or credentials");
      }
    }

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.errors });
    }
    console.error("Error publishing post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
