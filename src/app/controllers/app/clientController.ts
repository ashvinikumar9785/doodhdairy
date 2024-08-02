const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import createHttpError from "http-errors";
import Joi, { date } from "joi";
import User from "../../models/User";
import Client from "../../models/Client";
import { sendSuccessResponse } from "../../utils/respons";
const mongoose = require('mongoose');

const addClient = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            countryCode: Joi.string().required(),
            phoneNumber: Joi.string().required(),
            milkBrand: Joi.string().required(),
            milkRate: Joi.number().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { name, countryCode, phoneNumber, milkBrand, milkRate } = req.body;

        const checkPhone = await checkPhoneAlreadyExists(null, countryCode, phoneNumber);

        if (checkPhone) {
            return sendSuccessResponse({res, statustext: false, message: 'Phone number already exists for another user'});
        }
        const client = await Client.create({
            name,
            countryCode,
            phoneNumber,
            milkBrand,
            milkRate,
            userId: req.user._id

        })
        return sendSuccessResponse({res, data: { client }, message: 'Client added'});



    } catch (error) {
        console.log('error', error);
        next(error)
    }
}


const editClient = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            clientId: Joi.string().required(),
            name: Joi.string().required(),
            countryCode: Joi.string().required(),
            phoneNumber: Joi.string().required(),
            milkBrand: Joi.string().required(),
            milkRate: Joi.number().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { name, countryCode, phoneNumber, milkBrand, milkRate,clientId } = req.body;
        const checkPhone = await checkPhoneAlreadyExists(clientId, countryCode, phoneNumber);


        if (checkPhone) {
            return sendSuccessResponse({res, statustext: false, message: 'Phone number already exists for another user'});
        }
        const client = await Client.findById({_id:clientId})
        if(client){
            client.name=name
            client.countryCode=countryCode
            client.phoneNumber=phoneNumber
            client.milkBrand= milkBrand
            client.milkRate=milkRate
            await client.save()
            return sendSuccessResponse({res, data: { client }, message: 'Client updated'});

        }
        else{
            return sendSuccessResponse({res, statustext: false, message: 'Client not found'});

        }
       



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
        const result = await Client.paginate({ userId:  new mongoose.Types.ObjectId(userId),isDeleted:false }, options);

        const { docs: clients, totalDocs: totalRecords, hasNextPage: nextPage } = result;

        return sendSuccessResponse({res, data: { clients, totalRecords, nextPage }, message: 'Client List'});
    } catch (error) {
        console.log('error', error);
        next(error)
    }
};

const getClientProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.query;
        let client = await Client.findById({ _id: id });
        return sendSuccessResponse({res, data: client, message: 'Client data'});

    } catch (error) {

    }
}

const clientDelete = async (req: any, res: Response, next: NextFunction) => {
    try {
        const clientId = req.params.id;
        let client = await Client.findById({ _id: clientId });
        if(client){
            client.isDeleted= true
            await client.save();

           
        }
        return sendSuccessResponse({res,  message: 'Profile Deleted'});

    } catch (error) {

    }
}
async function checkPhoneAlreadyExists(userID: string | null, countryCode: string, phoneNumber: string): Promise<any> {
    try {
        const query: any = {
            countryCode: countryCode,
            phoneNumber: phoneNumber
        };

        // Add the $ne condition if userID is provided
        if (userID) {
            query._id = { $ne: userID };
        }

        const user = await User.findOne(query).lean();

        return user !== null;
    } catch (error) {
        console.error('Error checking phone number existence:', error);
        throw new Error('Failed to check phone number existence');
    }
}
export { addClient, getClient, getClientProfile,clientDelete,editClient }