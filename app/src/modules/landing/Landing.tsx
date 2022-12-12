import PhoneNumberPage from "./PhoneNumberPage"
import OTPVerificationPage from "./OTPVerificationPage"
import NamePage from "./NamePage"
import UsernamePage from "./UsernamePage"
import { LandingStack } from "./Stack"

const Landing = () => {
	return (
		<LandingStack.Navigator>
			<LandingStack.Screen name="Phone" component={PhoneNumberPage} />
			<LandingStack.Screen name="OTP" component={OTPVerificationPage} />
			<LandingStack.Screen name="Name" component={NamePage} />
			<LandingStack.Screen name="Username" component={UsernamePage} />
		</LandingStack.Navigator>
	)
}

export default Landing
