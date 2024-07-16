import { object, string } from "joi";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    countryCode: {
        type: String,
        default:null
    },
    phoneNumber: {
        type: String,
        default:null
    },
  
    milkRate:{
        type:String
    },
    milkBrand:{
        type:String
    },
})

export default mongoose.model('Client', schema)