import { z } from "zod";

export const postSchema = z.object({
  rowId: z.string(),
  status: z.enum(["Do akceptacji", "Opublikuj", "Opublikowano", "Archiwum"]),
  blogTitle: z.string().optional(),
  blogContent: z.string().optional(), // Column C - text for editing
  blogContentHtml: z.string().optional(), // Column D - HTML for preview
  facebookContent: z.string().optional(),
  instagramContent: z.string().optional(),
  imageUrl: z.string().optional(),
  publishedDate: z.string().optional(),
  statusWP: z.string().optional(), // Column I - WordPress status
  statusSM: z.string().optional(), // Column J - Social Media status
});

export const updateCellSchema = z.object({
  rowId: z.string(),
  column: z.string(),
  content: z.string(),
});

export const publishSchema = z.object({
  rowId: z.string(),
  publishType: z.enum(["social-media", "wordpress"]),
});

export type Post = z.infer<typeof postSchema>;
export type UpdateCell = z.infer<typeof updateCellSchema>;
export type PublishRequest = z.infer<typeof publishSchema>;
