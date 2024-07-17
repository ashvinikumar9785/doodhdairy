import { object, string } from "joi";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    quantity: {
        type: String,
        default:null
    },
    quantityLable: {
        type: String,
        default:'Ltr'
    },
    date:{
        type:Date,
        default:null
    }
  
    
})

export default mongoose.model('CalendarData', schema)