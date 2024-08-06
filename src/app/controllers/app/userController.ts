const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import createHttpError from "http-errors";
import Joi from "joi";
import { config } from "../../../config/config";
import User from "../../models/User";
import { utcDateTime } from '../../utils/dateFormats';
import {  sendNotFoundResponse, sendSuccessResponse } from "../../utils/respons";

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            token: Joi.string().required(),
            socialType: Joi.string().required(),
            deviceType: Joi.string().required(),
            socialId: Joi.string().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        let payload;
        if (value.socialType == 'GOOGLE') {
            let client = new OAuth2Client()
            const ticket = await client.verifyIdToken({
                idToken: req.body.token,
                audience: config.GOOGLE_OAUTH_CLIENTID,
            });
            payload = ticket.getPayload();
        } else {

        }
        let filter: { email?: string, googleId?: string, appleId?: string } = {}
        if (payload?.email) {
            filter.email = payload.email;
        } else {
            if (req.body.socialType == 'GOOGLE') {
                filter.googleId = payload?.sub
            } else {
                filter.appleId = payload?.sub
            }
        }
        let user = await User.findOne({ ...filter }).lean()
        if (!user) {
            user = await User.create({
                name: payload?.name,
                email: payload?.email,
                profilePicture: payload?.picture,
                authTokenIssuedAt: utcDateTime().valueOf(),
                role: req.body.role,
            })
        }
        else {
            user = await User.findOneAndUpdate(
                { ...filter },
                { authTokenIssuedAt: utcDateTime().valueOf() },
                { new: true }
            );
        }
        if (!user) {
            return sendSuccessResponse({res, statustext: false, data: { user }, message: 'Failed to create or update user'});
        }

        if (!user.role) {
            return sendSuccessResponse({res, data: { user }, message: 'Login Success please update role'});
        }

        const token = jwt.sign(
            { _id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: '30d',
                issuer: 'doodhdiary'
            }
        );
        return sendSuccessResponse({res, data: { user, token }, message: 'Login Success'});


    } catch (error) {
        console.log('error', error);
        next(error)
    }
}
// const login = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const schema = Joi.object({
//             token: Joi.string().required(),
//             socialType: Joi.string().required(),
//             deviceType: Joi.string().required(),
//             socialId: Joi.string().required(),
//             email: Joi.string().required(),
//         });
//         const { value, error } = schema.validate(req.body);
//         if (error) {
//             throw createHttpError.UnprocessableEntity(error.message)
//         }
//         // let payload;
//         // if (value.socialType == 'GOOGLE') {
//         //     let client = new OAuth2Client()
//         //     const ticket = await client.verifyIdToken({
//         //         idToken: req.body.token,
//         //         audience: config.GOOGLE_OAUTH_CLIENTID,
//         //     });
//         //     payload = ticket.getPayload();
//         // } else {

//         // }
//         // let filter: { email?: req, googleId?: string, appleId?: string } = {}
//         // if (payload?.email) {
//         //     filter.email = payload.email;
//         // } else {
//         //     if (req.body.socialType == 'GOOGLE') {
//         //         filter.googleId = payload?.sub
//         //     } else {
//         //         filter.appleId = payload?.sub
//         //     }
//         // }
//         let user = await User.findOne({email:req.body.email }).lean()
//         if (!user) {
//             user = await User.create({
//                 // name: payload?.name,
//                 // email: payload?.email,
//                 // profilePicture: payload?.picture,
//                 authTokenIssuedAt: utcDateTime().valueOf(),
//                 role: req.body.role,
//             })
//         }
//         else{
//             user =  await User.findOneAndUpdate(
//                 { email:req.body.email  }, 
//                 {authTokenIssuedAt: utcDateTime().valueOf()},     
//                 { new: true } 
//             );
//         }
//         // if (!user) {
//         //     return sendSuccessResponse(res, false,{ user }, 'Failed to create or update user');
//         // }

//         // if (!user.role) {
//         //     return sendSuccessResponse(res, true,{ user }, 'Login Success please update role');
//         // }
//         if(user){
//             const token = jwt.sign(
//                 { _id: user._id, name: user.name, email: user.email },
//                 process.env.JWT_SECRET,
//                 {
//                     expiresIn: '30d',
//                     issuer: 'doodhdiary'
//                 }
//             );
//             return sendSuccessResponse(res, true,{ user,token }, 'Login Success');
//         }




//     } catch (error) {
//         console.log('error', error);
//         next(error)
//     }
// }
const updateRole = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            _id: Joi.string().required(),
            role: Joi.string().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { _id, role } = req.body;
        let user = await User.findById({ _id });
        console.log('useruser', user);
        if (user) {
            user.role = role;
            user.authTokenIssuedAt = utcDateTime().valueOf()
            await user.save();
            let token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '30d',
                issuer: 'doodhdiary'
            })
            return sendSuccessResponse({res, data: { user, token }, message: 'Login Success'});

        }
        else {
            return sendNotFoundResponse({res, message: 'Data not found'});
        }


    } catch (error) {

    }
}
const profile = async (req: any, res: Response, next: NextFunction) => {
    try {

        const { _id } = req.user;
        let user = await User.findById({ _id });
        return res.json({ user });


    } catch (error) {

    }
}


const updateProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            countryCode: Joi.string().allow('', null).required(),
            phoneNumber: Joi.string().allow('', null).required(),
            milkRate: Joi.number().required(),

            email: Joi.string().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        const { _id } = req.user;
        const checkPhone = await checkPhoneAlreadyExists(_id, value.countryCode, value.phoneNumber);

        if (checkPhone) {
            return sendSuccessResponse({res, statustext: false, message: 'Phone number already exists for another user'});
        }
        let user = await User.findById({ _id });
        if (user) {
            user.name = value.name
            user.email = value.email
            user.countryCode = value.countryCode
            user.phoneNumber = value.phoneNumber
            user.milkRate = value.milkRate
            await user.save();

            return sendSuccessResponse({res, data: { user }, message: 'Profile Updated'});

        }
        else {
            return sendNotFoundResponse({res, message: 'Data not found'});
        }




    } catch (error) {
        next(error)

    }



}
async function checkPhoneAlreadyExists(userID: string, countryCode: string, phoneNumber: string): Promise<any> {
    try {
        const user = await User.findOne({
            _id: { $ne: userID },
            countryCode: countryCode,
            phoneNumber: phoneNumber
        }).lean();

        return user !== null;
    } catch (error) {
        console.error('Error checking phone number existence:', error);
        throw new Error('Failed to check phone number existence');
    }
}
export { login, updateRole, profile, updateProfile }