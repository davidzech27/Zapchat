import type { FC } from "react"
import useAuthStore, { authedSelector, authLoadedSelector } from "./useAuthStore"
import useProfileStore, { profileLoadedSelector } from "../profile/useProfileStore"

interface AuthSwitchProps {
	Authed: FC
	Unauthed: FC
}

const AuthSwitch: FC<AuthSwitchProps> = ({ Authed, Unauthed }) => {
	const signedIn = useAuthStore(authedSelector)

	const loaded = useAuthStore(authLoadedSelector) && useProfileStore(profileLoadedSelector)

	if (!loaded) return null

	return <>{signedIn ? <Authed /> : <Unauthed />}</>
}

export default AuthSwitch
