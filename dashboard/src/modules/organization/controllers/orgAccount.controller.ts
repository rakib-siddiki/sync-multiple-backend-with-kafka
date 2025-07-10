import { Request, Response, NextFunction } from "express";
import { orgAccountService } from "../services/organization-account.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organization = await orgAccountService.create(req.body);
    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    next(error);
  }
};

export const orgAccountController = {
  create,
};
