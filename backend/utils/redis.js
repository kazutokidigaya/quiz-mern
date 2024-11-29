import redis from "../config/redisclient.js";

export const setToken = async (key, value, ttl = 7200) => {
  await redis.set(key, value, "EX", ttl);
};

export const getToken = async (key) => {
  return await redis.get(key);
};

export const deleteToken = async (key) => {
  return await redis.del(key);
};
