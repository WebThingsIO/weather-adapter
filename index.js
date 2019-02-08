'use strict';

const WeatherAdapter = require('./lib/weather-adapter');

module.exports = (addonManager, manifest, errorCallback) => {
  const config = manifest.moziot.config;

  if (!config.apiKey) {
    errorCallback(manifest.name, 'API key must be set!');
    return;
  }

  if (!config.locations || config.locations.length === 0) {
    errorCallback(manifest.name, 'No locations configured.');
    return;
  }

  new WeatherAdapter(addonManager, manifest);
};
