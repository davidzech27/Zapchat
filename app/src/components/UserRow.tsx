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
			className={`h-[72px] flex-row pl-[14px] pr-[18px] justify-between items-center ${className}`}
			{...viewProps}
		>
			<View className="flex-row space-x-[14px] flex-shrink">
				{profilePhoto}
				{textContent}
			</View>
			{rightButtons}
		</View>
	)
}

export default UserRow
