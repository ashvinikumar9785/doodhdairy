import { Router } from "express";
import { login, updateProfile, chnagePassword } from "../app/controllers/admin/authController";
import { index, status } from "../app/controllers/admin/userController";
const adminAuthMiddleware = require('../app/utils/adminAuthMiddleware')
const adminRouter = Router()

adminRouter.post('/login', login)

// Protected routes
adminRouter.post('/profile/update-profile', adminAuthMiddleware, updateProfile)
adminRouter.post('/profile/change-password', adminAuthMiddleware, chnagePassword)
adminRouter.get('/users/index', adminAuthMiddleware, index)
adminRouter.get('/users/status/:_id', adminAuthMiddleware, status)


export default adminRouter