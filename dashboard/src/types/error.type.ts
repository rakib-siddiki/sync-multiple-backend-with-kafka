import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: ErrorDetails,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Type for error details
export type ErrorDetails = {
  stack?: string;
  [key: string]: unknown;
};

// Error response type
export interface ErrorResponse {
  success: false;
  code: number;
  message: string | { message: string }[];
  details?: ErrorDetails | ZodError | string[];
}
