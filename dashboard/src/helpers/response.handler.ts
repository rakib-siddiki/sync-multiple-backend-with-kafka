import { HTTPStatusCode } from "@/utils/http-status-codes";
import { STATUS_CODES } from "http";
import { Response } from "express";

// Success response type
interface SuccessResponse<T> {
  success: true;
  code: HTTPStatusCode;
  data: T;
  message?: string;
}

// Function to send a success response
export const sendResponse = <T>(
  res: Response,
  data: T,
  code: HTTPStatusCode,
  message?: string,
) => {
  const response: SuccessResponse<T> = {
    success: true,
    code,
    data,
    message: message ?? STATUS_CODES[code],
  };

  res.status(code).json(response);
};

//DOC: Example usage in a route
//
// router.get('/example', (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const data: ExampleData = { message: 'This is an example response' };
//     sendResponse<ExampleData>(res, data);
//   } catch (error) {
//     next(error);
//   }
// });
