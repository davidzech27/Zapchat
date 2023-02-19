const OTP = ({ phoneNumber }: { phoneNumber: number }) => `otp:${phoneNumber}`
const resendCoolingDown = ({ phoneNumber }: { phoneNumber: number }) => `resendcd:${phoneNumber}`
const verificationAttempts = ({ phoneNumber }: { phoneNumber: number }) => `verifatt:${phoneNumber}`
const verificationCoolingDown = ({ phoneNumber }: { phoneNumber: number }) =>
	`verifcd:${phoneNumber}`

export default { OTP, resendCoolingDown, verificationAttempts, verificationCoolingDown }
