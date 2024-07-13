import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "./config/config";
import appRouter from "./routes/appRouter";

const app = express()
app.use(express.json())

app.use('/api/app', appRouter)


app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env == 'production' ? null : err.stack
    })
})

export default app;