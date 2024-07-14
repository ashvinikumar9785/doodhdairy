import { Response } from 'express';

export const sendUnauthorizedResponse = (res: Response,status:boolean=false, message: string = 'UNAUTHORIZED') => {
    return res.status(401).json({ status,message });
};

export const sendSuccessResponse = (res: Response,status:boolean = true, data: any = {}, message: string = 'SUCCESS') => {
    return res.status(200).json({ status,message, data });
};

export const sendNotFoundResponse = (res: Response,status:boolean=false, message: string = 'NOT_FOUND') => {
    return res.status(404).json({ status,message });
};

export const sendBadRequestResponse = (res: Response, message: string = 'BAD_REQUEST') => {
    return res.status(400).json({ status: false, message });
};
