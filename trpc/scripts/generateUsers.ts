import { faker } from "@faker-js/faker"
import { redisClient } from "../src/modules/shared/redis/client"

type User = {
	phoneNumber: number
	username: string
	name: string
}

let users: User[] = []

const NUMBER_OF_USERS = 50

const main = async () => {
	for (let index = 0; index < NUMBER_OF_USERS; index++) {
		const user: User = {
			phoneNumber: Number(faker.phone.number("1##########")),
			username: faker.internet.userName(),
			name: `${faker.name.firstName()} ${faker.name.lastName()}`,
		}

		users.push(user)

		console.info(`Creating user ${index}: ${JSON.stringify(user, null, 4)}`)
		await redisClient.profile.create(user)
		console.info(`Finished creating user ${index}`)
	}

	process.exit(0)
}

main()
