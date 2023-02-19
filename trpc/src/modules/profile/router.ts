import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { z } from "zod"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { profilePhotoBucketClient } from "../../lib/s3"
import { db } from "../../lib/db"
import env from "../../env"
import { redisLib } from "../shared/redis/client"
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
				await redisLib.profile.update({
					phoneNumber,
					username: usernameNew ? { new: usernameNew, prior: usernamePrior } : undefined,
					name,
				})
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
				ctx: { phoneNumber: selfPhoneNumber },
			}) => {
				const userPhoneNumber = await redisLib.profile.getPhoneNumber({
					username: userUsername,
				})

				if (!userPhoneNumber) {
					throw new TRPCError({ code: "NOT_FOUND" })
				}

				return {
					...(await redisLib.profile.getFields({
						phoneNumber: userPhoneNumber,
						fields: ["joinedOn", "conversationCount"],
					})),
					mutuals: await redisLib.profile.getFieldsMany({
						phoneNumbers: await redisLib.friends.getMutualFriends({
							phoneNumber: selfPhoneNumber,
							otherPhoneNumber: userPhoneNumber,
						}),
						fields: ["name", "username"],
					}),
				}
			}
		),
	getFriendInfo: authedProcedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(async ({ input: { username } }) => {
			const phoneNumber = await redisLib.profile.getPhoneNumber({ username })

			if (!phoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			return await redisLib.profile.getFields({
				phoneNumber,
				fields: ["joinedOn", "conversationCount"],
			})
		}),
	getSelfInfo: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return await redisLib.profile.getFields({ phoneNumber, fields: ["conversationCount"] })
	}),
})

export default profileRouter
