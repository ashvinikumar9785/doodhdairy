import { Router } from "express";
import { login, updateUserType } from "../app/controllers/app/userController";
import { verifyToken } from "../app/utils/authentication";
const appRouter = Router()


appRouter.post('/login', login);
appRouter.post('/updateUserType', verifyToken, updateUserType);

export default appRouter