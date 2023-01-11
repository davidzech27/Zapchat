import { S3Client } from "@aws-sdk/client-s3"
import env from "../env"

export const profilePhotoBucketClient = new S3Client({
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
	region: env.PROFILE_PHOTO_BUCKET_REGION,
})
