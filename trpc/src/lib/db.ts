import scylla from "cassandra-driver"
import humps from "humps"
import env from "../env"

const client = new scylla.Client({
	contactPoints: [env.SCYLLA_URL],
	keyspace: env.SCYLLA_KEYSPACE,
	queryOptions: { prepare: true, isIdempotent: true },
	requestTracker: new scylla.tracker.RequestLogger({
		logNormalRequests: env.DEV,
		logErroredRequests: true,
	}),
	encoding: { useBigIntAsLong: true },
	credentials: { username: env.SCYLLA_USERNAME, password: env.SCYLLA_PASSWORD },
	localDataCenter: env.SCYLLA_LOCAL_DATACENTER,
})

client.on("log", (level, loggerName, message, furtherInfo) => {
	const logString = `${loggerName}: ${message}${furtherInfo ? ` -  ${furtherInfo}` : ""}`

	if (level === "info") {
		console.info(logString)
	} else if (level === "warning") {
		console.warn(logString)
	} else if (level === "error") {
		console.error(logString)
	}
})

export const db = {
	execute: async <TRow>(
		query: string,
		params?: scylla.ArrayOrObject,
		options?: scylla.QueryOptions
	) => {
		return humps.camelizeKeys((await client.execute(query, params, options)).rows) as TRow[]
	},
	batch: async <TRow>(
		queries: Parameters<typeof client.batch>[0],
		options: scylla.QueryOptions
	) => {
		return humps.camelizeKeys((await client.batch(queries, options)).rows) as TRow[]
	},
}
