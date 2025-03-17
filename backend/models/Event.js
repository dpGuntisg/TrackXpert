import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: {type:String, required:true},
    description: {type:String, required:true},
    date:{
        startDate: {type: Date, required: true},
        endDate: {type: Date, required: true},
    },
    tracks: [{type: mongoose.Schema.Types.ObjectId, ref: "Track"}],
    capacity: {type: Number, required: true},
    participants:[{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        registrationDate: { type: Date, default: Date.now }
    }],
    status: {type: String, enum: ['soon', 'active', 'completed'],
            default: "soon"
    },
    registrationDeadline: {type: Date,},
    images: [{type: mongoose.Schema.Types.ObjectId, ref:"images"}],


},{timestamps:true});