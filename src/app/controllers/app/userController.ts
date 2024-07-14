const jwt = require('jsonwebtoken');
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import createHttpError from "http-errors";
import Joi from "joi";
import { config } from "../../../config/config";
import User from "../../models/User";
import { utcDateTime } from '../../utils/dateFormats';

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
        else{
            user =  await User.findOneAndUpdate(
                { ...filter  }, 
                {authTokenIssuedAt: utcDateTime().valueOf()},     
                { new: true } 
            );
        }
        if (!user) {
            return res.status(500).json({ message: "Failed to create or update user" });
        }
    
        if (!user.role) {
            return res.json({ user });
        }
    
        const token = jwt.sign(
            { _id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: '30d',
                issuer: 'doodhdiary'
            }
        );
    
        return res.json({ user, token });
    } catch (error) {
        console.log('error', error);
        next(error)
    }
}

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
        const { _id,role } = req.body;
        let user = await User.findById({ _id });
        console.log('useruser', user);
        if (user) {
            user.role = role;
            user.authTokenIssuedAt= utcDateTime().valueOf()
            await user.save();
            let token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '30d',
                issuer: 'doodhdiary'
            })
            return res.json({ user, token });
        }
        else{
            // return res.json({ 'USER NOT FOUND' });
            return res.status(404).json({ message: 'USER NOT FOUND' });
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

export { login, updateRole,profile }