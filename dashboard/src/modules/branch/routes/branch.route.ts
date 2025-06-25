import { Router } from 'express';
import * as branchController from '../controllers/branch.controller';

const router = Router();

// Create a new branch
router.post('/', branchController.createBranch);

// Get all branches
router.get('/', branchController.getAllBranches);

// Get a single branch by ID
router.get('/:id', branchController.getBranch);

// Update a branch
router.patch('/:id', branchController.updateBranch);

// Delete a branch
router.delete('/:id', branchController.deleteBranch);

export const branchRoutes = router;
