import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { ScheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createScheduleZodSchema, updateScheduleZodSchema } from "./schedule.schema";

const router = Router();

router.post('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createScheduleZodSchema), ScheduleController.createSchedule);
router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), ScheduleController.getAllSchedules);
router.get('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), ScheduleController.getScheduleById);
router.patch('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateScheduleZodSchema), ScheduleController.updateSchedule);
router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ScheduleController.deleteSchedule);

export const scheduleRoutes = router;