/**
 * Weather adapter.
 */
'use strict';

const {Adapter} = require('gateway-addon');
const manifest = require('../manifest.json');
const WeatherDevice = require('./weather-device');

const DEFAULT_OWM_API_KEY = '2bc03e37c3bac538da91803f1a4c2a3b';

/**
 * Adapter for weather devices.
 */
class WeatherAdapter extends Adapter {
  /**
   * Initialize the object.
   *
   * @param {Object} addonManager - AddonManagerProxy object
   * @param {Object} config - Configured options
   */
  constructor(addonManager, config) {
    super(addonManager, manifest.id, manifest.id);
    addonManager.addAdapter(this);

    this.knownLocations = new Set();
    this.config = config;

    this.startPairing();
  }

  /**
   * Attempt to add any configured locations.
   */
  startPairing() {
    for (const location of this.config.locations) {
      if (this.knownLocations.has(location)) {
        continue;
      }

      this.knownLocations.add(location);

      // If using the default OpenWeatherMap API key, set it and cap the poll
      // interval at one hour.
      if (this.config.provider === 'openweathermap' &&
          this.config.useDefaultOpenWeatherMapApiKey) {
        this.config.apiKey = DEFAULT_OWM_API_KEY;
        this.config.pollInterval = Math.max(this.config.pollInterval, 60);
      }

      const dev = new WeatherDevice(
        this,
        location,
        this.config.units,
        this.config.provider,
        this.config.apiKey,
        this.config.pollInterval
      );
      dev.promise.then(() => this.handleDeviceAdded(dev));
    }
  }

  /**
   * Remove a device from this adapter.
   *
   * @param {Object} device - The device to remove
   * @returns {Promise} Promise which resolves to the removed device.
   */
  removeThing(device) {
    this.knownLocations.delete(device.location);
    if (this.devices.hasOwnProperty(device.id)) {
      this.handleDeviceRemoved(device);
    }

    return Promise.resolve(device);
  }
}

module.exports = WeatherAdapter;
