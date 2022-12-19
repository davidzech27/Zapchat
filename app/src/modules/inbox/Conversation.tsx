import { type FC } from "react"
import { View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import MainText from "../../components/MainText"
import Chat from "../chat/Chat"
import useTimeAgo from "../../hooks/useTimeAgo"

interface ConversationProps {
	id: number
	active: boolean
	onOpen: () => void
	onClose: () => void
	type: "asChooser" | "asChoosee"
	name?: string
	username?: string
	createdOn: Date
}

const Conversation: FC<ConversationProps> = ({
	id,
	active,
	onOpen,
	onClose,
	type,
	name,
	username,
	createdOn,
}) => {
	return (
		<View className="h-20 px-6 py-3 flex-row justify-between">
			<View className="flex-row">
				<View className="h-full w-14 mr-4 bg-[#00000010] rounded-full" />

				<View className="flex-col justify-between py-[7px]">
					<MainText size="md">{name}</MainText>
					<View className="flex-row">
						{/* put icon here eventually */}
						<MainText size="xs" className="opacity-60">{`@${username} • ${useTimeAgo({
							date: createdOn,
						})}`}</MainText>
					</View>
				</View>
			</View>

			<View className="h-9 w-9 bg-primary-400 rounded-full self-center justify-center items-center">
				<MaterialCommunityIcons
					onPress={onOpen}
					suppressHighlighting
					name={type === "asChooser" ? "lightning-bolt" : "cloud-outline"}
					size={type === "asChooser" ? 24 : 21}
					color="white"
				/>
			</View>

			<Chat
				id={id}
				active={active}
				onClose={onClose}
				type={type}
				name={name}
				username={username}
				createdOn={createdOn}
			/>
		</View>
	)
}

export default Conversation
