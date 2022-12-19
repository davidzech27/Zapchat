import type { FC } from "react"
import { Text as TextRn, type TextProps } from "react-native"
import { styled } from "nativewind"

const MainText: FC<
	{
		weight?: "thin" | "light" | "roman" | "medium" | "bold" | "heavy" | "black"
		size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
		light?: boolean
		italic?: boolean
	} & TextProps
> = ({
	weight = "roman",
	size = "md",
	light = false,
	italic = false,
	style,
	className,
	children,
	...props
}) => {
	const fontStyles: { [key in typeof weight]: TextProps["style"] } = {
		thin: { fontFamily: "Helvetica-Thin" },
		light: { fontFamily: "Helvetica-Light" },
		roman: { fontFamily: "Helvetica-Roman" },
		medium: { fontFamily: "Helvetica-Medium" },
		bold: { fontFamily: "Helvetica-Bold" },
		heavy: { fontFamily: "Helvetica-Heavy" },
		black: { fontFamily: "Helvetica-Black" },
	}

	const sizeStyles: { [key in typeof size]: TextProps["style"] } = {
		xs: { paddingTop: 3, lineHeight: 12 },
		sm: { paddingTop: 4, lineHeight: 16 },
		md: { paddingTop: 4, lineHeight: 20 },
		lg: { paddingTop: 5, lineHeight: 23 },
		xl: { paddingTop: 5.5, lineHeight: 23 },
		"2xl": {},
		"3xl": {},
		"4xl": {},
		"5xl": {},
	}

	const sizeClassName: { [key in typeof size]: string } = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
		xl: "text-xl",
		"2xl": "text-2xl",
		"3xl": "text-3xl",
		"4xl": "text-4xl",
		"5xl": "text-5xl",
	}

	return (
		<TextRn
			style={[
				style,
				italic ? { fontFamily: "Helvetica-Italic" } : fontStyles[weight],
				weight !== "bold" && weight !== "light" ? sizeStyles[size] : {},
			]}
			className={`tracking-wide ${className} ${sizeClassName[size]} ${
				light ? "text-white" : "text-[#181C1E]"
			}`}
			{...props}
		>
			{children}
		</TextRn>
	)
}

export default styled(MainText)
