import * as z from "zod";

/**
 * Validation schema for new content creation request.
 * Enforces strict typing and security constraints on user inputs.
 */
export const createContentSchema = z.object({
  keyword: z
    .string()
    .min(2, { message: "Keyword must be at least 2 characters." })
    .max(150, { message: "Keyword is too long." }),
  contentType: z.string(),
  writingGoal: z.string(),
  contentDepth: z.string(),
  wordCount: z.coerce
    .number()
    .min(100, { message: "Minimum word count is 100." })
    .max(10000, { message: "Maximum word count is 10000." }),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;