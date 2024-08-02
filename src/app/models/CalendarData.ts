import mongoose from "mongoose";
import moment from "moment";

const schema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null
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
        default: null
    },
    quantityLabel: {
        type: String,
        default: 'Ltr'
    },
    milkRate: {
        type: Number,
    },
    date: {
        type: String,
        default: null
    },
    milkBrand: {
        type: String,
        default: null,
    },
});

// Pre-save middleware to format the date
schema.pre('save', function (next) {
    if (this.date) {
        this.date = moment(this.date, moment.ISO_8601).format('YYYY-MM-DD');
    }
    next();
});

export default mongoose.model('CalendarData', schema);
