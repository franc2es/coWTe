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
bash
复制
编辑
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
env
复制
编辑
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017/nft-offers
SEPOLIA_RPC_URL=https://rpc.sepolia.org
WALLET_PRIVATE_KEY=0xabc123...
OPENSEA_API_KEY=your-opensea-api-key
EAS_CONTRACT_ADDRESS=0x...
EAS_SCHEMA_UID=0x...
🔌 初始化步骤
bash
复制
编辑
# 安装依赖
npm install

# 启动 MongoDB 与 Redis

# 启动服务
node src/server.js
🚀 RESTful API 接口文档
POST /api/offer
用于创建一个报价请求（将在 24 小时后自动执行）

请求体：
json
复制
编辑
{
  "tokenAddress": "0x...",
  "tokenId": "123",
  "offerAmount": "0.003"
}
返回示例：
json
复制
编辑
{
  "success": true,
  "offerId": "666db1e0d1f..."
}
🔍 GraphQL API 查询
访问接口：GET /graphql

查询报价状态：
graphql
复制
编辑
query {
  offer(id: "666db1e0d1f...") {
    tokenId
    tokenAddress
    offerAmount
    status        # pending / success / failed
    orderHash
    error
  }
}
📌 MongoDB Offer 模型结构
ts
复制
编辑
{
  tokenId: String,
  tokenAddress: String,
  offerAmount: String,
  status: "pending" | "success" | "failed",
  orderHash?: String,
  error?: String,
  createdAt: Date,
  executedAt?: Date
}
⏱️ Bull 队列逻辑
添加任务：

ts
复制
编辑
await offerQueue.add('create-offer', {
  tokenAddress,
  tokenId,
  offerAmount,
  offerId: offer._id
}, {
  delay: 24 * 60 * 60 * 1000  // 24小时延迟
});
消费任务（offerProcessor.js）：

ts
复制
编辑
const order = await sdk.createOffer({ ... });
await updateOfferStatusToSuccess(order.orderHash);
await easAttest(order.orderHash); // 链上存证
🔗 EAS 存证逻辑（可插拔）
EAS 使用 eas.js 模块封装

使用 ethers.js 连接合约并提交 attest 数据

存证字段建议：

ts
复制
编辑
{
  schemaUID: process.env.EAS_SCHEMA_UID,
  data: {
    tokenAddress,
    tokenId,
    orderHash,
    timestamp: Date.now()
  }
}
📌 报价执行流程图
plaintext
复制
编辑
客户端提交报价请求（REST / GraphQL）
              │
              ▼
保存报价数据到 MongoDB（状态：pending）
              │
              ▼
加入 Bull 队列，延迟 24 小时执行
              │
              ▼
执行报价逻辑（调用 OpenSea SDK）
              │
              ├── 成功 → 更新状态 + 写入链上存证（EAS）
              │
              └── 失败 → 更新状态 + 保存错误信息
📦 推荐扩展方向
支持多个 NFT 市场（LooksRare、Blur）

将报价逻辑封装为 microservice

添加通知功能（Discord / Telegram）

用 JWT 或 API Key 保护 REST 接口

添加报价失败重试策略

🛠️ 团队协作建议
成员角色	负责内容
区块链开发	OpenSea SDK, EAS 链上存证
后端开发	Express + Redis + MongoDB 集成
DevOps	Redis / MongoDB / 日志部署
产品经理	报价逻辑与 UI/UX 设计确认
测试与验证	单元测试、集成测试接口

✅ 运行结果示例
bash
复制
编辑
✅ Offer queued for tokenId=123456
⏱ Offer executed after 24hr: orderHash=0xabc...
🧾 EAS attestation success for offer #123456
