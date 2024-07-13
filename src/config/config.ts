import { config as conf } from "dotenv"
conf()
const _config = {
    port: process.env.PORT,
    dbConnectionString: process.env.DATABASE_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    GOOGLE_OAUTH_CLIENTID: process.env.GOOGLE_OAUTH_CLIENTID,
}

export const config = Object.freeze(_config)