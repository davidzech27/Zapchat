import clsx from "clsx"
import { Fragment, type ReactNode, type FC } from "react"
import { Text, View } from "react-native"

interface UserInfoProps {
	info: Record<string, string | number | ReactNode>
}

const UserInfo: FC<UserInfoProps> = ({ info }) => {
	return (
		<View className="w-full rounded-[18px] bg-[#FFFFFF1A] px-7 py-5">
			{Object.entries(info).map(([key, value], keyIndex) => (
				<Fragment key={key}>
					<Text className="text-sm font-medium tracking-wide text-white opacity-50">
						{key}
					</Text>
					<Text
						className={clsx(
							"text-xl font-medium text-white opacity-80",
							keyIndex + 1 !== Object.keys(info).length && "mb-1"
						)}
					>
						{value}
					</Text>
				</Fragment>
			))}
		</View>
	)
}

export default UserInfo

interface UserInfoLoadingProps {
	numberOfKeys: number
}

export const UserInfoLoading: FC<UserInfoLoadingProps> = ({ numberOfKeys }) => {
	return (
		<View
			style={{ height: 52 * numberOfKeys - 4 + 40 }}
			className="w-full rounded-[18px] bg-[#FFFFFF1A] px-7"
		></View>
	)
}
