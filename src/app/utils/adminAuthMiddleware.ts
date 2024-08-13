const jwt = require('jsonwebtoken');
import createHttpError from 'http-errors';
import { NextFunction, Response } from "express";
import Admin from "../models/Admin";

module.exports = async (req: any, res: Response, next: NextFunction) => {
    try {
        var token = req.cookies?.token || null;
        if (!token) {
            throw createHttpError.Unauthorized("Invalid Token")
        }
        if (token == 'undefined') {
            throw createHttpError.Unauthorized("Invalid Token")
        }
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            var user = await Admin.findOne({ _id: decoded._id }, '_id name email status profilePicture type role assignedUsers').lean();
            if (user) {
                if (user.status) {
                    req.user = user;
                    next();
                } else {
                    throw createHttpError.Unauthorized('Your account is inactive, please contact to support.')
                }
            } else {
                throw createHttpError.Unauthorized("Invalid Token")
            }
        } else {
            throw createHttpError.Unauthorized("Invalid Token")
        }
    } catch (error) {
        next(error)
    }
}