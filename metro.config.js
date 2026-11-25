const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite carga su motor WebAssembly como un asset en la versión web.
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
