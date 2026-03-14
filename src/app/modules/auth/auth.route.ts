import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// register
router.post("/register", AuthController.registerPatient);
// login
router.post("/login", AuthController.loginUser);
// my profile
router.get("/me", checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), AuthController.getMe);
// get new token
router.post("/refresh-token", AuthController.getNewToken);
// change password
router.post("/change-password", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), AuthController.changePassword);
// logout user
router.post("/logout", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), AuthController.logoutUser);
// verify email
router.post("/verify-email", AuthController.verifyEmail);
// forget password
router.post("/forget-password", AuthController.forgetPassword);
// reset password
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
