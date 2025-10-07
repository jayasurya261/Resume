const path = require("path");

module.exports = function override(config) {
  // Add fallback for Node core modules (Webpack 5+)
  config.resolve.fallback = {
    ...config.resolve.fallback,
    path: require.resolve("path-browserify"),
  };
  return config;
};
