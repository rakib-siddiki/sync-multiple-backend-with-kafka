import { Request, Response, NextFunction } from 'express';
import * as branchService from '../services/branch.service';
import { createBranchSchema, updateBranchSchema, branchIdSchema } from '../validators/branch.validator';

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createBranchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const branch = await branchService.createBranch(parsed.data);
    res.status(201).json({ data: branch });
  } catch (err) {
    next(err);
  }
};

export const getBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsed = branchIdSchema.safeParse({ id });
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const branch = await branchService.getBranchById(parsed.data.id);
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json({ data: branch });
  } catch (err) {
    next(err);
  }
};

export const getAllBranches = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await branchService.getAllBranches();
    res.json({ data: branches });
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const idParsed = branchIdSchema.safeParse({ id });
    if (!idParsed.success) {
      return res.status(400).json({ error: idParsed.error.errors });
    }
    
    const bodyParsed = updateBranchSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: bodyParsed.error.errors });
    }
    
    const branch = await branchService.updateBranch(id, bodyParsed.data);
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json({ data: branch });
  } catch (err) {
    next(err);
  }
};

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsed = branchIdSchema.safeParse({ id });
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const deleted = await branchService.deleteBranch(parsed.data.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
