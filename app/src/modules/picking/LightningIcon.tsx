import type { FC } from "react"
import { View } from "react-native"
import { Svg, Rect, G, Path } from "react-native-svg"

const LightningIcon: FC = () => {
	return (
		<View className="w-full flex-1 rotate-[-2.5deg]">
			<View className="absolute">
				<View className="bottom-[51px] right-[103.75px]">
					<Svg width="800" height="800" viewBox="0 0 6350 6350">
						<G transform="matrix(1.1135 -0.1289 0.1289 1.1135 502.7736 471.1327)">
							<Path
								stroke="rgb(255,255,255)"
								strokeWidth={3}
								strokeLinecap="butt"
								strokeDashoffset={0}
								strokeLinejoin="round"
								strokeMiterlimit={4}
								fill="rgb(255,255,255)"
								fillRule="nonzero"
								opacity={1}
								vectorEffect="non-scaling-stroke"
								d="m 160 224 l 64 48 l -96 80 l 224 -64 l -64 -48 l 96 -80 z"
								stroke-linecap="round"
							/>
						</G>
					</Svg>
				</View>
			</View>
		</View>
	)
}

export default LightningIcon
