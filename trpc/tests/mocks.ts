import type { FastifyBaseLogger } from "fastify"

export const mockLogger: FastifyBaseLogger = {
	child: () => mockLogger,
	debug: () => {},
	error: () => {},
	fatal: () => {},
	info: () => {},
	level: "",
	silent: () => {},
	trace: () => {},
	warn: () => {},
}
