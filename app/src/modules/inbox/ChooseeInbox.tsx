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

const ChooseeInbox: FC<MainLayoutScreenProps> = ({ active }) => {
	const { data: chats } = trpc.inbox.conversationsAsChoosee.useQuery()

	const insets = useSafeAreaInsets()

	return (
		<>
			<View className={"flex-1 bg-white-background"}>
				<FlatList
					data={chats}
					ListHeaderComponent={View}
					ListHeaderComponentStyle={{ height: 84 + insets.top }}
					renderItem={({ item }) => (
						<ChatPreview
							{...item}
							identified={item.username !== undefined}
							type="asChoosee"
						/>
					)}
				/>
			</View>
		</>
	)
}

export default ChooseeInbox
