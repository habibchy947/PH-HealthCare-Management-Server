import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.schema";

const router = Router();

router.post("/create-doctor", validateRequest(createDoctorZodSchema), UserController.createDoctor);

export const UserRoutes = router;