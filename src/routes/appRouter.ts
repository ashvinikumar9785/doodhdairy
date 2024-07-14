import { Router } from "express";
import { login, profile, updateRole,updateProfile } from "../app/controllers/app/userController";
import { verifyToken } from "../app/utils/authentication";
const appRouter = Router()


appRouter.post('/login', login);
// appRouter.post('/updateUserType', verifyToken, updateUserType);
appRouter.post('/update-role', updateRole);
appRouter.get('/profile', verifyToken, profile);
appRouter.post('/profile', verifyToken, updateProfile);


export default appRouter