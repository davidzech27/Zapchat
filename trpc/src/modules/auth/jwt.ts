import jwt from "jsonwebtoken"
import env from "../../env"

// todo - add expiration and use separate secret for every jwt
interface AccessTokenPayload {
	phoneNumber: number
}

export const encodeAccessToken = (payload: AccessTokenPayload) =>
	jwt.sign(payload, env.ACCESS_TOKEN_SECRET)

export const decodeAccessToken = ({ accessToken }: { accessToken: string }) =>
	jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload

interface AccountCreationTokenPayload {
	phoneNumber: number
}

export const encodeAccountCreationToken = (payload: AccountCreationTokenPayload) =>
	jwt.sign(payload, env.ACCOUNT_CREATION_TOKEN_SECRET)

export const decodeAccountCreationToken = ({
	accountCreationToken,
}: {
	accountCreationToken: string
}) =>
	jwt.verify(
		accountCreationToken,
		env.ACCOUNT_CREATION_TOKEN_SECRET
	) as AccountCreationTokenPayload
