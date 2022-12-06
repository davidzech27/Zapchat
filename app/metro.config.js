const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const appRoot = __dirname
const repoRoot = path.resolve(appRoot, "..")

const config = getDefaultConfig(appRoot)

config.watchFolders = [repoRoot]

config.resolver.nodeModulesPaths = [
	path.resolve(appRoot, "node_modules"),
	path.resolve(repoRoot, "node_modules"),
]

config.resolver.disableHierarchicalLookup = false // not recommended by documentation, but only works when false

module.exports = config
