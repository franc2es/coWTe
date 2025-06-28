import express from 'express';
import mongoose from 'mongoose';
import Offer from '../models/Offer.js';
import { offerQueue } from '../queue.js';

const router = express.Router();

router.post('/offer', async (req, res) => {
  const { tokenAddress, tokenId, offerAmount } = req.body;

  // 参数校验
  if (
    !tokenAddress || typeof tokenAddress !== 'string' ||
    !tokenId || typeof tokenId !== 'string' ||
    !offerAmount || (typeof offerAmount !== 'string' && typeof offerAmount !== 'number')
  ) {
    return res.status(400).json({ error: '参数格式错误，tokenAddress, tokenId 和 offerAmount 都是必填项' });
  }

  try {
    // 创建 Offer 记录
    const offer = await Offer.create({ tokenAddress, tokenId, offerAmount });

    // 确保 offer._id 是有效 ObjectId
    if (!mongoose.Types.ObjectId.isValid(offer._id)) {
      return res.status(500).json({ error: '生成的报价ID无效' });
    }

    // 将任务加入延迟队列，延迟24小时执行
    await offerQueue.add(
      'create-offer',
      {
        tokenAddress,
        tokenId,
        offerAmount,
        offerId: offer._id.toString(),
      },
      { delay: 24 * 60 * 60 * 1000 }
    );

    res.json({ success: true, offerId: offer._id });
  } catch (error) {
    console.error('创建报价时出错:', error);
    res.status(500).json({ error: '服务器错误，无法创建报价' });
  }
});

export default router;
