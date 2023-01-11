import { View, FlatList } from "react-native"
import { StatusBar } from "expo-status-bar"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { MainSwiperScreen } from "../layout/Swiper"
import MainText from "../../components/MainText"
import { useState } from "react"
import { trpc } from "../../lib/trpc"
import Chat from "../chat/Chat"
import Conversation from "./Conversation"

const Inbox: MainSwiperScreen<"Inbox"> = ({ navigation, route }) => {
	const { data: conversationsAsChooser } = trpc.inbox.conversationsAsChooser.useQuery()

	const { data: conversationsAsChoosee } = trpc.inbox.conversationsAsChoosee.useQuery()

	const [activeChatConversationId, setActiveChatConversationId] = useState<number | undefined>()

	const [onTab, setOnTab] = useState<"asChooser" | "asChoosee">("asChooser")

	const openChat = (conversation: { id: number }) => {
		setActiveChatConversationId(conversation.id)
	}

	const closeChat = () => {
		setActiveChatConversationId(undefined)
	}

	const insets = useSafeAreaInsets()

	return (
		<View className="flex-1 bg-[#ffffff]" style={{ paddingTop: insets.top }}>
			<View className="flex-row justify-center">
				<MainText onPress={() => setOnTab("asChooser")} className="ml-8 mt-2">
					Chosen users
				</MainText>
				<MainText onPress={() => setOnTab("asChoosee")} className="ml-8 mt-2">
					Users that chose you
				</MainText>
			</View>

			<View className="flex-1">
				<View
					className={`bg-white absolute top-0 left-0 right-0 bottom-0 ${
						onTab === "asChooser" ? "z-10" : ""
					}`}
				>
					<FlatList
						data={conversationsAsChooser}
						ListEmptyComponent={<MainText>You have not yet chosen any users!</MainText>}
						renderItem={({ item, index, separators }) => (
							<Conversation
								id={item.id}
								active={activeChatConversationId === item.id}
								onOpen={() => openChat({ id: item.id })}
								onClose={closeChat}
								type="asChooser"
								name={item.name}
								username={item.username}
								createdOn={item.createdOn}
							/>
						)}
						keyboardShouldPersistTaps="handled" // temporary workaround for nested scrollviews
						nestedScrollEnabled={true}
						ItemSeparatorComponent={() => <View className="h-[0.5px] bg-slate-200" />}
					/>
				</View>
			</View>

			{/* consider moving chat component so it exists within every conversation in the list */}
			{false && <StatusBar style="dark" />}
		</View>
	)
}

export default Inbox
