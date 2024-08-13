import { NextFunction, Request, Response } from "express";
import User from "../../models/User";
import createHttpError from "http-errors";
const index = async (req: any, res: Response, next: NextFunction) => {
    try {
        const options = {
            page: parseInt(req.query.pagination?.current) || 1,
            limit: parseInt(req.query.pagination?.pageSize) || 25,
            select: '-password',
            sort: req.query?.sorter?.field ? [[req.query?.sorter?.field, req.query?.sorter?.order === 'ascend' ? 'asc' : 'desc']] : [['createdAt', 'desc']],
        }
        var query: any = {};
        if (req.query.filters?.status) {
            query.status = req.query.filters?.status
        }
        if (req.query.filters?.role) {
            query.role = req.query.filters?.role
        }
        if (req.query.filters?.search?.trim()) {
            let search = req.query.filters?.search?.trim()
            query = {
                ...query,
                $or: [
                    { name: new RegExp(search, "i") },
                    { email: new RegExp(search, "i") },
                ]
            }
        }
        const users = await User.paginate(query, options);
        return res.json({ data: users })
    } catch (error) {
        next(error)
    }
}

const status = async (req: any, res: Response, next: NextFunction) => {
    try {
        let user = await User.findById(req.params._id);
        if (!user) {
            throw createHttpError.NotFound("User not found.")
        }
        if (user.status == 'ACTIVE') {
            user.status = 'INACTIVE'
        } else {
            user.status = 'ACTIVE'
        }
        await user.save()
        return res.json({ message: 'Status updated successfully.' })
    } catch (error) {
        next(error)
    }
}

export { index, status }