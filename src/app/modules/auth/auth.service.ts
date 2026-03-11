import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}
const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password
            // defaultValues=>
            // role: Role.PATIENT
            // needPasswordChange: false
        },
    });

    if (!data.user) {
        // throw new Error("Failed to register Patient")
        throw new AppError(status.BAD_REQUEST, "Failed to register Patient")
    }

    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email
                },
            })
            return patientTx;
        });

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            emailVerified: data.user.emailVerified,
            isDeleted: data.user.isDeleted,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            emailVerified: data.user.emailVerified,
            isDeleted: data.user.isDeleted,
        });

        return {
            ...data,
            accessToken,
            refreshToken,
            patient
        };
    } catch (error) {
        console.log(`Transaction error: ${error}`)
        await prisma.user.delete({
            where: { id: data.user.id }
        })
        throw error;
    }
};

interface ILoginUserPayload {
    email: string;
    password: string;
}
const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    });
    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is Blocked");
    };
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is Deleted");
    };

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        emailVerified: data.user.emailVerified,
        isDeleted: data.user.isDeleted,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        emailVerified: data.user.emailVerified,
        isDeleted: data.user.isDeleted,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };
};

export const AuthService = {
    registerPatient,
    loginUser
};