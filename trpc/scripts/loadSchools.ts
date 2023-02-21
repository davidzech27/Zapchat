import csv from "csv-parse"
import fs from "fs"
import { z } from "zod"
import { redis } from "../src/lib/redis"

const NUMBER_OF_SCHOOLS = 107299

const EXEC_EVERY = 5000

const schoolSchema = z.array(z.string()).transform((schoolArray) => {
	return {
		name: schoolArray[4],
		id: Number(schoolArray[2]),
		latitute: Number(schoolArray[17]),
		longitude: Number(schoolArray[18]),
		elementary: Number(schoolArray[29]) <= 6,
		city: schoolArray[6],
		state: schoolArray[7],
	}
})

const main = async () => {
	const pathToCSV = process.env.PATH_TO_CSV

	if (pathToCSV === undefined) {
		console.error("Must set valid PATH_TO_CSV environment variable")

		process.exit(1)
	}

	const schoolCSV = fs.readFileSync(pathToCSV)

	const csvParser = csv.parse(schoolCSV)

	let pipeline = redis.pipeline()

	const errors: Error[] = []

	let commandsSent = 0

	for await (const schoolRaw of csvParser) {
		const schoolResult = schoolSchema.safeParse(schoolRaw)

		if (schoolResult.success) {
			const { data: school } = schoolResult

			if (school.name === "NAME") continue

			if (school.id > NUMBER_OF_SCHOOLS) {
				process.exit(0)
			}

			if (!school.elementary) {
				console.info(`Loading school: ${JSON.stringify(school, null, 4)}`)

				pipeline.geoadd("schoolsgeo", school.longitude, school.latitute, school.id)
				pipeline.hmset(`school:${school.id}`, {
					name: school.name,
					city: school.city,
					state: school.state,
				})
				pipeline.sadd("schoolnames", school.name)
				pipeline.sadd(`schoolids:${school.name}`, school.id)
			}

			if (school.id % EXEC_EVERY === 0 || school.id === NUMBER_OF_SCHOOLS) {
				console.info(`Sending commands`)
				const results = await pipeline.exec()
				console.info(`Finished sending commands`)

				commandsSent += results!.length

				results!.forEach(([error]) => {
					if (error !== null) {
						errors.push(error)
						console.error(`Redis error: ${error}`)
					}
				})

				pipeline = redis.pipeline()
			}
		} else {
			console.error(`Invalid school: ${schoolResult.error}`)
		}
	}

	console.info(`Commands sent: ${commandsSent}`)
	console.info(`All redis errors: ${JSON.stringify(errors, null, 4)}`)

	process.exit(0)
}

main()
