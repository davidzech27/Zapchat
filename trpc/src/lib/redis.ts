import Redis from "ioredis"
import env from "../env"

export const mainRedisClient = new Redis(env.REDIS_URL)

export const publishRedisClient = new Redis(env.REDIS_URL)

export const subscribeRedisClient = new Redis(env.REDIS_URL)
