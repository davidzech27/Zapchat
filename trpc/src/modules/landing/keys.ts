const OTP = ({ phoneNumber }: { phoneNumber: number }) => `auth:${phoneNumber}:otp`
const resendCoolingDown = ({ phoneNumber }: { phoneNumber: number }) =>
	`auth:${phoneNumber}:resendcd`
const verificationAttempts = ({ phoneNumber }: { phoneNumber: number }) =>
	`auth:${phoneNumber}:verifatt`
const verificationCoolingDown = ({ phoneNumber }: { phoneNumber: number }) =>
	`auth:${phoneNumber}:verifcd`

export default { OTP, resendCoolingDown, verificationAttempts, verificationCoolingDown }
