import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "./config/config";
import cors from "cors";
import appRouter from "./routes/appRouter";
import adminRouter from "./routes/adminRouter";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
const fs = require('node:fs')
import path from "node:path";
import cookieParser from 'cookie-parser';
const app = express()
app.use(helmet());
app.use(cookieParser())
app.use(compression({ level: 6 }));
app.use(
    cors({
        credentials: true,
        origin:
            process.env.NODE_ENV == "production"
                ? ['https://main.d2czxpu3l5syjz.amplifyapp.com']
                : [
                    "http://localhost:3000",
                ],
    }),
);
app.use(morgan(
    ':remote-addr :method :url :status - :response-time ms',
    {
        stream: process.env.NODE_ENV == 'production' ? fs.createWriteStream(path.join(__dirname, '/access.log'), { flags: 'a' }) : null
    }
));
app.use(express.json())

app.use('/api/app', appRouter)
app.use('/api/admin', adminRouter)

app.use(function (req: Request, res: Response, next: NextFunction) {
    return res.status(404).json({
        message: 'Not Found.',
    })
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env == 'production' ? null : err.stack
    })
})

export default app;