import { Router } from "express";
import { login, profile, updateRole,updateProfile } from "../app/controllers/app/userController";
import { addClient,getClient, getClientProfile,clientDelete, editClient } from "../app/controllers/app/clientController";
import { getDataForMonth, saveMilkData,getDateData } from "../app/controllers/app/milkDataController";
import { verifyToken } from "../app/utils/authentication";
const appRouter = Router()


appRouter.post('/login', login);
appRouter.post('/update-role', updateRole);
appRouter.get('/profile', verifyToken, profile);
appRouter.post('/profile', verifyToken, updateProfile);
appRouter.post('/client', verifyToken, addClient);

appRouter.get('/client', verifyToken, getClient);
appRouter.get('/client-profile', getClientProfile);
appRouter.delete('/client/:id', clientDelete);
appRouter.put('/client', verifyToken, editClient);

appRouter.post('/save-milk-data', verifyToken, saveMilkData );
appRouter.post('/get-month-milk-history', verifyToken, getDataForMonth);
appRouter.get('/get-date-milk', verifyToken, getDateData);


export default appRouter