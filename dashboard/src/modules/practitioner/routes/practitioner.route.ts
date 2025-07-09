import { Router } from "express";
import { practitionerController } from "../controllers/practitioner.controller";

const router = Router();

// Create Practitioner
router.post("/", practitionerController.create);

// Create PractitionerInfo
router.post("/info", practitionerController.createPractitionerInfo);

// Create PractitionerAccount
router.post("/account", practitionerController.createPractitionerAccount);

// Create InvitedPractitioner
router.post("/invited", practitionerController.createInvitedPractitioner);

export const practitionerRoute = router;
