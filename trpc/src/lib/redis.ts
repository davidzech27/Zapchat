import Redis from "ioredis"
import { Config } from "@serverless-stack/node/config"

declare global {
	var redis: Redis | undefined
}

const redis = global.redis || new Redis(Config.REDIS_URL)

export default redis

if (process.env.IS_OFFLINE) {
	global.redis = redis
}
