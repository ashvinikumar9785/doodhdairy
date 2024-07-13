import { Router } from "express";
import { login } from "../app/controllers/app/userController";
const appRouter = Router()


appRouter.post('/login', login)

export default appRouter