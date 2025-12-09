import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  enableReadyCheck: false, 
  maxRetriesPerRequest: null, 
  connectTimeout: 5000, 
  
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000); 
    return delay;
  },
});

redis.on("connect", () => {
  console.log("Connected to Upstash Redis successfully!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
