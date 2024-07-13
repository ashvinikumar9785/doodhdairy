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
    role: {
        type: String,
        enum: ['CUSTOMER', 'VENDOR'],
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
    }
})

export default mongoose.model('User', schema)