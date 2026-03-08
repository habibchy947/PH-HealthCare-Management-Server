import { NextFunction, Request, RequestHandler, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";


const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await SpecialtyService.createSpecialty(payload);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Specialty Created Successfully",
            data: result,
        });
    },
);

const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const specialties = await SpecialtyService.getAllSpecialties();
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialty fetched Successfully",
            data: specialties,
        });
    },
);

const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await SpecialtyService.deleteSpecialty(id as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialty deleted Successfully",
            data: result,
        });
    },
);

const updateSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await SpecialtyService.updateSpecialty(req.body, id as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialty updated Successfully",
            data: result,
        });
    },
);

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty
};