import { TRPC } from "./trpc"
import { App } from "@serverless-stack/resources"

export default function (app: App) {
	app.setDefaultFunctionProps({
		runtime: "nodejs16.x",
		srcPath: "trpc",
		bundle: {
			format: "esm",
		},
	})
	app.stack(TRPC)
}
