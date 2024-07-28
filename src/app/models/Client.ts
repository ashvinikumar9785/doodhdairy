import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

interface IClient extends Document {
    name: string;
    userId: mongoose.Schema.Types.ObjectId;
    countryCode: string;
    phoneNumber: string;
    milkRate?: string;
    milkBrand?: string;
}

const clientSchema = new Schema<IClient>({
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
        default: null,
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    milkRate: {
        type: Number,
        default: 0,

    },
    milkBrand: {
        type: String,
        default: null,
    },
});

clientSchema.plugin(mongoosePaginate);

interface IClientModel extends mongoose.PaginateModel<IClient> {}

const Client = mongoose.model<IClient, IClientModel>('Client', clientSchema);

export default Client;
