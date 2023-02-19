import type { FC, ReactNode } from "react"
import { View, type ViewProps } from "react-native"

interface UserRowProps {
	profilePhoto: ReactNode
	textContent: ReactNode
	rightButtons: ReactNode
	className?: string
	viewProps?: ViewProps
}

const UserRow: FC<UserRowProps> = ({
	profilePhoto,
	textContent,
	rightButtons,
	className,
	viewProps,
}) => {
	return (
		<View
			className={`h-[72px] flex-row items-center justify-between pl-[14px] pr-[18px] ${className}`}
			{...viewProps}
		>
			<View className="flex-shrink flex-row space-x-[14px]">
				{profilePhoto}
				{textContent}
			</View>
			{rightButtons}
		</View>
	)
}

export default UserRow
