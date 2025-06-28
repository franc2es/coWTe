// src/models/Offer.js
import mongoose from 'mongoose';
const offerSchema = new mongoose.Schema({
  tokenAddress: String,
  tokenId: String,
  offerAmount: String,
  status: { type: String, default: 'pending' },
  orderHash: String,
  error: String,
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
