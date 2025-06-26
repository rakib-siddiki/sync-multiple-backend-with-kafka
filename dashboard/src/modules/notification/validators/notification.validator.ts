import { z } from "zod";

// Create Notification Schema
export const createNotificationSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  message: z
    .string()
    .min(2, "Message must be at least 2 characters")
    .max(500, "Message must be at most 500 characters"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

// Update Notification Schema
export const updateNotificationSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  message: z
    .string()
    .min(2, "Message must be at least 2 characters")
    .max(500, "Message must be at most 500 characters")
    .optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
});

// Notification ID Schema (used for validating notification ID)
export const notificationIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid notification ID"),
});

// Type Inferences for Input
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
