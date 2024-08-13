import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Joi from "joi";
import Admin from "../../models/Admin";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(45).required(),
        });
        const { value, error } = schema.validate(req.body);

        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        let admin = await Admin.findOne({ email: value.email, status: 'ACTIVE' })
        if (!admin) {
            throw createHttpError.Unauthorized('Invalid credential.')
        }
        let match = await bcrypt.compare(req.body.password, admin.password)

        if (!match) {
            throw createHttpError.Unauthorized('Invalid credential.')
        }
        let user = { _id: admin._id, name: admin.name, email: admin.email }
        const token = jwt.sign(
            user,
            process.env.JWT_SECRET,
            {
                expiresIn: '30d',
                issuer: 'doodhdiary'
            }
        );
        return res.json({ data: { user, token }, message: 'Login Successful.' })
    } catch (error) {
        next(error)
    }
}

const updateProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        let admin = await Admin.findById(req.user._id, 'name email');
        if (!admin) {
            throw createHttpError.NotFound('User not found.')
        }
        admin.name = value.name
        admin.email = value.email
        await admin.save()
        return res.json({ message: 'Profile updated Successful.', data: admin })
    } catch (error) {
        next(error)
    }
}

const chnagePassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(8).max(45).required(),
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            throw createHttpError.UnprocessableEntity(error.message)
        }
        let admin = await Admin.findById(req.user._id, 'password');
        if (!admin) {
            throw createHttpError.NotFound('User not found.')
        }
        let match = await bcrypt.compare(value.currentPassword, admin.password)
        if (!match) {
            throw createHttpError.Unauthorized('Current password does not match.')
        }
        const salt = bcrypt.genSaltSync(10);
        let newHashedPassword = bcrypt.hashSync(value.newPassword, salt)
        admin.password = newHashedPassword
        await admin.save()
        return res.json({ message: 'Password changed Successfully.' })
    } catch (error) {
        next(error)
    }
}

export {
    login, updateProfile, chnagePassword
}