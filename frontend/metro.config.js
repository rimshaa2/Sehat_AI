const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.maxWorkers = 1; // Only 1 worker to save RAM
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      reduce_funcs: false,
    },
  },
};

module.exports = config;