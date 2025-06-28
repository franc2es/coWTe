# NFT Delayed Offer System — Technical Documentation

## Overview

This system implements a delayed NFT offer creation process using Bull queue, Redis, MongoDB, RESTful and GraphQL APIs, integrated with Ethereum Attestation Service (EAS) for on-chain proof.

---

## Architecture Components

- **Bull Queue & Redis:** Manage delayed job scheduling and execution without polling.
- **MongoDB:** Store offer data and track offer status (`pending`, `success`, `failed`).
- **RESTful API:** Endpoint to submit offer requests and query offer status.
- **GraphQL API:** Flexible querying of offers and their details.
- **OpenSea SDK & ethers.js:** Create NFT offers on the blockchain.
- **Ethereum Attestation Service (EAS):** Record attestations of successful offers on-chain for verifiable proof.

---

## Workflow

1. **Offer Submission:**  
   Client submits offer data (`tokenAddress`, `tokenId`, `offerAmount`) via REST or GraphQL API.

2. **Offer Persistence:**  
   Offer is saved in MongoDB with status set to `pending`.

3. **Job Scheduling:**  
   A Bull job is queued with a delay of 24 hours to process the offer.

4. **Delayed Execution:**  
   After 24 hours, Bull worker picks up the job and calls OpenSea SDK to create the offer on-chain.

5. **Result Handling:**  
   - On success: update MongoDB status to `success`, store `orderHash`, and create an EAS attestation.
   - On failure: update status to `failed`, store error details.

6. **Status Querying:**  
   Users query offer status via REST or GraphQL API anytime.

---

## Data Model (MongoDB Offer Document)

| Field        | Type   | Description                         |
|--------------|--------|-----------------------------------|
| tokenAddress | String | NFT contract address               |
| tokenId      | String | NFT token ID                      |
| offerAmount  | String | Offered amount in ETH             |
| status       | String | Offer state: `pending`/`success`/`failed` |
| orderHash    | String | Blockchain order hash (if successful) |
| error       | String  | Error message (if failed)          |

---

## Job Scheduling (Bull Queue)

```js
offerQueue.add('create-offer', {
  tokenAddress,
  tokenId,
  offerAmount,
  offerId: offer._id.toString()
}, {
  delay: 24 * 60 * 60 * 1000  // 24 hours delay
});












🎯 NFT 延迟报价系统技术文档
提交报价 → 24 小时后自动上链 → EAS 存证 → MongoDB 状态管理 → GraphQL 查询支持

🧾 概览
本系统支持用户对 NFT 资产进行延迟报价（24 小时后自动提交），并提供：

✅ RESTful + GraphQL API 接口

✅ Bull + Redis 实现精准定时

✅ MongoDB 实时存储状态与追踪

✅ Ethereum Attestation Service（EAS）链上存证

✅ OpenSea SDK 集成报价功能

🧱 技术栈
模块	技术
Web 框架	Express.js
定时任务	Bull + Redis
数据库	MongoDB + Mongoose
区块链交互	OpenSea SDK + ethers.js
链上存证	Ethereum Attestation Service
API 支持	RESTful + GraphQL
环境管理	dotenv

📁 目录结构
src/
├── api/
│   ├── rest.js             # REST API 路由
│   └── graphql.js          # GraphQL schema 和 resolver
├── jobs/
│   └── offerProcessor.js   # Bull 队列消费逻辑
├── models/
│   └── Offer.js            # MongoDB 模型定义
├── utils/
│   ├── constants.js        # OpenSea SDK、钱包实例等
│   └── eas.js              # EAS 链上存证逻辑
├── queue.js                # Bull 队列初始化
└── server.js               # 主入口，挂载 API 和启动服务
⚙️ 环境变量配置 .env
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017/nft-offers
SEPOLIA_RPC_URL=https://rpc.sepolia.org
WALLET_PRIVATE_KEY=0xabc123...
OPENSEA_API_KEY=your-opensea-api-key
EAS_CONTRACT_ADDRESS=0x...
EAS_SCHEMA_UID=0x...
