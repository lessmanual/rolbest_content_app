import { z } from "zod";

export const postSchema = z.object({
  rowId: z.string(),
  status: z.enum(["DO_SPRAWDZENIA", "OPUBLIKOWANE"]),
  blogTitle: z.string().optional(),
  blogContent: z.string().optional(),
  facebookContent: z.string().optional(),
  instagramContent: z.string().optional(),
  imageUrl: z.string().optional(),
  publishedDate: z.string().optional(),
});

export const updateCellSchema = z.object({
  rowId: z.string(),
  column: z.string(),
  content: z.string(),
});

export const publishSchema = z.object({
  rowId: z.string(),
});

export type Post = z.infer<typeof postSchema>;
export type UpdateCell = z.infer<typeof updateCellSchema>;
export type PublishRequest = z.infer<typeof publishSchema>;
