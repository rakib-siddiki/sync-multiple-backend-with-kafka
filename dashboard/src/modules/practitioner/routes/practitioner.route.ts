import { Router } from "express";
import { practitionerController } from "../controllers/practitioner.controller";
import { invitedPractitionerController } from "../controllers/invited-practitioner.controller";
import { practitionerInfoController } from "../controllers/practitioner-info.controller";
import { practitionerAccountController } from "../controllers/practitioner-account.controller";

const router = Router();

// Create Practitioner
router.post("/", practitionerController.create);

// Create PractitionerInfo
router.post("/info", practitionerInfoController.create);

// Create PractitionerAccount
router.post("/account", practitionerAccountController.create);

// Create InvitedPractitioner
router.post("/invited", invitedPractitionerController.create);

export const practitionerRoute = router;
