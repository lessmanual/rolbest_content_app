import { type Post } from "@shared/schema";

export interface IStorage {
  getCurrentPost(): Promise<Post | null>;
  getPublishedPosts(): Promise<Post[]>;
  updateCell(rowId: string, column: string, content: string): Promise<void>;
  publishPost(rowId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private posts: Map<string, Post>;

  constructor() {
    this.posts = new Map();
    // Initialize with some mock data for development
    this.posts.set("ROW_15", {
      rowId: "ROW_15",
      status: "DO_SPRAWDZENIA",
      blogTitle: "Jak Skutecznie Zarządzać Projektami w 2024",
      blogContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      facebookContent: "🚀 Sprawdź nasz najnowszy wpis na blogu! Dowiedz się więcej o naszych usługach i odkryj, jak możemy Ci pomóc. #ROLBEST #Blog",
      instagramContent: "✨ Nowy wpis na blogu już dostępny! 📝 Sprawdź link w bio 👆\n\n#ROLBEST #Blog #NewPost #Business #Marketing #Tips #Entrepreneur #Success",
      imageUrl: "https://images.unsplash.com/photo-1553484771-371a605b060b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
    });
  }

  async getCurrentPost(): Promise<Post | null> {
    // Find first post with DO_SPRAWDZENIA status
    for (const post of Array.from(this.posts.values())) {
      if (post.status === "DO_SPRAWDZENIA") {
        return post;
      }
    }
    return null;
  }

  async getPublishedPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.status === "OPUBLIKOWANE")
      .sort((a, b) => (b.publishedDate || "").localeCompare(a.publishedDate || ""));
  }

  async updateCell(rowId: string, column: string, content: string): Promise<void> {
    const post = this.posts.get(rowId);
    if (post) {
      (post as any)[column] = content;
      this.posts.set(rowId, post);
    }
  }

  async publishPost(rowId: string): Promise<void> {
    const post = this.posts.get(rowId);
    if (post) {
      post.status = "OPUBLIKOWANE";
      post.publishedDate = new Date().toISOString();
      this.posts.set(rowId, post);
    }
  }
}

export const storage = new MemStorage();
