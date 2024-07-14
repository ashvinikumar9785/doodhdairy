import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        set: (value: string) => {
            return value.toLowerCase();
        }
    },
    profilePicture: {
        type: String,
    },

    countryCode: {
        type: String,
        default:null
    },
    phoneNumber: {
        type: String,
        default:null
    },
    role: {
        type: String,
        enum: ['USER', 'SELLER'],
        default: null,
    },
    googleId: {
        type: String,
    },
    appleId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: "ACTIVE",
    },
    authTokenIssuedAt:{
        type:Number,
        default:null
    }
})

export default mongoose.model('User', schema)