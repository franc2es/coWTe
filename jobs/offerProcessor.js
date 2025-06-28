// src/jobs/offerProcessor.js
import { sdk, WALLET_ADDRESS } from '../utils/constants.js';
import Offer from '../models/Offer.js';
import { easWriteAttestation } from '../utils/eas.js';

export const processOffer = async (job) => {
  const { tokenAddress, tokenId, offerAmount, offerId } = job.data;

  try {
    const response = await sdk.createOffer({
      accountAddress: WALLET_ADDRESS,
      startAmount: offerAmount,
      asset: { tokenAddress, tokenId },
    });

    // 存储成功状态
    await Offer.findByIdAndUpdate(offerId, {
      status: 'success',
      orderHash: response.orderHash,
    });

    // 发起 EAS Attestation
    await easWriteAttestation({ tokenAddress, tokenId, orderHash: response.orderHash });

  } catch (error) {
    console.error("❌ Offer creation failed:", error);
    await Offer.findByIdAndUpdate(offerId, { status: 'failed', error: error.message });
  }
};
