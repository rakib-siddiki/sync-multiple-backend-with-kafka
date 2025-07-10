import { Request, Response, NextFunction } from "express";
import { organizationService } from "../services/organization.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organization = await organizationService.create(req.body);
    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    next(error);
  }
};

export const organizationController = {
  create,
};
