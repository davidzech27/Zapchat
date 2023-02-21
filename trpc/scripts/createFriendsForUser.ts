import { redisClient } from "../src/modules/shared/redis/client"
import { redis } from "../src/lib/redis"

const NUMBER_OF_FRIENDS = 25

const main = async () => {
	const userPhoneNumberString = process.env.USER_PHONE_NUMBER

	const userPhoneNumber = Number(userPhoneNumberString)

	if (userPhoneNumberString === undefined || Number.isNaN(userPhoneNumber)) {
		console.error("Must set valid USER_PHONE_NUMBER environment variable")

		process.exit(1)
	}

	const phoneNumbers = (await redis.mget(await redis.keys("pnum:*"))).map(Number)

	phoneNumbers.sort(() => Math.random() - 0.5)

	for (let index = 0; index < NUMBER_OF_FRIENDS; index++) {
		console.info(
			`Creating friendship ${index} between users with phone numbers ${userPhoneNumber} and ${phoneNumbers[index]}`
		)
		await redisClient.friends.createFriendship({
			phoneNumber: userPhoneNumber,
			otherPhoneNumber: phoneNumbers[index],
		})
		console.info(`Finished creating friendship ${index}`)
	}

	process.exit(0)
}

main()
