// src/queue.js
import Queue from 'bull';
import dotenv from 'dotenv';
dotenv.config();

export const offerQueue = new Queue('offer-queue', {
  redis: { url: process.env.REDIS_URL },
});
