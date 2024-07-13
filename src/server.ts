import app from "./app";
import { config } from "./config/config";
import connectDB from "./config/db";
const PORT = config.port || 4002


const startServer = async () => {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
    })
}

startServer()