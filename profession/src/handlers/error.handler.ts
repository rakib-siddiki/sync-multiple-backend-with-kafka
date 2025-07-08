import { HTTP_STATUS_CODES } from "../utils/http-status-codes";
import { AppError, ErrorResponse } from "../types/error.type";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const appError = (error: AppError, response: ErrorResponse) => {
  response.code = error.statusCode;
  response.message = error.message;
  response.details = error.details;
};

export const zodError = (error: ZodError, response: ErrorResponse) => {
  response.code = HTTP_STATUS_CODES.BAD_REQUEST;
  response.message = error.errors.map((err) => ({ message: err.message }));
  response.details = process.env.NODE_ENV === "development" ? error : undefined;
};

export const mongoError = (
  error: MongoServerError,
  response: ErrorResponse,
) => {
  // Handle all MongoDB/Mongoose errors
  response.code = HTTP_STATUS_CODES.BAD_REQUEST; // Default for validation errors

  if (error instanceof mongoose.Error.ValidationError) {
    response.message = "Validation failed";
    response.details = Object.values(error.errors).map((err) => err.message);
  } else if (error.name === "MongoError" || error.code) {
    // Handle MongoDB-specific errors

    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyPattern || {}).join(", ");

      response.code = HTTP_STATUS_CODES.CONFLICT; // 409 Conflict
      response.message = `Duplicate key error on field(s): ${duplicateField}.`;
      response.details = error.keyValue;
    } else {
      response.message = `MongoDB error: ${error.message}`;
    }
  } else {
    // General Mongoose error
    response.message = error.message;
  }
};

export const generalError = (error: Error, response: ErrorResponse) => {
  response.message = error.message;
  response.details =
    process.env.NODE_ENV === "development" ? { stack: error.stack } : undefined;
};

export const errorHandler = {
  appError,
  zodError,
  mongoError,
  generalError,
};
