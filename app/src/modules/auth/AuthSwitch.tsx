import type { FC, ReactNode } from "react"
import useAuthStore, { authedSelector, loadedSelector } from "./useAuthStore"

interface Props {
	authed: ReactNode
	unauthed: ReactNode
}

const AuthSwitch: FC<Props> = ({ authed, unauthed }) => {
	const signedIn = useAuthStore(authedSelector)

	const loaded = useAuthStore(loadedSelector)

	if (!loaded) return null

	return <>{signedIn ? authed : unauthed}</>
}

export default AuthSwitch
