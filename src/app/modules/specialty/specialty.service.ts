import status from "http-status";
import { Prisma, Speciality } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Speciality): Promise<Speciality> => {
    const specialty = await prisma.speciality.create({
        data: payload,
    })
    return specialty;
};

const getAllSpecialties = async (): Promise<Speciality[]> => {
    const specialties = await prisma.speciality.findMany();
    return specialties;
};

const deleteSpecialty = async (id: string): Promise<Speciality> => {
    const specialty = await prisma.speciality.delete({
        where: { id },
    });
    return specialty;
};

const updateSpecialty = async (payload: Prisma.SpecialityUpdateInput, id: string): Promise<Speciality> => {
    const { title, description, icon } = payload;
    const specialityData = await prisma.speciality.findUnique({
        where: { id, isDeleted: false }
    })
    if (!specialityData) throw new AppError(status.NOT_FOUND, "Specialty not found or already deleted")

    const result = await prisma.speciality.update({
        where: { id },
        data: {
            title,
            description,
            icon
        }
    })
    return result
}

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty
};