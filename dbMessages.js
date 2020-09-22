import mongoose from 'mongoose';

const whastappSchema = mongoose.Schema({
    message:String,
    name:String,
    timestamp:String,
    received:Boolean,
});

export default mongoose.model('messages',whastappSchema) ;