import PagerView from "react-native-pager-view"
import { styled } from "nativewind"
import { StatusBar } from "expo-status-bar"
import { Pressable, View, Modal } from "react-native"
import { useState } from "react"
import { AntDesign } from "@expo/vector-icons"
import { MainLayoutScreen } from "../layout/screen"
import MainText from "../shared/components/MainText"
import { trpc } from "../shared/lib/trpc"
import ChatInput from "./ChatInput"
import FadeAnimation from "../shared/components/FadeAnimation"

const StyledPagerView = styled(PagerView)

const UserPickingPage: MainLayoutScreen = ({ active }) => {
	const [isPicking, setIsPicking] = useState(false)

	const { data: choices } = trpc.picking.choices.useQuery()

	const { mutate: chooseUser } = trpc.picking.choose.useMutation()

	const [selectedUsername, setSelectedUsername] = useState("")

	const [chatInputOpen, setChatInputOpen] = useState(false)

	const queryClient = trpc.useContext()

	const onSend = ({ textInput }: { textInput: string }) => {
		setIsPicking(false)
		chooseUser(
			{ chooseeUsername: selectedUsername, firstMessage: textInput },
			{
				onSuccess: () => queryClient.inbox.conversationsAsChooser.invalidate(),
			}
		)
	}

	const onChatClose = () => {
		setChatInputOpen(false)
	}

	return (
		<View className="flex-1">
			{isPicking && choices ? (
				<Modal animationType="slide" transparent>
					<View className="absolute top-5 left-5 z-10">
						<AntDesign
							name="close"
							size={30}
							color="white"
							onPress={() => setIsPicking(false)}
							suppressHighlighting
						/>
					</View>

					<StyledPagerView
						initialPage={0}
						onPageSelected={({ nativeEvent: { position } }) =>
							setSelectedUsername(choices[position].username)
						}
						className="absolute top-0 bottom-0 left-0 right-0 flex-1"
					>
						{choices.map((choice) => (
							<View
								key={choice.username}
								className={`flex-1 flex-row px-10 ${
									[
										"bg-primary-300",
										"bg-primary-400",
										"bg-primary-500",
										"bg-primary-600",
										"bg-secondary-500",
									][choice.username.charCodeAt(0) % 5]
								}`}
							>
								<View className="h-1/4 w-full flex-col items-center justify-between self-center">
									<MainText
										weight="medium"
										light
										className="text-center text-5xl leading-[56px]"
									>
										{choice.name}
									</MainText>

									<FadeAnimation visible={!chatInputOpen} duration={250}>
										<Pressable
											onPress={() => setChatInputOpen(true)}
											className="rounded-full bg-[#FFFFFF30] px-8 py-2.5"
										>
											<MainText weight="light" light className="text-2xl">
												Choose
											</MainText>
										</Pressable>
									</FadeAnimation>
								</View>
							</View>
						))}
					</StyledPagerView>

					<ChatInput
						open={chatInputOpen}
						onClose={onChatClose}
						onSubmit={onSend}
						placeholder="Send a message anonymously"
					/>
				</Modal>
			) : null}

			<View className="flex-1 items-center justify-center bg-black ">
				<Pressable
					className="bg-secondary-500 rounded-full px-8 py-3"
					onPress={() => setIsPicking(true)}
				>
					<MainText weight="light" light className="text-xl">
						Start Picking
					</MainText>
				</Pressable>

				<View className="absolute bottom-28 left-0 right-0 h-6 flex-row justify-between px-14">
					{[0, 1, 2, 3, 4].map((key) => (
						<View key={key} className="bg-primary-400 h-6 w-6 rounded-full" />
					))}
				</View>

				{active && <StatusBar style="light" hidden={isPicking} />}
			</View>
		</View>
	)
}

export default UserPickingPage
