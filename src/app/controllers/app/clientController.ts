const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import createHttpError from "http-errors";
import Joi from "joi";
import { config } from "../../../config/config";
import User from "../../models/User";
import Client from "../../models/Client";
import { utcDateTime } from '../../utils/dateFormats';
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse } from "../../utils/respons";
const mongoose = require('mongoose');

const addClient = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            countryCode: Joi.string().required(),
            phoneNumber: Joi.string().required(),
            milkBrand: Joi.string().required(),
            milkRate: Joi.string().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { name, countryCode, phoneNumber, milkBrand, milkRate } = req.body;
        const client = await Client.create({
            name,
            countryCode,
            phoneNumber,
            milkBrand,
            milkRate,
            userId: req.user._id

        })
        return sendSuccessResponse(res, true, { client }, 'Client added');



    } catch (error) {
        console.log('error', error);
        next(error)
    }
}
const getClient = async (req: any, res: Response,next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided
        const userId = req.user._id; // Assuming userId is passed as a URL parameter

        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            lean: true, // Use lean queries for better performance
            leanWithId: false, // By default, document id is removed. Set to true if you need it.
        };

        // Use the paginate method with your query
        const result = await Client.paginate({ userId:  new mongoose.Types.ObjectId(userId) }, options);

        const { docs: clients, totalDocs: totalRecords, hasNextPage: nextPage } = result;

        return sendSuccessResponse(res, true, {
            clients,
            totalRecords,
            nextPage
        }, 'Client List');
    } catch (error) {
        console.log('error', error);
        next(error)
    }
};

const getClientProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.query;
        let client = await Client.findById({ _id: id });
        return res.json({ client });

    } catch (error) {

    }
}

export { addClient, getClient, getClientProfile }