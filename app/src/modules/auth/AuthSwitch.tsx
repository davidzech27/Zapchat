import type { FC } from "react"
import useAuthStore, { authedSelector, storedAuthInfoLoadedSelector } from "./useAuthStore"

interface Props {
	Authed: FC
	Unauthed: FC
}

const AuthSwitch: FC<Props> = ({ Authed, Unauthed }) => {
	const signedIn = useAuthStore(authedSelector)

	const loaded = useAuthStore(storedAuthInfoLoadedSelector)

	if (!loaded) return null

	return <>{signedIn ? <Authed /> : <Unauthed />}</>
}

export default AuthSwitch
