import type { FastifyRequest } from "fastify"

const getAccessTokenFromRequest = ({ req }: { req: FastifyRequest }) => {
	const authHeader = req.headers.authorization

	if (authHeader) {
		return authHeader.replace("Bearer ", "")
	}
}

export default getAccessTokenFromRequest
