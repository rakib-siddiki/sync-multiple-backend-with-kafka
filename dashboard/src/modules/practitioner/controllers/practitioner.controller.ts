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

export const createPractitionerInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const info = await practitionerService.createPractitionerInfo(req.body);
    res.status(201).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

export const createPractitionerAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const account = await practitionerService.createPractitionerAccount(
      req.body
    );
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

export const createInvitedPractitioner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invited = await practitionerService.createInvitedPractitioner(
      req.body
    );
    res.status(201).json({ success: true, data: invited });
  } catch (error) {
    next(error);
  }
};

export const practitionerController = {
  create,
  createPractitionerInfo,
  createPractitionerAccount,
  createInvitedPractitioner,
};
