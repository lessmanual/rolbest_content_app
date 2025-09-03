import { type Post } from "@shared/schema";

export interface IStorage {
  getCurrentPost(): Promise<Post | null>;
  getPublishedPosts(): Promise<Post[]>;
  updateCell(rowId: string, column: string, content: string): Promise<void>;
  publishPost(rowId: string): Promise<void>;
  getWebhookUrl(): Promise<string | null>;
  setWebhookUrl(url: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private posts: Map<string, Post>;
  private webhookUrl: string | null = null;

  constructor() {
    this.posts = new Map();
    // Initialize with some mock data for development
    // No mock data - use only real Google Sheets data
  }

  async getCurrentPost(): Promise<Post | null> {
    // No fallback data - return null if Google Sheets not available
    return null;
  }

  async getPublishedPosts(): Promise<Post[]> {
    // No fallback data - return empty array if Google Sheets not available
    return [];
  }

  async updateCell(rowId: string, column: string, content: string): Promise<void> {
    const post = this.posts.get(rowId);
    if (post) {
      (post as any)[column] = content;
      this.posts.set(rowId, post);
    }
  }

  async publishPost(rowId: string): Promise<void> {
    // No action needed for memory storage - Google Sheets is primary
  }

  async getWebhookUrl(): Promise<string | null> {
    return this.webhookUrl || process.env.WORDPRESS_WEBHOOK_URL || null;
  }

  async setWebhookUrl(url: string): Promise<void> {
    this.webhookUrl = url;
  }
}

export const storage = new MemStorage();
