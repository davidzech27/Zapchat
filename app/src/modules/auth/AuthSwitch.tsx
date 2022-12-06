import type { FC, ReactNode } from "react"
import useAuthStore from "./useAuthStore"

interface Props {
	authed: ReactNode
	unauthed: ReactNode
}

const AuthSwitch: FC<Props> = ({ authed, unauthed }) => {
	const signedIn = useAuthStore((s) => s.accessToken !== undefined && s.accessToken !== "")

	return <>{signedIn ? authed : unauthed}</>
}

export default AuthSwitch
