import { object, string } from "joi";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default:null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    quantity: {
        type: String,
        default:null
    },
    quantityLabel: {
        type: String,
        default:'Ltr'
    },

    milkRate: {
        type: Number,
    },
    date:{
        type:Date,
        default:null
    },
    milkBrand: {
        type: String,
        default: null,
    },
  
    
})

export default mongoose.model('CalendarData', schema)