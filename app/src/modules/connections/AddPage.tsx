import { useState, useMemo } from "react"
import { View, SectionList, Pressable, type SectionListData } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MainSwiperScreen } from "../layout/Swiper"
import { trpc } from "../../lib/trpc"
import MainText from "../../components/MainText"
import Recommendation from "./Recommendation"
import IncomingRequest from "./IncomingRequest"
import ProfilePhoto from "../../components/ProfilePhoto"

// todo - move outgoingRequests to Recommendation component state when recommendations no longer send already added users

const AddPage: MainSwiperScreen<"Add"> = ({ route, navigation }) => {
	console.log(navigation.isFocused())
	const { data: recommendations } = trpc.connection.recommendations.useQuery()
	const { data: outgoingRequests } = trpc.connection.outgoingRequests.useQuery()

	const recommendationsWithRequestedInfo = useMemo(() => {
		if (recommendations && outgoingRequests) {
			return recommendations.map((recommendation) => ({
				...recommendation,
				requested: outgoingRequests.has(recommendation.username),
			}))
		}
	}, [recommendations, outgoingRequests])

	const { data: incomingRequests } = trpc.connection.incomingRequests.useQuery()

	type RecommendationWithRequestedInfoType = Exclude<
		typeof recommendationsWithRequestedInfo,
		undefined
	>[0]
	type IncomingRequestType = Exclude<typeof incomingRequests, undefined>[0]

	type AddSectionListData = SectionListData<
		RecommendationWithRequestedInfoType | IncomingRequestType,
		{ title: string; type: "incomingRequest" | "recommendation" }
	>

	const sectionListData: AddSectionListData[] = [
		{
			title: "Added you",
			type: "incomingRequest",
			data: incomingRequests!,
		},
		{
			title: "Quick add", //! stolen from snap
			type: "recommendation",
			data: recommendationsWithRequestedInfo!,
		},
	]

	const queryClient = trpc.useContext()

	const profileData = queryClient.profile.me.getData()?.self

	const insets = useSafeAreaInsets()

	return (
		<View className="flex-1">
			<View
				className="h-[84px] justify-end bg-white border-b-[0.5px] border-slate-200" // todo - render shadow conditionally
				style={{ paddingTop: insets.top }}
			>
				<View className="h-11 flex-row items-baseline justify-between px-6">
					<MainText weight="bold" className="text-2xl">
						Add
					</MainText>

					<Pressable className="active:opacity-70">
						{profileData ? (
							<ProfilePhoto
								small
								username={profileData.username}
								name={profileData.name}
								extraClassName=""
							/>
						) : null}
					</Pressable>
				</View>
			</View>

			{incomingRequests && recommendationsWithRequestedInfo ? (
				<SectionList
					sections={sectionListData}
					renderItem={({ item, section: { type } }) => {
						if (type === "incomingRequest") {
							return <IncomingRequest {...(item as IncomingRequestType)} />
						} else {
							return (
								<Recommendation
									{...(item as RecommendationWithRequestedInfoType)}
								/>
							)
						}
					}}
					stickySectionHeadersEnabled={false} // set to true when there is a bigger top header
					renderSectionHeader={({ section }) => {
						return section.data.length !== 0 ? (
							<View className="h-12 px-4 py-1.5 justify-end bg-white">
								<MainText weight="bold" className="text-lg">
									{section.title}
								</MainText>
							</View>
						) : null
					}}
					keyExtractor={({ username }) => username}
				/>
			) : null}
			{navigation.isFocused() && <StatusBar style="dark" />}
		</View>
	)
}

export default AddPage
