import { Request, Response, NextFunction } from "express";
import { practitionerService } from "../services/practitioner.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const practitioner = await practitionerService.create(req.body);
    res.status(201).json({ success: true, data: practitioner });
  } catch (error) {
    next(error);
  }
};

export const practitionerController = {
  create,
};
