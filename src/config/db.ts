import mongoose, { MongooseError } from "mongoose";
import { config } from "./config";


const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Connected to db successfully.");
        })
        mongoose.connection.on("error", (err: MongooseError) => {
            console.error("Error in connecting to db", err)
        })
        await mongoose.connect(config.dbConnectionString as string)

    } catch (error) {
        console.error(`Failed to connect to db`, error);
        process.exit(1)
    }
}

export default connectDB