/**
 * Weather adapter.
 */
'use strict';

const {Adapter} = require('gateway-addon');
const WeatherDevice = require('./weather-device');

/**
 * Adapter for weather devices.
 */
class WeatherAdapter extends Adapter {
  /**
   * Initialize the object.
   *
   * @param {Object} addonManager - AddonManagerProxy object
   * @param {Object} manifest - Package manifest
   */
  constructor(addonManager, manifest) {
    super(addonManager, manifest.name, manifest.name);
    addonManager.addAdapter(this);

    this.knownLocations = new Set();
    this.config = manifest.moziot.config;

    this.addLocations();
  }

  /**
   * Attempt to add any configured locations.
   */
  addLocations() {
    for (const location of this.config.locations) {
      if (this.knownLocations.has(location)) {
        continue;
      }

      this.knownLocations.add(location);

      const dev = new WeatherDevice(
        this,
        location,
        this.config.units,
        this.config.provider,
        this.config.apiKey,
        this.config.pollInterval
      );
      this.handleDeviceAdded(dev);
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
