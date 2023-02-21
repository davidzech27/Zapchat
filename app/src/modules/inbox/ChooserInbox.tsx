import type { FC } from "react"
import { View, FlatList, Text } from "react-native"
import { StatusBar } from "expo-status-bar"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MainLayoutScreenProps } from "../layout/screen"
import { useState } from "react"
import { trpc } from "../shared/lib/trpc"
import Chat from "../chat/ChatScreen"
import ChatPreview from "./ChatPreview"
import { LinearGradient } from "expo-linear-gradient"

const ChooserInbox: FC<MainLayoutScreenProps> = ({ active }) => {
	const { data: chats } = trpc.inbox.conversationsAsChooser.useQuery()

	const insets = useSafeAreaInsets()

	return (
		<>
			<LinearGradient
				colors={["#000000F8", "#00000000"]}
				className="absolute top-0 bottom-0 left-0 right-0 z-10 h-24"
				onStartShouldSetResponder={() => false}
				onMoveShouldSetResponder={() => false}
				onStartShouldSetResponderCapture={() => false}
				onMoveShouldSetResponderCapture={() => false}
			/>

			<View className={"flex-1 bg-black-background"}>
				<FlatList
					data={chats}
					ListHeaderComponent={View}
					ListHeaderComponentStyle={{ height: 84 + insets.top }}
					renderItem={({ item }) => <ChatPreview {...item} type="asChooser" />}
				/>
			</View>
		</>
	)
}

export default ChooserInbox
