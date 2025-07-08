import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validate = (
  schema: AnyZodObject,
  type: "body" | "params" | "query" | "headers" = "body",
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      let dataToValidate;

      switch (type) {
        case "body":
          dataToValidate = req.body;
          break;
        case "params":
          dataToValidate = req.params;
          break;
        case "query":
          dataToValidate = req.query;
          break;
        case "headers":
          dataToValidate = req.headers;
          break;
        default:
          dataToValidate = req.body;
      }

      await schema.parseAsync(dataToValidate);

      next();
    } catch (error) {
      next(error);
    }
  };
};
