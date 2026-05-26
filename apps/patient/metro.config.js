const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { FileStore } = require('metro-cache');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Give this app its own Metro cache dir. Without this, every Expo app in the
// monorepo shares the default cache under $TMPDIR, so running two apps at once
// (e.g. `pnpm dev`) makes their bundles collide — one port ends up serving
// another app's bundle with styles missing, and the bad cache persists until
// it's manually cleared.
config.cacheStores = [
  new FileStore({ root: path.join(projectRoot, 'node_modules', '.cache', 'metro') }),
];

module.exports = withNativeWind(config, { input: './src/global.css' });
