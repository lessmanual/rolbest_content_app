import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSheetsService } from "./services/googleSheets";
import { updateCellSchema, publishSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/post - Get current post with status "DO_SPRAWDZENIA"
  app.get("/api/post", async (req, res) => {
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
  });

  // POST /api/post/update - Update specific cell in sheet
  app.post("/api/post/update", async (req, res) => {
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
  });

  // POST /api/publish - Publish post via webhook
  app.post("/api/publish", async (req, res) => {
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
        const wordpressWebhookUrl = await storage.getWebhookUrl();
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
  });

  // GET /api/posts/published - Get all published posts
  app.get("/api/posts/published", async (req, res) => {
    try {
      const posts = await googleSheetsService.getPublishedPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/webhook-url - Get current WordPress webhook URL
  app.get("/api/webhook-url", async (req, res) => {
    try {
      const webhookUrl = await storage.getWebhookUrl();
      res.json({ webhookUrl: webhookUrl || '' });
    } catch (error) {
      console.error("Error getting webhook URL:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/webhook-url - Set WordPress webhook URL
  app.post("/api/webhook-url", async (req, res) => {
    try {
      const { webhookUrl } = req.body;
      
      if (typeof webhookUrl !== 'string') {
        return res.status(400).json({ message: "Webhook URL must be a string" });
      }
      
      await storage.setWebhookUrl(webhookUrl);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting webhook URL:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
