export type MessagePrivate = {
	content: string
	fromPhoneNumber: number
	sentAt: Date
}

export type MessagePublic = {
	content: string
	fromSelf: boolean
	sentAt: Date
}
