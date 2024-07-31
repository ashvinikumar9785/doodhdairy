import { Response } from 'express';

export const sendUnauthorizedResponse = ({ res, statustext = false, message = 'UNAUTHORIZED' } : { res: Response, statustext?: boolean, message?: string }) => {
    return res.status(401).json({ statustext,message });
};

export const sendSuccessResponse = ({ res, statustext = true, data = {}, message = 'SUCCESS' } : { res: Response, statustext?: boolean, data?: any, message?: string }) => {
    return res.status(200).json({ statustext, message, data });
};

export const sendNotFoundResponse = ({ res, statustext = false, message = 'NOT_FOUND' } : { res: Response, statustext?: boolean, message?: string }) => {
    return res.status(404).json({ statustext, message });
};

export const sendBadRequestResponse = ({ res, statustext = false, message = 'BAD_REQUEST' } : { res: Response, statustext?: boolean, message?: string }) => {
    return res.status(400).json({ statustext, message });
};
