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

const addClient = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            countryCode: Joi.string().required(),
            phoneNumber: Joi.string().required(),
            milkBrand:Joi.string().required(),
            milkRate: Joi.string().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { name,countryCode,phoneNumber,milkBrand,milkRate } = req.body;
        const client = await Client.create({
                            name,
                            countryCode,
                            phoneNumber,
                            milkBrand,
                            milkRate,
                            userId:req.user._id
                            
                        })
        return sendSuccessResponse(res, true,{ client }, 'Client added');

       
       
    } catch (error) {
        console.log('error', error);
        next(error)
    }
    }
    const getClient = async (req: any, res: Response, next: NextFunction) => {
        try {
          const { _id } = req.user;
          const limit = parseInt(req.query.limit, 10) || 10;  
          const page = parseInt(req.query.page, 10) || 1;  
          
          const totalRecords = await Client.countDocuments({ userId: _id });
          const client = await Client.find({ userId: _id })
                                      .skip((page - 1) * limit)
                                      .limit(limit);
      
          const nextPage = (page * limit) < totalRecords;
      
          return sendSuccessResponse(res, true, {
            client,
            totalRecords,
            nextPage
          }, 'Client List');
        } catch (error) {
          console.log('error', error);
          next(error);
        }
      }
      

export { addClient,getClient }