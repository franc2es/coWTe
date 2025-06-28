// server.js
import express from 'express';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { sdk, WALLET_ADDRESS } from './dist/utils/constants.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // 允许前端访问

const PORT = process.env.PORT || 3001;

const approveNFT = async (tokenAddress, tokenId) => {
    const nftContract = new ethers.Contract(tokenAddress, [
        "function setApprovalForAll(address operator, bool approved) external"
    ], sdk._signerOrProvider);
    const tx = await nftContract.setApprovalForAll("0x00000000006c3852cbEf3e08E8dF289169EdE581", true);
    await tx.wait();
};

const createListing = async (tokenAddress, tokenId, listingAmount) => {
    await approveNFT(tokenAddress, tokenId);
    const listing = {
        accountAddress: WALLET_ADDRESS,
        quantity: 1,
        startAmount: listingAmount,
        asset: {
            tokenAddress,
            tokenId,
        },
    };
    const response = await sdk.createListing(listing);
    console.log("Listing created with hash:", response.orderHash);
};

app.post('/schedule-listing', async (req, res) => {
    const { tokenAddress, tokenId, listingAmount } = req.body;

    // 设置 24 小时后上架（不保存、无轮询，服务持续运行前提）
    const delayMs = 24 * 60 * 60 * 1000;
    console.log(`已接收请求，将在 ${new Date(Date.now() + delayMs).toLocaleString()} 上架 NFT`);

    setTimeout(() => {
        createListing(tokenAddress, tokenId, listingAmount).catch(console.error);
    }, delayMs);

    res.json({ message: "上架已安排，24 小时后将自动执行。" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
