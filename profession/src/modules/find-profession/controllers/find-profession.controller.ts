import type { Request, Response } from "express";
import { professionService } from "../service/find-profession.service";
import { sendResponse } from "@/helpers/response.handler";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";

export const getAll = async (req: Request, res: Response) => {
  const professions = await professionService.getAll();

  sendResponse(
    res,
    professions,
    HTTP_STATUS_CODES.OK,
    "Professions retrieved successfully"
  );
};

export const professionController = {
  getAll,
};
