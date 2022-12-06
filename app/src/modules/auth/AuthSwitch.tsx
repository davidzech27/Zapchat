import type { FC, ReactNode } from "react"
import useAuthStore, { authedSelector } from "./useAuthStore"

interface Props {
	authed: ReactNode
	unauthed: ReactNode
}

const AuthSwitch: FC<Props> = ({ authed, unauthed }) => {
	const signedIn = useAuthStore(authedSelector)

	return <>{signedIn ? authed : unauthed}</>
}

export default AuthSwitch
