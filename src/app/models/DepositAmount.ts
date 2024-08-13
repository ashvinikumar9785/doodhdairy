import mongoose from "mongoose";
import moment from "moment";

const schema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    amount: {
        type: Number,
    },
    date: {
        type: Date,
        default: null
    },
   
});

// Pre-save middleware to format the date
// schema.pre('save', function (next) {
//     if (this.date) {
//         this.date = moment(this.date, moment.ISO_8601).format('YYYY-MM-DD');
//     }
//     next();
// });

export default mongoose.model('DepositAmount', schema);
