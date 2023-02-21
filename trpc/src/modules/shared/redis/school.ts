import { z } from "zod"
import { redis } from "../../../lib/redis"
import { undefinedTypeGuard } from "../util/undefinedTypeGuard"

// todo - partition by city to increase scalability. at the very least make prefix search less bad, using the approach described in this article https://patshaughnessy.net/2011/11/29/two-ways-of-using-redis-to-build-a-nosql-autocomplete-search-index. also, at least make geosearch radius incrementally increasing so you can start small and use ANY
const keys = {
	usersAtSchool: ({ id }: { id: number }) => `usersatschool:${id}`,
	schoolsGeo: "schoolsgeo",
	schoolNames: "schoolnames",
	schoolIds: ({ name }: { name: string }) => `schoolids:${name}`,
	school: ({ id }: { id: number }) => `school:${id}`,
}

const schoolSchema = z.object({
	name: z.string(),
	city: z.string(),
	state: z.string(),
})

export const schoolsClient = {
	addUser: async ({ schoolId, phoneNumber }: { schoolId: number; phoneNumber: number }) => {
		await redis.sadd(keys.usersAtSchool({ id: schoolId }), phoneNumber)
	},
	removeUser: async ({ schoolId, phoneNumber }: { schoolId: number; phoneNumber: number }) => {
		await redis.srem(keys.usersAtSchool({ id: schoolId }), phoneNumber)
	},
	getUsersAtSchool: async ({ schoolId }: { schoolId: number }) => {
		return (await redis.smembers(keys.usersAtSchool({ id: schoolId }))).map(Number)
	},
	get: async ({ schoolId }: { schoolId: number }) => {
		const parsedResult = schoolSchema.safeParse(
			await redis.hgetall(keys.school({ id: schoolId }))
		)

		if (parsedResult.success) {
			return parsedResult.data
		} else {
			return parsedResult.error
		}
	},
	getNearMe: async ({
		longitude,
		latitude,
		number,
		onlyWithinRadiusMiles,
		onParseError,
	}: {
		longitude: number
		latitude: number
		number: number
		onlyWithinRadiusMiles: number
		onParseError: (error: Error) => void
	}) => {
		const ids = (
			await redis.geosearch(
				keys.schoolsGeo,
				"FROMLONLAT",
				longitude,
				latitude,
				"BYRADIUS",
				onlyWithinRadiusMiles,
				"mi",
				"ASC",
				"COUNT",
				number
				// "ANY"
			)
		).map(Number)

		return (await Promise.all(ids.map((id) => redis.hgetall(keys.school({ id })))))
			.map((result) => {
				const parsedResult = schoolSchema.safeParse(result)

				if (parsedResult.success) {
					return parsedResult.data
				} else {
					onParseError(parsedResult.error)
				}
			})
			.filter(undefinedTypeGuard) // taking advantage of ioredis autopipelining
	},
	search: async ({
		prefix,
		onParseError,
		onNotFound,
	}: {
		prefix: string
		onParseError: (error: Error) => void
		onNotFound: (cause: string) => void
	}) => {
		const prefixUppercase = prefix.toUpperCase()

		// pretty bad tbh
		const names = (
			await redis.sscan(keys.schoolNames, 0, "MATCH", `${prefixUppercase}*`, "COUNT", 200000)
		)[1] // most of the time will be on the order of 20 returned items, so no point in scaling down count
			.slice(0, 20)

		const ids = (await redis.sunion(names.map((name) => keys.schoolIds({ name }))))
			.map((id, nameIndex) =>
				id !== null
					? Number(id)
					: (onNotFound(
							`Id not found for school with name: ${names[nameIndex]}`
					  ) as undefined)
			)
			.filter(undefinedTypeGuard)

		return (
			await Promise.all(
				ids.map((id) => (typeof id === "number" ? redis.hgetall(keys.school({ id })) : id))
			)
		)
			.map((result) => {
				const parsedResult = schoolSchema.safeParse(result)

				if (parsedResult.success) {
					return parsedResult.data
				} else {
					onParseError(parsedResult.error)
				}
			})
			.filter(undefinedTypeGuard)
	},
}
