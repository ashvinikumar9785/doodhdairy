import { Router } from "express";
import { login, profile, updateRole,updateProfile, appleLogin } from "../app/controllers/app/userController";
import { addClient,getClient, getClientProfile,clientDelete, editClient } from "../app/controllers/app/clientController";
import { getDataForMonth, saveMilkData,getDateData, getDateList, deleteEntry, getMonthEntries, depositAmount, getRemainingAmount, getMonthDeposit, editDeposite, deleteDeposit } from "../app/controllers/app/milkDataController";
import { verifyToken } from "../app/utils/authentication";
const appRouter = Router()


appRouter.post('/apple-login', appleLogin);
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
appRouter.post('/get-date-list', verifyToken, getDateList);
appRouter.post('/get-month-entries', verifyToken, getMonthEntries);
appRouter.delete('/date-entry/:id',verifyToken, deleteEntry);
appRouter.post('/deposit-amount', verifyToken, depositAmount);
appRouter.post('/get-month-deposit', verifyToken, getMonthDeposit);
appRouter.put('/edit-deposit-amount', verifyToken, editDeposite);
appRouter.delete('/delete-deposit-entry/:id', deleteDeposit);

appRouter.post('/remaining-amount', verifyToken, getRemainingAmount);



export default appRouter