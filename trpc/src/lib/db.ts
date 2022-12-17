import { Kysely, CamelCasePlugin, type Generated } from "kysely"
import { PlanetScaleDialect } from "kysely-planetscale"
import env from "../env"

interface UserTable {
	phoneNumber: number
	username: string
	name: string
	photo: string | null
	joinedOn: Generated<Date>
}

interface ConversationTable {
	id: Generated<number>
	chooserPhoneNumber: number
	chooseePhoneNumber: number
}

interface MessageTable {
	conversationId: number
	fromPhoneNumber: number
	content: string
	sentAt: Date
}

interface ConnectionTable {
	userPhoneNumber: number
	otherUserPhoneNumber: number
	description: string | null
}

interface ConnectionRequestTable {
	requesterPhoneNumber: number
	requesteePhoneNumber: number
	sentAt: Generated<Date>
}

interface Database {
	user: UserTable
	conversation: ConversationTable
	message: MessageTable
	connection: ConnectionTable
	connectionRequest: ConnectionRequestTable
}

const db = new Kysely<Database>({
	dialect: new PlanetScaleDialect({
		url: env.PLANETSCALE_URL,
	}),
	plugins: [new CamelCasePlugin()],
	log: (event) => {
		if (event.level === "query") {
			console.info(
				`SQL: ${event.query.sql}, Duration: ${
					Math.floor(event.queryDurationMillis * 100) / 100
				}ms`
			)
		}
	},
})

export default db
