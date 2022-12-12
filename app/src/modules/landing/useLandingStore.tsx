import create from "zustand"

const useLandingStore = create(() => ({
	phoneNumber: undefined as number | undefined,
	accountCreationToken: undefined as string | undefined,
	name: undefined as string | undefined,
	username: undefined as string | undefined,
}))

export default useLandingStore
