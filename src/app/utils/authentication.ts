const jwt = require("jsonwebtoken");
import User from "../models/User";
const jet_secret = process.env.JWT_SECRET;

const verifyToken = (req: any, res: any, next: any) => {
    console.log("dgfdgfdfdgfdg",req.headers["authorization"])
    jwt.verify(req.headers["authorization"], jet_secret, async (err: any, decoded: { sub: any; iat: any; }) => {
        console.log("decodeddecoded",decoded)
        if (err || !decoded || !decoded.sub) {
            return res.status(401).json({ message: 'UNAUTHORIZEDtest' });

        }
        const user = await User.findOne({
            _id: decoded.sub,
            authTokenIssuedAt: decoded.iat, //enable when single login needed
        });

        if (!user) {
            return res.status(401).json({ message: 'UNAUTHORIZED' });

        }
        const loginDate = new Date(user.authTokenIssuedAt).getTime();
        const currentDate = new Date().getTime();
        const interval = Math.floor((currentDate - loginDate) / (24 * 3600 * 1000)); // 1 day
        if (interval >= 1) {
            return res.status(401).json({ message: 'SESSION_EXPIRE' });

        }
        req.user = user; //add user obj to request
        next();
    });
};

export { verifyToken };
