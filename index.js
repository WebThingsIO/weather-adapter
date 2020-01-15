'use strict';

const {Database} = require('gateway-addon');
const manifest = require('./manifest.json');
const WeatherAdapter = require('./lib/weather-adapter');

module.exports = (addonManager, _, errorCallback) => {
  const db = new Database(manifest.id);
  db.open().then(() => {
    return db.loadConfig();
  }).then((config) => {
    if (config.provider === 'openweathermap') {
      if (!(config.useDefaultOpenWeatherMapApiKey || config.apiKey)) {
        errorCallback(manifest.id, 'API key must be set!');
        return;
      }
    } else if (!config.apiKey) {
      errorCallback(manifest.id, 'API key must be set!');
      return;
    }

    if (!config.locations || config.locations.length === 0) {
      errorCallback(manifest.id, 'No locations configured.');
      return;
    }

    new WeatherAdapter(addonManager, config);
  }).catch((e) => {
    errorCallback(manifest.id, e);
  });
};
