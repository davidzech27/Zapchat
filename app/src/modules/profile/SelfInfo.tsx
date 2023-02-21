import type { FC } from "react"
import { trpc } from "../shared/lib/trpc"
import getTimeAgo from "../shared/util/getTimeAgo"
import useProfileStore from "./useProfileStore"
import UserInfo, { UserInfoLoading } from "./UserInfo"

const SelfInfo: FC = () => {
	const { data: info } = trpc.profile.getSelfInfo.useQuery()

	const { joinedOn } = useProfileStore((s) => s.profile)!

	return info !== undefined ? (
		<UserInfo
			info={{
				JOINED: getTimeAgo({ date: joinedOn }),
				CHATS: info.conversationCount,
				"JOINED ": getTimeAgo({ date: joinedOn }), //!
				"CHATS ": info.conversationCount, //!
			}}
		/>
	) : (
		<UserInfoLoading numberOfKeys={2} />
	)
}

export default SelfInfo
