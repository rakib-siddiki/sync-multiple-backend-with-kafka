import { Request, Response, NextFunction } from "express";
import { invitedPractitionerService } from "../services/invited-practitioner.service";

const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invited = await invitedPractitionerService.create(req.body);
    res.status(201).json({ success: true, data: invited });
  } catch (error) {
    next(error);
  }
};

export const invitedPractitionerController = {
  create,
};
