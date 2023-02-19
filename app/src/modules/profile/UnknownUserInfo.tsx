import type { FC } from "react"
import { View } from "react-native"
import { trpc } from "../shared/lib/trpc"
import UserInfo, { UserInfoLoading } from "./UserInfo"
import getTimeAgo from "../shared/util/getTimeAgo"
import ProfilePhoto from "../shared/components/ProfilePhoto"

interface UnknownUserInfoProps {
	username: string
}
// TODO
const UnknownUserInfo: FC<UnknownUserInfoProps> = ({ username }) => {
	const { data: info } = trpc.profile.getUnknownUserInfo.useQuery({ username })

	return info !== undefined ? (
		<UserInfo
			info={{
				"JOINED ON": getTimeAgo({ date: info.joinedOn }),
				CHATS: info.conversationCount,
				...(info.mutuals !== undefined
					? {
							MUTUALS: (
								<>
									<View className="flex-row gap-2">
										{info.mutuals.map((mutual) => (
											<ProfilePhoto
												username={mutual.username}
												name={mutual.name}
											/>
										))}
									</View>
								</>
							),
					  }
					: {}),
			}}
		/>
	) : (
		<UserInfoLoading numberOfKeys={2} />
	)
}

export default UnknownUserInfo
