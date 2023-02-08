import { Alert } from "react-native"

const showErrorAlert = (message: string) => {
	Alert.alert("Hey!", message)
}

export default showErrorAlert
