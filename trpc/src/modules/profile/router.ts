import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { z } from "zod"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { profilePhotoBucketClient } from "../../lib/s3"
import { encodeAccessToken } from "../auth/jwt"
import env from "../../env"
import { redisClient } from "../shared/redis/client"
import { TRPCError } from "@trpc/server"

const profileRouter = router({
	updateProfile: authedProcedure
		.input(
			z.object({
				username: z.string().optional(),
				name: z.string().optional(),
			})
		)
		.mutation(
			async ({
				input: { username: usernameNew, name },
				ctx: { phoneNumber, username: usernamePrior },
			}) => {
				await redisClient.profile.update({
					phoneNumber,
					username: usernameNew ? { new: usernameNew, prior: usernamePrior } : undefined,
					name,
				})

				if (usernameNew !== undefined)
					return {
						accessToken: encodeAccessToken({
							phoneNumber,
							username: usernameNew,
						}),
					}
			}
		),
	useDefaultProfilePhoto: authedProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input: { name }, ctx: { username } }) => {
			console.log({ username })

			const defaultProfilePhoto = await fetch(
				`https://avatars.dicebear.com/api/initials/${name
					.split(" ")
					.map((namePart) => namePart[0])
					.join("")}.jpg?backgroundColorLevel=700&fontSize=42`
			)

			const defaultProfilePhotoBuffer = await defaultProfilePhoto.arrayBuffer()

			const s3Command = new PutObjectCommand({
				Bucket: env.PROFILE_PHOTO_BUCKET_NAME,
				Key: username,
				Body: defaultProfilePhotoBuffer,
				ContentType: "image/jpeg",
			})

			await profilePhotoBucketClient.send(s3Command)
		}),
	getUnknownUserInfo: authedProcedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(
			async ({
				input: { username: userUsername },
				ctx: { phoneNumber: selfPhoneNumber, log },
			}) => {
				const userPhoneNumber = await redisClient.profile.getPhoneNumber({
					username: userUsername,
				})

				if (!userPhoneNumber) {
					throw new TRPCError({ code: "NOT_FOUND" })
				}

				const userInfo = await redisClient.profile.getFields({
					phoneNumber: userPhoneNumber,
					fields: ["joinedOn", "conversationCount"],
					onParseError: log.error,
				})

				if (!userInfo) {
					throw new TRPCError({ code: "NOT_FOUND" })
				}

				const mutuals = await redisClient.profile.getFieldsMany({
					phoneNumbers: await redisClient.friends.getMutualFriends({
						phoneNumber: selfPhoneNumber,
						otherPhoneNumber: userPhoneNumber,
					}),
					fields: ["name", "username"],
					onParseError: log.error,
					onNotFound: log.error,
				})

				return {
					...userInfo,
					mutuals,
				}
			}
		),
	getFriendInfo: authedProcedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(async ({ input: { username }, ctx: { log } }) => {
			const phoneNumber = await redisClient.profile.getPhoneNumber({ username })

			if (!phoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			const userInfo = await redisClient.profile.getFields({
				phoneNumber,
				fields: ["joinedOn", "conversationCount"],
				onParseError: log.error,
			})

			if (!userInfo) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			return userInfo
		}),
	getSelfInfo: authedProcedure.query(async ({ ctx: { phoneNumber, log } }) => {
		const userInfo = await redisClient.profile.getFields({
			phoneNumber,
			fields: ["conversationCount"],
			onParseError: log.error,
		})

		if (!userInfo) {
			throw new TRPCError({ code: "NOT_FOUND" })
		}

		return userInfo
	}),
})

export default profileRouter
