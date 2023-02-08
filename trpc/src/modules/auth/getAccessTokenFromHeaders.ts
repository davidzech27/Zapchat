import type { FastifyRequest } from "fastify"

const getAccessTokenFromHeaders = ({ headers }: { headers: FastifyRequest["headers"] }) => {
	const authHeader = headers.authorization

	if (authHeader) {
		return authHeader.replace("Bearer ", "")
	}
}

export default getAccessTokenFromHeaders
