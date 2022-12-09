import { Kysely, CamelCasePlugin, type Generated } from "kysely"
import { PlanetScaleDialect } from "kysely-planetscale"
import { Config } from "@serverless-stack/node/config"

interface UserTable {
	phoneNumber: number
	username: string
	name: string
	photo: string | null
	joinedOn: Generated<Date>
}

interface Database {
	user: UserTable
}

declare global {
	var db: Kysely<Database> | undefined
}

const db =
	global.db ||
	new Kysely<Database>({
		dialect: new PlanetScaleDialect({
			url: Config.PLANETSCALE_URL,
		}),
		plugins: [new CamelCasePlugin()],
	})

export default db

if (process.env.IS_LOCAL) {
	global.db = db
}
