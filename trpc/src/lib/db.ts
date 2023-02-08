import { createPool } from "mysql2"
import { Kysely, CamelCasePlugin, MysqlDialect, type Generated } from "kysely"
import env from "../env"

interface UserTable {
	phoneNumber: number
	username: string
	name: string
	joinedOn: Date
	birthday: Date
	lastPickedAt: Date | null
}

interface ConversationTable {
	id: Generated<number>
	chooserPhoneNumber: number
	chooseePhoneNumber: number
	createdOn: Date
	chooseeLastPresence: Date | null
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
	sentAt: Date
}

interface Database {
	user: UserTable
	conversation: ConversationTable
	message: MessageTable
	connection: ConnectionTable
	connectionRequest: ConnectionRequestTable
}

const db = new Kysely<Database>({
	dialect: new MysqlDialect({
		pool: createPool({
			uri: env.PLANETSCALE_URL,
			waitForConnections: true,
		}),
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
