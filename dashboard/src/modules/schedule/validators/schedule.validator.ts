import { z } from "zod";

export const createScheduleSchema = z.object({
  date: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  scheduleType: z.enum(["dedicated", "class_schedule", "open_for_slot"]),
  services: z.array(z.string()),
});

export const updateScheduleSchema = z.object({
  date: z.coerce.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  scheduleType: z
    .enum(["dedicated", "class_schedule", "open_for_slot"])
    .optional(),
  services: z.array(z.string()).optional(),
});

export const scheduleIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid schedule ID"),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
