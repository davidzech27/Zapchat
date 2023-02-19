import type { FC } from "react"
import { Text as TextRn, type TextProps } from "react-native"
import { styled } from "nativewind"
import Animated from "react-native-reanimated"

const StyledText = styled(TextRn)
const StyledAnimatedText = styled(Animated.Text)

const MainText: FC<
	{
		weight?:
			| "extralight"
			| "light"
			| "regular"
			| "medium"
			| "semibold"
			| "bold"
			| "extrabold"
			| "black"
		light?: boolean
		animated?: boolean
	} & TextProps
> = ({ weight = "regular", light = false, animated, style, className, children, ...props }) => {
	const fontStyles: { [key in typeof weight]: TextProps["style"] } = {
		extralight: { fontWeight: "200" },
		light: { fontWeight: "300" },
		regular: { fontWeight: "400" },
		medium: { fontWeight: "500" },
		semibold: { fontWeight: "600" },
		bold: { fontWeight: "700" },
		extrabold: { fontWeight: "800" },
		black: { fontWeight: "900" },
	}

	const textProps = {
		style: [fontStyles[weight], style],
		className: `${className} ${light ? "text-white" : "text-[#000000]"}`, //#101417
		...props,
	}

	return animated ? (
		<StyledAnimatedText {...textProps}>{children}</StyledAnimatedText>
	) : (
		<StyledText {...textProps}>{children}</StyledText>
	)
}

export default styled(MainText)
