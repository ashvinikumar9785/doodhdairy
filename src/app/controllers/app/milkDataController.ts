const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import createHttpError from "http-errors";
import Joi from "joi";
import { config } from "../../../config/config";
import User from "../../models/User";
import CalendarData from "../../models/CalendarData";
import { utcDateTime } from '../../utils/dateFormats';
import { sendBadRequestResponse, sendNotFoundResponse, sendSuccessResponse } from "../../utils/respons";
import Client from "../../models/Client";
const moment = require('moment'); // For date manipulation
const mongoose = require('mongoose');

const saveMilkData = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            clientId: Joi.string().required(),
            date: Joi.date().required(),
            quantity: Joi.number().required(),
            sellerId:Joi.string().optional()

        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const userId = req.user._id;
        
        const { clientId, date, quantity,sellerId } = req.body;
        const clientdata = await Client.findOne({ _id: clientId })
        const user = await User.findOne({ _id: clientId })
        let milkRate = 0;
        let milkBrand= null;
        if (clientdata) {
            milkRate = Number(clientdata.milkRate);
            milkBrand = clientdata.milkBrand
            if (isNaN(milkRate)) {
                milkRate = 0; // or handle the NaN case appropriately
            }
        } else {
            milkRate = Number(user?.milkRate);
            if (isNaN(milkRate)) {
                milkRate = 0; // or handle the NaN case appropriately
            }
        }
        const client = await CalendarData.create({
            clientId,
            date,
            quantity,
            userId,
            sellerId,
            milkRate,
            milkBrand
        })
        return sendSuccessResponse({res, data: { client }, message: 'Record added'});



    } catch (error) {
        console.log('error', error);
        next(error)
    }
}
const getDataForMonth = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            monthName: Joi.string().required(),
            clientId: Joi.string().required(),

        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { monthName, clientId } = req.body

        const userId = req.user._id
        const startOfMonth = moment(monthName, 'MMMM').startOf('month').toDate();
        const endOfMonth = moment(monthName, 'MMMM').endOf('month').toDate();
       console.log("startOfMonth",startOfMonth)
       console.log("endOfMonth",endOfMonth)

        const result = await CalendarData.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $project: {
                    quantity: { $toDouble: '$quantity' },
                    milkRate: { $toDouble: '$milkRate' }
                }
            },
            {
                $addFields: {
                    totalValue: { $multiply: ['$quantity', '$milkRate'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalValue' },  // Sum of (quantity * milkRate)
                    totalQuantity: { $sum: '$quantity' } // Sum of quantity
                }
            }
        ]);
        
        if (result.length > 0) {
            const firstResult = result[0];
            return sendSuccessResponse({res: res, statustext: true, data: firstResult, message: 'Record Fetched'});
        } else {
            return sendSuccessResponse({res: res, data: [], message: 'Data not found'});

        }
    }
    catch (error) {
        next(error)
    }

};
const getDateData = async (req: any, res: Response, next: NextFunction) => {
    try {
       
        const { clientId, date } = req.query

        const userId = req.user._id
        
           
                const dateBaseMilk = await CalendarData.findOne({
                    clientId: clientId,
                    date: date
                })
            

            return sendSuccessResponse({res, data: dateBaseMilk, message: 'Record Fetched'});
      

    }
    catch (error) {
        next(error)
    }

};

export { saveMilkData, getDataForMonth,getDateData }