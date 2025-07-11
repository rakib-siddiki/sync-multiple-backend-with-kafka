import { Request, Response, NextFunction } from "express";
import { practitionerAccountService } from "../services/practitioner-account.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await practitionerAccountService.create(req.body);
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

export const practitionerAccountController = {
  create,
};
