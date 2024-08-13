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
    password: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: "ACTIVE",
    },

})

export default mongoose.model('Admin', schema)