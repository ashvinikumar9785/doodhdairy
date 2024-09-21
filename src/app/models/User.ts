import mongoose, { Document, Schema } from "mongoose";
import paginate from 'mongoose-paginate-v2';

// Interface for User Document
export interface IUser extends Document {
    name: string | null;
    email: string | null;
    profilePicture: string | null;
    countryCode: string | null;
    phoneNumber: string | null;
    role: 'USER' | 'SELLER' | null;
    googleId: string | null;
    appleId: string | null;
    milkRate: number | null;
    status: 'ACTIVE' | 'INACTIVE';
    authTokenIssuedAt: number | null;
    createdAt: Date;
    updatedAt: Date;
}

// Define the User Schema
const schema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: null,
    },
    email: {
        type: String,
        required: false,
        // unique: true,
        default:null,
        set: (value: string) => value.toLowerCase(),
    },
    profilePicture: {
        type: String,
        default: null,
    },
    countryCode: {
        type: String,
        default: null,
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['USER', 'SELLER'],
        default: null,
    },
    googleId: {
        type: String,
        default: null,
    },
    appleId: {
        type: String,
        default: null,
    },
    milkRate: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
    },
    authTokenIssuedAt: {
        type: Number,
        default: null,
    },
}, {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
});

// Apply the pagination plugin to the schema
schema.plugin(paginate);

// Create and export the User model with pagination support
const User = mongoose.model<IUser, mongoose.PaginateModel<IUser>>('User', schema);
export default User