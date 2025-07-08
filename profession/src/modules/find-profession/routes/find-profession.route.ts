import { Router } from "express";
import { professionController } from "../controllers/find-profession.controller";
import { asyncHandler } from "@/helpers/async.handler";

const router = Router();

router.get("/", asyncHandler(professionController.getAll));

export default router;
