import { NextFunction, Request, Response, Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { CookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { createSpecialtySchema } from "./specialty.schema";

const router = Router();

router.post("/", 
    /* checkAuth(Role.ADMIN, Role.SUPER_ADMIN),*/ multerUpload.single("file") ,
    validateRequest(createSpecialtySchema),
    SpecialtyController.createSpecialty);

router.get("/", SpecialtyController.getAllSpecialties);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.deleteSpecialty);
 
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.updateSpecialty);

export const SpecialtyRoutes = router;