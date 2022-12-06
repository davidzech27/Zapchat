import PhoneNumberPage from "./PhoneNumberPage"
import OTPVerificationPage from "./OTPVerificationPage"
import { LandingStack } from "./Stack"

const Landing = () => {
	return (
		<LandingStack.Navigator>
			<LandingStack.Screen name="Phone" component={PhoneNumberPage} />
			<LandingStack.Screen name="OTP" component={OTPVerificationPage} />
		</LandingStack.Navigator>
	)
}

export default Landing
