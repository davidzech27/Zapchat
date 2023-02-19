import { type FC, useState, useEffect } from "react"
import { View, Text } from "react-native"
import { trpc } from "../shared/lib/trpc"

const PickingButton: FC = () => {
	const { data: canPickAt } = trpc.picking.canPickAt.useQuery()

	useEffect(() => {
		let intervalId: NodeJS.Timer

		if (canPickAt !== undefined) {
			intervalId = setInterval(() => {}, 1000)
		}

		return () => clearInterval(intervalId)
	}, [canPickAt])

	const [secondsUntilCanPickAt, setSecondsUntilCanPickAt] = useState<number | undefined>()

	return secondsUntilCanPickAt !== undefined ? (
		<View className="h-20 w-20 items-center justify-center bg-purple-text">
			{<Text></Text>}
		</View>
	) : null
}

export default PickingButton
