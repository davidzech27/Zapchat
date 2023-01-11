import { type FC } from "react"
import { View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import MainText from "../../components/MainText"
import Chat from "../chat/Chat"
import useTimeAgo from "../../hooks/useTimeAgo"
import UserRow from "../../components/UserRow"
import ProfilePhoto from "../../components/ProfilePhoto"

interface ConversationProps {
	id: number
	active: boolean
	onOpen: () => void
	onClose: () => void
	type: "asChooser" | "asChoosee"
	name: string | undefined
	username: string | undefined
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
		<>
			<UserRow
				profilePhoto={
					type === "asChooser" ? (
						<ProfilePhoto username={username!} name={name!} />
					) : (
						<View className="h-[52px] w-[52px] bg-[#00000020] rounded-full" />
					)
				}
				textContent={
					<View className="flex-col py-1.5 justify-between flex-shrink">
						<MainText numberOfLines={1}>{name}</MainText>

						<View className="flex-row">
							{/* put icon here eventually */}
							<MainText
								numberOfLines={1}
								className="opacity-50 text-xs"
							>{`${username} • ${useTimeAgo({
								date: createdOn,
							})}`}</MainText>
						</View>
					</View>
				}
				rightButtons={
					<View className="h-9 w-9 bg-primary-400 rounded-full self-center justify-center items-center">
						<MaterialCommunityIcons
							onPress={onOpen}
							suppressHighlighting
							name={type === "asChooser" ? "lightning-bolt" : "cloud-outline"}
							size={type === "asChooser" ? 24 : 21}
							color="white"
						/>
					</View>
				}
			/>
			<Chat
				id={id}
				active={active}
				onClose={onClose}
				type={type}
				name={name}
				username={username}
				createdOn={createdOn}
			/>
		</>
	)
}

export default Conversation
