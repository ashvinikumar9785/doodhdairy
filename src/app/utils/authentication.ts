const jwt = require("jsonwebtoken");
import User from "../models/User";
import { sendUnauthorizedResponse } from "./respons";
const jet_secret = process.env.JWT_SECRET;

const verifyToken = (req: any, res: any, next: any) => {
    jwt.verify(req.headers["authorization"], jet_secret, async (err: any, decoded: { _id: any; iat: any; }) => {
        if (err || !decoded || !decoded._id) {
            return sendUnauthorizedResponse({ res });


        }
        const user: any = await User.findOne({
            _id: decoded._id,
            authTokenIssuedAt: decoded.iat * 1000, //enable when single login needed
        });

        if (!user) {
            return sendUnauthorizedResponse({ res });


        }
        const loginDate = new Date(user.authTokenIssuedAt).getTime();
        const currentDate = new Date().getTime();
        const interval = Math.floor((currentDate - loginDate) / (24 * 3600 * 1000)); // 1 day
        if (interval >= 1) {
            return sendUnauthorizedResponse({ res, message: 'SESSION_EXPIRE' });


        }
        req.user = user; //add user obj to request
        next();
    });
};

export { verifyToken };