import { z } from "zod";

export const categorySchema = z.object({
  name: z.string()
    .min(2, "Назва має містити мінімум 2 символи")
    .max(50, "Назва занадто довга"),
  description: z.string().optional(),
});