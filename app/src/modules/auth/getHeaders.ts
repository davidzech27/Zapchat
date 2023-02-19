import useAuthStore from "./useAuthStore"

const getHeaders = () => {
	const accessToken = useAuthStore.getState().accessToken

	const headers: HeadersInit = accessToken
		? {
				authorization: `Bearer ${accessToken}`,
		  }
		: {}

	if (__DEV__) {
		headers["ngrok-skip-browser-warning"] = "true"
	}

	return headers
}

export default getHeaders
