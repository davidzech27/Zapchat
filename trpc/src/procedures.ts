import { t } from "./initTRPC"
import { isAuthed } from "./modules/auth/middleware"

export const publicProcedure = t.procedure

export const authedProcedure = t.procedure.use(isAuthed)
