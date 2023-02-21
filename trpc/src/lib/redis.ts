import Redis from "ioredis"
import env from "../env"

export const redis = new Redis(env.REDIS_URL, {
	enableAutoPipelining: true,
	maxRetriesPerRequest: 1,
})

redis
	.on("connect", () => {
		console.debug("Redis connect")
	})
	.on("ready", () => {
		console.debug("Redis ready")
	})
	.on("error", (e) => {
		console.debug("Redis ready", e)
	})
	.on("close", () => {
		console.debug("Redis close")
	})
	.on("reconnecting", () => {
		console.debug("Redis reconnecting")
	})
	.on("end", () => {
		console.debug("Redis end")
	})
