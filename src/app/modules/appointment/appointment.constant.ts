import { Prisma } from "../../../generated/prisma/client"

export const appointmentSearchableFields = [
    "patientId",
    "doctorId",
    "scheduleId",
    "videoCallingId",
    "status",
    "paymentStatus",
]

export const appointmentFilterableFields = [
    "patientId",
    "doctorId",
    "scheduleId",
    "videoCallingId",
    "status",
    "paymentStatus",
]

export const appointmentIncludeConfig : Partial<Record<keyof Prisma.AppointmentInclude, Prisma.AppointmentInclude[keyof Prisma.AppointmentInclude]>> = {
    doctor: true,
    patient: true,
    payment: true,
    prescription: true,
    review: true,
    schedule: true,
}