import type { FastifyPluginCallback } from "fastify"
import fastifyMultipart from "@fastify/multipart"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { profilePhotoBucketClient } from "../../lib/s3"
import env from "../../env"
import getAccessTokenFromRequest from "../auth/getAccessTokenFromHeaders"
import { decodeAccessToken } from "../auth/jwt"

const uploadProfilePhotoHandler: FastifyPluginCallback = (instance, _options, done) => {
	instance.register(fastifyMultipart, {
		limits: {
			fields: 0,
			fileSize: 10_000_000, // setting to high value now, will change later depending on frontend logic
			files: 1,
		},
		throwFileSizeLimit: false,
	})

	instance.post("/uploadProfilePhoto", async (req, reply) => {
		const accessToken = getAccessTokenFromRequest({ req })

		if (!accessToken) {
			return reply.status(401).send()
		}

		let username: string

		try {
			username = decodeAccessToken({ accessToken }).username
		} catch {
			return reply.status(401).send()
		}

		try {
			const fileData = await req.file()

			if (fileData?.file.truncated) {
				return reply.status(413).send()
			}

			const profilePhotoBuffer = await fileData?.toBuffer()

			if (profilePhotoBuffer) {
				const s3Command = new PutObjectCommand({
					Bucket: env.PROFILE_PHOTO_BUCKET_NAME,
					Key: username,
					Body: profilePhotoBuffer,
					ContentType: fileData!.mimetype,
				})

				await profilePhotoBucketClient.send(s3Command)

				return reply.status(200).send()
			} else {
				return reply.status(400).send()
			}
		} catch (err) {
			return reply.status(500).send()
		}
	})

	done()
}

export default uploadProfilePhotoHandler
