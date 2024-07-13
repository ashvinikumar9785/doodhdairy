const jwt = require("jsonwebtoken");
import User from "../models/User";
const jet_secret = process.env.JWT_SECRET;

const verifyToken = (req: any, res: any, next: any) => {
    jwt.verify(req.headers["authorization"], jet_secret, async (err: any, decoded: { sub: any; iat: any; }) => {
        if (err || !decoded || !decoded.sub) {
            return res.unauthorized(null, req.__("UNAUTHORIZED"));
        }
        const user = await User.findOne({
            _id: decoded.sub,
            authTokenIssuedAt: decoded.iat, //enable when single login needed
        });

        if (!user) {
            return res.unauthorized(null, req.__("UNAUTHORIZED"));
        }
        const loginDate = new Date(user.authTokenIssuedAt).getTime();
        const currentDate = new Date().getTime();
        const interval = Math.floor((currentDate - loginDate) / (24 * 3600 * 1000)); // 1 day
        if (interval >= 1) {
            return res.unauthorized(null, req.__("SESSION_EXPIRE"));
        }
        req.user = user; //add user obj to request
        next();
    });
};

export { verifyToken };
