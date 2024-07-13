import mongoose, { MongooseError } from "mongoose";
import { config } from "./config";


const connectDB = async () => {
    try {
        console.log("config.dbConnectionStringconfig.dbConnectionString" ,typeof config.dbConnectionString,config.dbConnectionString,process.env.DATABASE_CONNECTION_STRING)
        mongoose.connection.on('connected', () => {
            console.log("Connected to db successfully.");
        })
        mongoose.connection.on("error", (err: MongooseError) => {
            console.error("Error in connecting to db", err)
        })
        await mongoose.connect('mongodb+srv://itsajay:sWGw6CkXuvaKu6Hg@doodhdairy.6iekqmh.mongodb.net/doodhdiary?retryWrites=true&w=majority&appName=doodhdairy' as string)
    } catch (error) {
        console.error(`Failed to connect to db`, error);
        process.exit(1)
    }
}

export default connectDB