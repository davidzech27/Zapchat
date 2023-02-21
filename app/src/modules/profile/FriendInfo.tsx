import type { FC } from "react"
import { trpc } from "../shared/lib/trpc"
import UserInfo, { UserInfoLoading } from "./UserInfo"
import getTimeAgo from "../shared/util/getTimeAgo"

interface FriendInfoProps {
	username: string
}

const FriendInfo: FC<FriendInfoProps> = ({ username }) => {
	const { data: info } = trpc.profile.getFriendInfo.useQuery({ username })

	return info !== undefined ? (
		<UserInfo
			info={{
				JOINED: getTimeAgo({ date: info.joinedOn }),
				CHATS: info.conversationCount,
			}}
		/>
	) : (
		<UserInfoLoading numberOfKeys={2} />
	)
}

export default FriendInfo
