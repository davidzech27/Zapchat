import { TRPCError } from "@trpc/server"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { z } from "zod"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { profilePhotoBucketClient } from "../../lib/s3"
import db from "../../lib/db"
import env from "../../env"

const profileRouter = router({
	me: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const [self, friends] = await Promise.all([
			db
				.selectFrom("user")
				.select(["name", "username", "joinedOn"]) //! in future, this information will be gotten from user cache, and this will be replaced by other data
				.where("phoneNumber", "=", phoneNumber)
				.executeTakeFirstOrThrow(),
			db
				.selectFrom("user")
				.select(["name", "username", "joinedOn"])
				.whereRef("phoneNumber", "in", (db) =>
					db
						.selectFrom("connection")
						.select("otherUserPhoneNumber")
						.where("userPhoneNumber", "=", phoneNumber)
				)
				.execute(),
		])

		return {
			self,
			friends,
		}
	}),
	updateProfile: authedProcedure
		.input(
			z.object({
				name: z.string().optional(),
			})
		)
		.mutation(async ({ input: { name }, ctx: { phoneNumber } }) => {
			await db
				.updateTable("user")
				.set({ name })
				.where("phoneNumber", "=", phoneNumber)
				.execute()
		}),
	useDefaultProfilePhoto: authedProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input: { name }, ctx: { username } }) => {
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
})

export default profileRouter
