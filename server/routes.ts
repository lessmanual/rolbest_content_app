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
      const { rowId } = publishSchema.parse(req.body);
      
      // Update status in Google Sheets only
      await googleSheetsService.publishPost(rowId);
      
      // Trigger webhook if URL is provided
      const webhookUrl = process.env.MAKE_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rowId })
          });
        } catch (webhookError) {
          console.error("Webhook error:", webhookError);
          // Don't fail the request if webhook fails
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

  const httpServer = createServer(app);
  return httpServer;
}
