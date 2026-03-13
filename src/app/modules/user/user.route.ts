import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.schema";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-doctor", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), validateRequest(createDoctorZodSchema), UserController.createDoctor);

router.post("/create-admin", checkAuth(Role.SUPER_ADMIN, Role.ADMIN),validateRequest(createAdminZodSchema),     UserController.createAdmin);

export const UserRoutes = router;