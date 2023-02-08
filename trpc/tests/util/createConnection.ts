import db from "../../src/lib/db"

export const createConnection = async ({
	userPhoneNumber,
	otherUserPhoneNumber,
}: {
	userPhoneNumber: number
	otherUserPhoneNumber: number
}) => {
	await Promise.all([
		db
			.insertInto("connection")
			.values({ userPhoneNumber, otherUserPhoneNumber })
			.onDuplicateKeyUpdate({ description: null })
			.execute(),
		db
			.insertInto("connection")
			.values({
				userPhoneNumber: otherUserPhoneNumber,
				otherUserPhoneNumber: userPhoneNumber,
			})
			.onDuplicateKeyUpdate({ description: null })
			.execute(),
	])
}
