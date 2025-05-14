import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['User', 'Track', 'Event'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now, expires: '7d' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  });
  
export default mongoose.model('Report', reportSchema);