import { SafeAreaView } from "react-native-safe-area-context"
import PagerView from "react-native-pager-view"
import { StatusBar } from "expo-status-bar"
import { Text, Pressable, View, StyleSheet } from "react-native"
import { useState, useRef, type FC } from "react"
import { trpc } from "../../lib/trpc"
import ChatInput from "./ChatInput"

const UserPickingPage: FC = () => {
	const { data: choices } = trpc.picking.choices.useQuery()

	const { mutate: chooseUser } = trpc.picking.choose.useMutation()

	const [selectedUsername, setSelectedUsername] = useState("")

	const [chatInputOpen, setChatInputOpen] = useState(false)

	const onSend = ({ textInput }: { textInput: string }) => {
		chooseUser({ chooseeUsername: selectedUsername, firstMessage: textInput })
	}

	const onChatClose = () => setChatInputOpen(false)

	return (
		<SafeAreaView style={styles.container}>
			{choices ? (
				<PagerView
					initialPage={0}
					onPageSelected={({ nativeEvent: { position } }) =>
						setSelectedUsername(choices[position].username)
					}
					style={styles.container}
				>
					{choices.map((choice) => (
						<View key={choice.username} style={styles.page}>
							<View style={styles.choiceInfo}>
								<Text style={styles.name}>{choice.name}</Text>

								<Pressable
									onPress={() => setChatInputOpen(true)}
									style={styles.chatButton}
								>
									<Text style={styles.chatButtonText}>Choose</Text>
								</Pressable>
							</View>

							<StatusBar hidden />
						</View>
					))}
				</PagerView>
			) : null}

			<ChatInput
				open={chatInputOpen}
				onClose={onChatClose}
				onSubmit={onSend}
				placeholder="Send a message anonymously"
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	page: {
		flex: 1,
		backgroundColor: "#009AFA",
		flexDirection: "row",
	},
	choiceInfo: {
		alignSelf: "center",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		height: "25%",
		width: "100%",
	},
	chatButton: {
		backgroundColor: "#38B3FF",
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 9999,
	},
	chatButtonText: {
		fontSize: 30,
		fontWeight: "300",
		color: "#FFF",
	},
	name: {
		fontSize: 50,
		fontWeight: "500",
		color: "#FFF",
	},
})

export default UserPickingPage
