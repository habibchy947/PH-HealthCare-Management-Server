import { uuidv7 } from "zod/mini";
import { IRequestUser } from "../../interfaces/reqUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Appointment, Prisma } from "../../../generated/prisma/client";
import { appointmentIncludeConfig } from "./appointment.constant";

// Pay Now Book Appointment
const bookAppointment = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId
        }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuidv7())

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: payload.doctorId,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
            }
        });

        // TODO: Payment Integration =>
        return appointmentData;
    });
    return result;
};

// get my appointment
const getMyAppointments = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });
    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointments = [];

    if (patientData) {
        appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientData.id,
            },
            include: {
                doctor: true,
                schedule: true
            }
        })
    } else if (doctorData) {
        appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id,
            },
            include: {
                patient: true,
                schedule: true,
            }
        })
    } else {
        throw new AppError(status.NOT_FOUND, "User not found")
    }
    return appointments;
};

// 1. Completed Or Cancelled Appointments should not be allowed to update status
// 2. Doctors can only update Appoinment status from schedule to inprogress or inprogress to complted or schedule to cancelled.
// 3. Patients can only cancel the scheduled appointment if it scheduled not completed or cancelled or inprogress. 
// 4. Admin and Super admin can update to any status.

// TODO: role based status update
const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IRequestUser) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
            // status: AppointmentStatus.SCHEDULED
        },
        include: {
            doctor: true,
            patient: true,
        }
    });

    if (user?.role === Role.DOCTOR) {
        if (!(user?.email === appointmentData.doctor.email)) {
            throw new AppError(status.UNAUTHORIZED, "You are not authorized to update this appointment");
        }
    }

    if (user?.role === Role.PATIENT) {
        if (!(user?.email === appointmentData.patient.email)) {
            throw new AppError(status.UNAUTHORIZED, "You are not authorized to update this appointment");
        }
    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status: appointmentStatus
        }
    });
};

// refactoring on include of doctor and patient data in appointment details, we can use query builder to get the data in single query instead of multiple queries in case of doctor and patient both
const getMySingleAppointment = async (appointmentId: string, user: IRequestUser) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });
    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointment;

    if (patientData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientId: patientData.id,
            },
            include: {
                doctor: true,
                schedule: true,
            }
        })
    } else if (doctorData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctorData.id,
            },
            include: {
                patient: true,
                schedule: true
            }
        })
    }

    if (!appointment) {
        throw new AppError(status.NOT_FOUND, "Appointment not found")
    }
    return appointment;
};

// integrate query builder
const getAllAppointments = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Appointment, Prisma.AppointmentWhereInput, Prisma.AppointmentInclude>(
        prisma.appointment,
        query,
        {
            searchableFields: [],
            filterableFields: [],
        }
    );

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .include({
            schedule: true,
            doctor: {
                include: {
                    user: true
                }
            },
            patient: {
                include: {
                    user: true,
                }
            }
        })
        .sort()
        .fields()
        .dynamicInclude(appointmentIncludeConfig)
        .execute()

    return result;
};

const bookAppointmentWithPayLater = async () => { };

const initiatePayment = async () => { };

const cancelUnpaidAppointments = async () => { };



export const AppointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initiatePayment,
    cancelUnpaidAppointments,
}