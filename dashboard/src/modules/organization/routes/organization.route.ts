import { Router } from "express";
import { organizationController } from "../controllers/organization.controller";
import { orgAccountController } from "../controllers/orgAccount.controller";

const router = Router();

router.post("/", organizationController.create);
router.post("/account", orgAccountController.create);

export const organizationRoutes = router;
