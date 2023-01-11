import { ImagePickerAsset } from "expo-image-picker"
import getHeaders from "../auth/getHeaders"
import { TRPC_URL } from "env"

const uploadProfilePhoto = async (profilePhoto: ImagePickerAsset) => {
	const formData = new FormData()

	formData.append("profilePhoto", {
		name: "profilePhoto.jpg",
		type: "image/jpeg",
		uri: profilePhoto.uri,
	} as any)

	await fetch(`${TRPC_URL}/uploadProfilePhoto`, {
		body: formData,
		method: "POST",
		headers: {
			...getHeaders(),
			"Content-Type": "multipart/form-data",
		},
	})
}

export default uploadProfilePhoto
