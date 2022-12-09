import * as jwt from "jsonwebtoken"
import { Config } from "@serverless-stack/node/config"
// todo - add expiration and use separate secret for every jwt
interface AccessTokenPayload {
	phoneNumber: number
}

export const encodeAccessToken = (payload: AccessTokenPayload) =>
	jwt.sign(payload, Config.JWT_SECRET)

export const decodeAccessToken = ({ accessToken }: { accessToken: string }) =>
	jwt.verify(accessToken, Config.JWT_SECRET) as AccessTokenPayload

interface AccountCreationTokenPayload {
	phoneNumber: number
}

export const encodeAccountCreationToken = (payload: AccountCreationTokenPayload) =>
	jwt.sign(payload, Config.JWT_SECRET)

export const decodeAccountCreationToken = ({
	accountCreationToken,
}: {
	accountCreationToken: string
}) => jwt.verify(accountCreationToken, Config.JWT_SECRET) as AccountCreationTokenPayload
