import { View, FlatList, Text } from "react-native"
import { StatusBar } from "expo-status-bar"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MainLayoutScreenProps } from "../layout/screen"
import { useState } from "react"
import { trpc } from "../../shared/lib/trpc"
import Chat from "../chat/Chat"
import Conversation from "./Conversation"
import { LinearGradient } from "expo-linear-gradient"

const Inbox = ({ active, type }: MainLayoutScreenProps & { type: "asChooser" | "asChoosee" }) => {
	let data:
		| {
				id: number
				name?: string
				username?: string
				createdOn: Date
		  }[]
		| undefined

	if (type === "asChooser") {
		data = trpc.inbox.conversationsAsChooser.useQuery().data
	} else {
		data = trpc.inbox.conversationsAsChoosee.useQuery().data
	}

	const insets = useSafeAreaInsets()

	return (
		<>
			{type === "asChooser" && (
				<LinearGradient
					colors={["#000000F8", "#00000000"]}
					className="absolute top-0 bottom-0 left-0 right-0 z-10 h-24"
					onStartShouldSetResponder={() => false}
					onMoveShouldSetResponder={() => false}
					onStartShouldSetResponderCapture={() => false}
					onMoveShouldSetResponderCapture={() => false}
				/>
			)}
			<View
				className={`flex-1 ${
					type === "asChooser" ? "bg-black-background" : "bg-white-background"
				}`}
			>
				<FlatList
					data={data}
					ListHeaderComponent={View}
					ListHeaderComponentStyle={{ height: 84 + insets.top }}
					renderItem={({ item }) => <Conversation {...item} type={type} />}
				/>
			</View>
		</>
	)
}

export default Inbox
