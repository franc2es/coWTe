import { createListing } from './listnew.js';  // 这是关键的导入！

app.post('/schedule-listing', async (req, res) => {
    const { tokenAddress, tokenId, price } = req.body;

    // 延时 24 小时后调用 listnew.js 中的 createListing()
    setTimeout(() => {
        createListing(tokenAddress, tokenId, price).catch(console.error);
    }, 24 * 60 * 60 * 1000);  // 24小时

    res.json({ status: 'scheduled', scheduledAt: new Date(Date.now() + 86400000) });
});