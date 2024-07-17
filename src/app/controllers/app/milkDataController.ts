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

        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const userId = req.user._id;
        const { clientId, date, quantity } = req.body;
        const client = await CalendarData.create({
            clientId,
            date,
            quantity,
            userId,


        })
        return sendSuccessResponse(res, true, { client }, 'Record added');



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
            date: Joi.date().optional(),

        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { monthName, clientId, date } = req.body

        const userId = req.user._id
        const startOfMonth = moment(monthName, 'MMMM').startOf('month').toDate();
        const endOfMonth = moment(monthName, 'MMMM').endOf('month').toDate();
        const client = await Client.findOne({ _id: clientId })


        if (client) {
            const result = await CalendarData.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        clientId: new mongoose.Types.ObjectId(clientId),
                        date: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: { $toDouble: '$quantity' } }
                    }
                }
            ]);
            let dateBaseMilk = null;
            if (date) {
                dateBaseMilk = await CalendarData.findOne({
                    userId: userId,
                    clientId: clientId,
                    date: date
                })
            }

            const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
            const totalQuantityNumber = Number(totalQuantity);


            return sendSuccessResponse(res, true, {
                totalQuantity: totalQuantityNumber,
                totalAmount: totalQuantityNumber * Number(client.milkRate),
                dateBaseMilk
            }, 'Record Fetched');
        } else {
            return sendNotFoundResponse(res, false, 'Data not found');

        }

    }
    catch (error) {
        next(error)
    }

};


export { saveMilkData, getDataForMonth }