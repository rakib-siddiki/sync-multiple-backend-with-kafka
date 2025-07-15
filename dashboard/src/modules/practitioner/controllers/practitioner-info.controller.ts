import { Request, Response, NextFunction } from "express";
import { practitionerInfoService } from "../services/practitioner-info.service";

 const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const info = await practitionerInfoService.create(req.body);
    res.status(201).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

export const practitionerInfoController = {
  create,
};