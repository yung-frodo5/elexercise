// Metro (React Native's bundler) needs explicit config to resolve packages
// from elsewhere in the monorepo (e.g. @exercise-tracker/shared-types),
// since by default it only looks in this app's own node_modules.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo, not just apps/mobile, so Metro picks up
//    changes made in packages/shared-types.
config.watchFolders = [workspaceRoot];

// 2. Let Metro resolve modules hoisted to the workspace root node_modules,
//    in addition to this app's own node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
