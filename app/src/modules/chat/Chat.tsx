import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useState, type FC } from "react"
import { AntDesign } from "@expo/vector-icons"
import { Ionicons } from "@expo/vector-icons"
import {
	Modal,
	TextInput,
	View,
	FlatList,
	Platform,
	KeyboardAvoidingView,
	ScrollView,
	Keyboard,
	Pressable,
} from "react-native"
import { trpc } from "../../lib/trpc"
import useKeyboard from "../../hooks/useKeyboard"
import MainText from "../../components/MainText"
import useAuthStore from "../auth/useAuthStore"

interface ChatProps {
	id: number
	active: boolean
	onClose: () => void
	type: "asChooser" | "asChoosee"
	name?: string
	username?: string
	createdOn: Date
}

const Chat: FC<ChatProps> = ({ id, active, onClose, type, name, username }) => {
	const { data: messages, status } = trpc.chat.chatMessages.useQuery({ conversationId: id })

	const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation()

	const queryClient = trpc.useContext()

	const appendMessage = (newMessage: { content: string; fromSelf: boolean; sentAt: Date }) => {
		queryClient.chat.chatMessages.setData({ conversationId: id }, (oldMessages) => {
			return [newMessage, ...oldMessages!]
		})
	}

	const accessToken = useAuthStore((state) => state.accessToken)

	trpc.chat.nextMessage.useSubscription(
		{ conversationId: id, accessToken: accessToken as string },
		{
			enabled: Boolean(accessToken),
			onData: (nextMessage) => {
				appendMessage(nextMessage)
			},
		}
	)

	const [messageInput, setMessageInput] = useState("")

	const onSend = () => {
		sendMessage({ conversationId: id, content: messageInput })
		setMessageInput("")
		appendMessage({ content: messageInput, fromSelf: true, sentAt: new Date() })
	}

	const { keyboardSpace } = useKeyboard()

	const insets = useSafeAreaInsets()

	return (
		<Modal animationType="slide" transparent visible={active} className="flex-1">
			<Pressable onPress={onClose} className="absolute top-5 right-5 z-10">
				<AntDesign name="close" size={30} color="black" />
			</Pressable>

			<View
				className="h-18 bg-white border-b border-[#00000030]"
				style={{ paddingTop: insets.top }}
			></View>

			<View className="flex-1 bg-white justify-end" style={{ paddingBottom: keyboardSpace }}>
				<FlatList
					data={messages}
					inverted
					renderItem={({ item }) => {
						return (
							<View
								className={`pl-11 pr-3 py-2 ${
									item.fromSelf ? "bg-slate-100" : "bg-slate-200"
								}`}
							>
								<MainText>{item.content}</MainText>
							</View>
						)
					}}
					ListEmptyComponent={() => {
						if (status === "loading") {
							return <MainText>"Loading..."</MainText>
						}
						return null
					}}
					keyboardShouldPersistTaps="handled"
				/>
				<View className="h-16 w-full py-2 px-4 flex-row space-x-2 border-t-[1px] border-slate-100">
					<TextInput
						value={messageInput}
						multiline
						blurOnSubmit={false}
						onChangeText={setMessageInput}
						onSubmitEditing={onSend}
						cursorColor="#000000"
						autoFocus
						placeholder={
							type === "asChooser"
								? `Send ${name} a message`
								: `Send someone a message` // from your school? to one of your friends? will depend on settings
						}
						placeholderTextColor="#00000040"
						returnKeyType="send"
						keyboardAppearance="light"
						className="px-5 flex-1 bg-[#00000010] text-black text-[18px] rounded-full"
					/>
					<View className="h-12 w-12 rounded-full bg-[#00000010] justify-center items-center pl-1">
						<Ionicons
							onPress={onSend}
							suppressHighlighting
							name="md-send"
							size={24}
							color="#474EE9"
						/>
					</View>
				</View>
			</View>
		</Modal>
	)
}

export default Chat
