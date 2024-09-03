const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Joi from "joi";
import User from "../../models/User";
import CalendarData from "../../models/CalendarData";
import {  sendSuccessResponse } from "../../utils/respons";
import Client from "../../models/Client";
import DepositAmount from "../../models/DepositAmount";
import { getDaysArray } from "../../utils/dateFormats";
const moment = require('moment'); // For date manipulation
const mongoose = require('mongoose');

const saveMilkData = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            clientId: Joi.string().required(),
            id: Joi.string().optional(),
            date: Joi.date().required(),
            quantity: Joi.number().required(),
            sellerId: Joi.string().optional()

        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const userId = req.user._id;

        const { clientId, date, quantity, sellerId, id } = req.body;
        const clientdata = await Client.findOne({ _id: clientId })
        const user = await User.findOne({ _id: clientId })
        let milkRate = 0;
        let milkBrand = null;
        if (id) {
            const updatedRecord = await CalendarData.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        quantity,
                    }
                },
                {
                    returnOriginal: false
                }
            );
            return sendSuccessResponse({ res, data: { client: updatedRecord }, message: 'Record updated' });

        }
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
        return sendSuccessResponse({ res, data: { client }, message: 'Record added' });



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
        const startOfMonth = moment(monthName, 'YYYY-MMMM').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const endOfMonth = moment(monthName, 'YYYY-MMMM').endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

        console.log("startOfMonthstartOfMonth",startOfMonth,endOfMonth)

        const result = await CalendarData.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
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
        let amount = await DepositAmount.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
                }
            },
            {
                $project: {
                    amount: { $toDouble: '$amount' }                    
                }
            },
            {
                $addFields: {
                    totalValue: { $multiply: ['$amount'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaidAmount: { $sum: '$totalValue' },  
                }
            }
        ]);
        if (result.length > 0) {
            let firstResult = result[0];
             amount = amount.length?amount[0].totalPaidAmount:0;
             firstResult.totalPaidAmount = amount
            return sendSuccessResponse({ res: res, statustext: true, data:firstResult, message: 'Record Fetched' });
        } else {
            return sendSuccessResponse({ res: res, data: [], message: 'Data  found' });

        }
    }
    catch (error) {
        next(error)
    }

};

const getMonthDeposit = async (req: any, res: Response, next: NextFunction) => {
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
        const startOfMonth = moment(monthName, 'YYYY-MMMM').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const endOfMonth = moment(monthName, 'YYYY-MMMM').endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');


      
        let deposite = await DepositAmount.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
                }
            }
           
        ]);
        if (deposite.length > 0) {
            return sendSuccessResponse({ res: res, statustext: true, data:deposite, message: 'Record Fetched' });
        } else {
            return sendSuccessResponse({ res: res, data: [], message: 'Data  found' });

        }
    }
    catch (error) {
        next(error)
    }

};

const getMonthEntries = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            monthName: Joi.string().required(),
            clientId: Joi.string().required(),

        });
        const { error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { monthName, clientId } = req.body

        const startOfMonth = moment(monthName, 'YYYY-MMMM').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const endOfMonth = moment(monthName, 'YYYY-MMMM').endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

        const result = await CalendarData.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
                }
            },
        ]);
        if (result.length > 0) {
            const allDates = getDaysArray(moment(monthName).format('YYYY'), moment(monthName).format('M'));
            const allEntries: any[] = [];
            allDates.forEach((date: any) => {
                const isExist = result.find((data) => moment(date).format('YYYY-MM-DD') === moment(data.date).format('YYYY-MM-DD'));
                if (isExist) {
                    allEntries.push(isExist);
                } else {
                    allEntries.push({
                        ...result[0],
                        date: date,
                        quantity: 0,
                    });
                }
            });
            return sendSuccessResponse({ res: res, statustext: true, data: allEntries, message: 'Record Fetched' });
        } else {
            return sendSuccessResponse({ res: res, data: [], message: 'Data not found' });

        }
    }
    catch (error) {
        next(error)
    }

};

const getDateList = async (req: any, res: Response, next: NextFunction) => {
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

        const startOfMonth = moment(monthName, 'YYYY-MMMM').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const endOfMonth = moment(monthName, 'YYYY-MMMM').endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');


        const result = await CalendarData.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id"
                }
            }
        ]);
        if (result.length > 0) {
            return sendSuccessResponse({ res: res, statustext: true, data: result, message: 'Record Fetched' });
        } else {
            return sendSuccessResponse({ res: res, data: [], message: 'Data not found' });

        }
    }
    catch (error) {
        next(error)
    }

};

const deleteEntry = async (req: any, res: Response, next: NextFunction) => {
    try {
        const entryId = req.params.id;
        let client = await CalendarData.deleteOne({ _id: entryId });
        if (client.deletedCount === 1) {
            return sendSuccessResponse({ res: res, statustext: true, data: {}, message: 'Record Deleted' });

        } else {
            return sendSuccessResponse({ res: res, data: {}, message: 'Data not found' });
        }

    } catch (error) {
        next(error)
    }
}
const getDateData = async (req: any, res: Response, next: NextFunction) => {
    try {

        const { clientId, date } = req.query

        const userId = req.user._id


        const dateBaseMilk = await CalendarData.findOne({
            clientId: clientId,
            date: date
        })


        return sendSuccessResponse({ res, data: dateBaseMilk, message: 'Record Fetched' });


    }
    catch (error) {
        next(error)
    }
}


    const depositAmount = async (req: any, res: Response, next: NextFunction) => {
        try {
            const schema = Joi.object({
                clientId: Joi.string().required(),
                date: Joi.date().required(),
                amount: Joi.number().required(),
    
            });
            const { value, error } = schema.validate(req.body);
            if (error) {
                console.log("error.message",error.message)

                throw createHttpError.UnprocessableEntity(error.message)
            }
            const userId = req.user._id;
    
            const { clientId, date, amount } = req.body;
            const clientdata = await Client.findOne({ _id: clientId })
          
    
            const depositAmount = await DepositAmount.create({
                clientId,
                date,
                amount,
            })
            return sendSuccessResponse({ res, data: { depositAmount }, message: 'Record added' });
    
    
    
        } catch (error) {
            console.log('error', error);
            next(error)
        }
    };


    const getRemainingAmount = async (req: any, res: Response, next: NextFunction) => {
        try {
            const schema = Joi.object({
                clientId: Joi.string().required(),
            });
            const { value, error } = schema.validate(req.body);
            if (error) {
                throw createHttpError.UnprocessableEntity(error.message)
            }
            const { clientId } = req.body
            const [result] = await CalendarData.aggregate([
                {
                    $match: {
                        clientId: new mongoose.Types.ObjectId(clientId),
                        // date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
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
                        totalAmount: { $sum: '$totalValue' }
                    }
                }
            ]);
            const [amountResult] = await DepositAmount.aggregate([
                {
                    $match: {
                        clientId: new mongoose.Types.ObjectId(clientId),
                        // date: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) }
                    }
                },
                {
                    $project: {
                        amount: { $toDouble: '$amount' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPaidAmount: { $sum: '$amount' }
                    }
                }
            ]);
            const totalAmount = result?.totalAmount || 0;
            const totalPaidAmount = amountResult?.totalPaidAmount || 0;
            // Calculate remaining amount based on which is greater
            let remainingAmount =totalAmount;
            let balanceAmount = 0;
            if (totalAmount >= totalPaidAmount) {
                remainingAmount = totalAmount - totalPaidAmount;
            } else {
                remainingAmount = totalPaidAmount-totalAmount; // Or you can keep it as a negative value if overpaid
                balanceAmount = totalPaidAmount-totalAmount;
            }
            // remainingAmount = totalAmount-totalPaidAmount;
            return sendSuccessResponse({ res: res, statustext: true, data: {remainingAmount,totalPaidAmount:totalPaidAmount,totalAmount:totalAmount,balanceAmount}, message: 'Record Fetched' });
        }
        catch (error) {
            next(error)
        }
    
    };

    const editDeposite = async (req: any, res: Response, next: NextFunction) => {
        try {
            const schema = Joi.object({
                id: Joi.string().required(),
                amount: Joi.number().required(),
    
            });
            const { value, error } = schema.validate(req.body);
            if (error) {
                throw createHttpError.UnprocessableEntity(error.message)
            }
            const { amount,id } = req.body;
            const deposit = await DepositAmount.findById({_id:id})
    
            if(deposit){
                deposit.amount=amount
                
                await deposit.save()
                return sendSuccessResponse({res, data: { deposit }, message: 'Deposit amount updated'});
            }
            else{
                return sendSuccessResponse({res, statustext: false, message: 'Client not found'});
            }
        } catch (error) {
            console.log('error', error);
            next(error)
        }
    }


export { saveMilkData, getDataForMonth, getDateData, getDateList, deleteEntry, getMonthEntries,depositAmount,getRemainingAmount,getMonthDeposit,editDeposite }