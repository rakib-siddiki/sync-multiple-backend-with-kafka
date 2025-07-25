import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    // @ts-ignore
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).send({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
