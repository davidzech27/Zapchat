const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const appRoot = __dirname
const repoRoot = path.resolve(appRoot, "..")

const config = getDefaultConfig(appRoot)

config.resolver.sourceExts.push("cjs")

config.watchFolders = [repoRoot]

config.resolver.nodeModulesPaths = [
	path.resolve(appRoot, "node_modules"),
	path.resolve(repoRoot, "node_modules"),
]

config.resolver.disableHierarchicalLookup = true // if error about modules not being found, try setting to false

module.exports = config
