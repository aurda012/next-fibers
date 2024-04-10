import * as z from "zod";

export const FiberValidation = z.object({
  fiber: z.string().min(3, { message: "Minimum 3 characters." }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  fiber: z.string().min(3, { message: "Minimum 3 characters." }),
});
