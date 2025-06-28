// src/api/rest.js
import express from 'express';
import Offer from '../models/Offer.js';
import { offerQueue } from '../queue.js';
const router = express.Router();

router.post('/offer', async (req, res) => {
  const { tokenAddress, tokenId, offerAmount } = req.body;

  const offer = await Offer.create({ tokenAddress, tokenId, offerAmount });
  await offerQueue.add('create-offer', {
    tokenAddress,
    tokenId,
    offerAmount,
    offerId: offer._id.toString()
  }, { delay: 24 * 60 * 60 * 1000 }); // 延迟24小时

  res.json({ success: true, offerId: offer._id });
});

export default router;
