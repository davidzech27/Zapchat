import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useState, useRef, type FC } from "react"
import { Ionicons, Feather } from "@expo/vector-icons"
import {
	Modal,
	TextInput,
	View,
	FlatList,
	Text,
	Pressable,
	type NativeSyntheticEvent,
	type NativeScrollEvent,
	useWindowDimensions,
} from "react-native"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import Animated, {
	FadeOut,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	runOnJS,
} from "react-native-reanimated"
import { trpc } from "../../shared/lib/trpc"
import useKeyboard from "../../shared/hooks/useKeyboard"
import useAuthStore from "../auth/useAuthStore"
import ProfilePhoto from "../../shared/components/ProfilePhoto"
import type { Chat as ChatType } from "./useChatStore"
import showErrorAlert from "../../shared/util/showErrorAlert"
import colors from "../../../colors"
import { bezierEasing } from "../../shared/util/easing"
import clsx from "clsx"

// todo - make top bar swipable and add 3 dots button for options. make top bar positioning more robust to different screen and name sizes. make actual presence system. hello jerry

interface ChatContentProps {
	chat: ChatType
	onClose: () => void
}

const ChatContent: FC<ChatContentProps> = ({
	chat: { id, type, name, username, createdOn },
	onClose: onCloseProvided,
}) => {
	const [closed, setClosed] = useState(false)

	const onClose = () => {
		setClosed(true)
		onCloseProvided()
	}

	const { data: messages, status } = trpc.chat.chatMessages.useQuery({ conversationId: id })

	const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation({
		onError: ({ message }) => showErrorAlert(message),
	})

	const queryClient = trpc.useContext()

	const appendMessage = (newMessage: { content: string; fromSelf: boolean; sentAt: Date }) => {
		queryClient.chat.chatMessages.setData({ conversationId: id }, (oldMessages) => {
			return oldMessages ? [newMessage, ...oldMessages] : [newMessage]
		})

		if (scrollPosition.current < 20) {
			messages && flatListRef.current?.scrollToIndex({ index: 0, animated: true })
		}
	}

	const accessToken = useAuthStore((state) => state.accessToken)

	trpc.chat.nextMessage.useSubscription(
		{ conversationId: id, accessToken: accessToken as string },
		{
			enabled: Boolean(accessToken),
			onData: (nextMessage) => {
				console.log({ nextMessage })
				appendMessage(nextMessage)
			},
			onError: ({ message }) => showErrorAlert(message),
			onStarted: () => {
				console.log("subscription started")
			},
		}
	)

	const [messageInput, setMessageInput] = useState("")

	const onChangeMessageInput = (newMessageInput: string) => {
		if (newMessageInput.endsWith("\n")) return
		setMessageInput(newMessageInput)
	}

	const onSend = () => {
		setMessageInput("")

		sendMessage({ conversationId: id, content: messageInput })

		appendMessage({ content: messageInput, fromSelf: true, sentAt: new Date() })
	}

	const scrollPosition = useRef(0)

	const flatListRef = useRef<FlatList>(null)

	const onScroll = ({
		nativeEvent: { contentOffset },
	}: NativeSyntheticEvent<NativeScrollEvent>) => {
		scrollPosition.current = contentOffset.y
	}

	const screenHeight = useWindowDimensions().height

	const topBarYOffset = useSharedValue(0)

	const topBarYOffsetStyle = useAnimatedStyle(() => {
		return { transform: [{ translateY: topBarYOffset.value }] }
	})

	const hiddenBackgroundFadeStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: "#000000",
			opacity: (screenHeight - topBarYOffset.value) / screenHeight / 2,
		}
	}, [screenHeight])

	const messageInputRef = useRef<TextInput>(null)

	const keyboardBlurredBySwipe = useRef(false)

	const blurKeyboard = () => {
		keyboardBlurredBySwipe.current = messageInputRef.current?.isFocused() ?? false
		messageInputRef.current?.blur()
	}
	const focusKeyboard = () => {
		if (keyboardBlurredBySwipe.current) {
			messageInputRef.current?.focus()
			keyboardBlurredBySwipe.current = false
		}
	}

	const topBarPanGesture = Gesture.Pan()
		.onStart(() => {
			runOnJS(blurKeyboard)()
		})
		.onUpdate(({ translationY }) => {
			topBarYOffset.value = translationY > 0 ? translationY : 0
		})
		.onEnd(({ velocityY }) => {
			if (topBarYOffset.value > screenHeight / 4 || velocityY > 350) {
				topBarYOffset.value = withTiming(screenHeight, {
					easing: bezierEasing,
					duration: 500,
				})

				runOnJS(onClose)()
			} else {
				topBarYOffset.value = withTiming(0, {
					easing: bezierEasing,
					duration: 500,
				})

				runOnJS(focusKeyboard)()
			}
		})

	const { keyboardSpace } = useKeyboard()

	const insets = useSafeAreaInsets()

	return (
		<>
			{!closed && (
				<Animated.View
					exiting={FadeOut.duration(75)}
					style={hiddenBackgroundFadeStyle}
					className="absolute top-0 bottom-0 left-0 right-0 flex-1"
				/>
			)}
			<Animated.View style={topBarYOffsetStyle} className="flex-1">
				<GestureDetector gesture={topBarPanGesture}>
					<View
						className={clsx(
							"z-10 flex-row border-b-[0.25px] pb-1.5",
							type === "asChooser"
								? "border-[#FFFFFF2A] bg-black-background"
								: "border-[#00000028] bg-white-background"
						)}
						style={{ paddingTop: insets.top + 11 }}
					>
						<View className="mr-4 flex-1 flex-row justify-center space-x-2.5">
							<ProfilePhoto name={name} username={username} extraSmall dark />
							<View className="flex-col">
								<Text
									className={clsx(
										type === "asChooser"
											? "text-white-text"
											: "text-black-text",
										"bottom-[3px] text-center text-xl font-extrabold leading-[0px]"
									)}
								>
									{name}
								</Text>
								<Text
									className={clsx(
										type === "asChooser"
											? "text-white-text opacity-sub-text-on-black-background"
											: "text-black-text opacity-sub-text-on-white-background",
										"bottom-[3px] text-center text-xs font-medium leading-[0px]"
									)}
								>
									On chat 3 hours ago
								</Text>
							</View>

							{/*//! change */}
						</View>

						<Pressable
							style={{ paddingTop: insets.top + 11 }}
							className="absolute -top-[1px] right-0 mr-3"
							onPress={onClose}
						>
							<Feather
								name="chevron-down"
								size={36}
								color={type === "asChooser" ? "white" : "black"}
							/>
						</Pressable>
					</View>
				</GestureDetector>

				<View
					className={clsx(
						"flex-1 justify-end",
						type === "asChooser" ? "bg-black-background" : "bg-white-background"
					)}
					style={{ paddingBottom: keyboardSpace }}
				>
					<FlatList
						data={messages}
						inverted
						onScroll={onScroll}
						ref={flatListRef}
						renderItem={({ item, index }) => {
							const firstFromSelfMessage =
								item.fromSelf &&
								(index === messages?.length || !messages?.[index + 1]?.fromSelf)

							const firstNotFromSelfMessage =
								!item.fromSelf &&
								(index === messages?.length || !!messages?.[index + 1]?.fromSelf)

							return (
								// content is laid out upside-down
								<>
									<View
										className={clsx(
											"ml-2.5 border-l-[2.5px] pl-2.5",
											type === "asChooser"
												? item.fromSelf
													? "border-white"
													: "border-purple-text bg-[#FFFFFF10]"
												: item.fromSelf
												? "border-black" //! consider adding opacity-80
												: "border-purple-text bg-[#00000008]"
										)}
									>
										<Text
											className={clsx(
												type === "asChooser"
													? "text-white-text"
													: "opacity- text-black-text",
												"text-lg"
											)}
										>
											{item.content}
										</Text>
									</View>
									{firstFromSelfMessage && (
										<View>
											<Text
												className={clsx(
													type === "asChooser"
														? "text-white-text"
														: "text-black-text",
													"ml-[18px] mb-0.5 mt-2.5 font-medium tracking-wider"
												)}
											>
												You
											</Text>
										</View>
									)}
									{firstNotFromSelfMessage && (
										<View>
											<Text className="ml-[18px] mb-0.5 mt-2.5 font-semibold tracking-wider text-purple-text">
												{name}
											</Text>
										</View>
									)}
								</>
							)
						}}
						ListEmptyComponent={() => {
							if (status === "loading") {
								return <Text>"Loading..."</Text>
							}
							return null
						}}
					/>
					<View
						className={clsx(
							"border-t-[0.25px]",
							type === "asChooser" ? "border-[#FFFFFF2A]" : "border-[#00000028]"
						)}
					>
						<View
							className={clsx(
								type === "asChooser" ? "bg-overlay-on-dark" : "bg-overlay-on-light",
								"my-2 mx-4 flex-row rounded-3xl px-5 pt-1.5 pb-2.5"
							)}
						>
							<TextInput
								value={messageInput}
								onChangeText={onChangeMessageInput}
								onSubmitEditing={onSend}
								multiline
								textAlignVertical="top"
								blurOnSubmit={false}
								autoFocus
								enablesReturnKeyAutomatically
								placeholder={`Send ${name} a message`}
								placeholderTextColor={
									type === "asChooser" ? "#FFFFFF40" : "#00000050"
								}
								returnKeyType="send"
								keyboardAppearance={type === "asChooser" ? "dark" : "light"}
								ref={messageInputRef}
								selectionColor={colors["purple-text"]}
								className={clsx(
									type === "asChooser" ? "text-white-text" : "text-black-text",
									"w-full text-lg leading-[0px]"
								)}
							/>
						</View>
					</View>
				</View>
			</Animated.View>
		</>
	)
}

interface ChatProps {
	chat: ChatType | undefined
	onClose: () => void
}

const Chat: FC<ChatProps> = ({ chat, onClose }) => {
	return (
		<Modal
			animationType="slide"
			transparent
			visible={chat !== undefined}
			onRequestClose={onClose}
			className="flex-1"
		>
			{chat !== undefined && (
				// used so that ChatContent can be removed from dom before invisible because it needs to be removed before conversationId is undefined
				<Animated.View exiting={FadeOut.duration(0).delay(300)} className="flex-1">
					<ChatContent chat={chat} onClose={onClose} />
				</Animated.View>
			)}
		</Modal>
	)
}

export default Chat
