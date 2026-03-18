import z from "zod";

export const createDoctorSchedulesSchema = z.object({
    scheduleIds: z.array(z.string("Schedule ID must be a string"), "Schedule IDs must be an array of strings").nonempty({
        message: "Schedule IDs cannot be empty",
    })
});

export const updateDoctorSchedulesSchema = z.object({
    scheduleIds: z.array(z.object({
        id: z.string("Schedule ID must be a string"),
        shouldDelete: z.boolean("Should delete must be a boolean"),
    }), "Schedule IDs must be an array of objects").nonempty({
        message: "Schedule IDs cannot be empty",
    }).optional()
});