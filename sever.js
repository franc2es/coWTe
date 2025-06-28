import express from 'express';
import mongoose from 'mongoose';
import { offerQueue } from './queue.js';
import { processOffer } from './jobs/offerProcessor.js';
import restRoutes from './api/rest.js';
import graphql from './api/graphql.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', restRoutes);
app.use('/graphql', graphql);

// Bull 监听处理器
offerQueue.process('create-offer', processOffer);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(3000, () => console.log("🚀 Server on http://localhost:3000"));
});
