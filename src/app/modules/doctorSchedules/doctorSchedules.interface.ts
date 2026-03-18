export interface ICreateDoctorSchedulesPayload {
    scheduleIds: string[];
};

export interface IUpdateDoctorSchedulesPayload {
    scheduleIds: {
        shouldDelete: boolean;
        id: string;
    }[]
}