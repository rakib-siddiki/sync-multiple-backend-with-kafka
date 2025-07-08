import { HTTP_STATUS_CODES } from "../utils/http-status-codes";
import { AppError, ErrorResponse } from "../types/error.type";
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../handlers/error.handler";
import { MongoServerError } from "mongodb"; // Import for specific MongoDB errors
import { STATUS_CODES } from "http";
import { ZodError } from "zod";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const response: ErrorResponse = {
    success: false,
    code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    message:
      STATUS_CODES[HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR] ??
      "Internal Server Error",
  };

  console.log("Error handler caught error", error);

  if (error instanceof AppError) {
    errorHandler.appError(error, response);
  } else if (error instanceof ZodError) {
    errorHandler.zodError(error, response);
  } else if (error instanceof MongoServerError) {
    errorHandler.mongoError(error, response);
  } else if (error instanceof Error) {
    errorHandler.generalError(error, response);
  }

  console.error(error); // Log the error for debugging
  res.status(response.code).json(response);
};

//DOC: Usage example:
// throw new AppError(STATUS_CODES.NOT_FOUND, "User not found");
