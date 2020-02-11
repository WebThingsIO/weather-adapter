/**
 * Weather device type.
 */
'use strict';

const AccuWeatherProvider = require('./provider/accuweather');
const crypto = require('crypto');
const DarkSkyProvider = require('./provider/darksky');
const {Device} = require('gateway-addon');
const OpenWeatherMapProvider = require('./provider/openweathermap');
const WeatherProperty = require('./weather-property');

/**
 * Weather device type.
 */
class WeatherDevice extends Device {
  /**
   * Initialize the object.
   *
   * @param {Object} adapter - WeatherAdapter instance
   * @param {string} location - Configured location
   * @param {string} units - Configured unites
   * @param {string} provider - Configured provider
   * @param {string} apiKey - Configured API key
   * @param {number} pollInterval - Interval at which to poll provider
   */
  constructor(adapter, location, units, provider, apiKey, pollInterval) {
    const shasum = crypto.createHash('sha1');
    shasum.update(location.name);
    super(adapter, `weather-${shasum.digest('hex')}`);

    this.location = location;
    this.units = units;
    this.apiKey = apiKey;
    this.pollInterval = pollInterval * 60 * 1000;

    this.name = this.description = `Weather (${location.name})`;
    this['@context'] = 'https://iot.mozilla.org/schemas';
    this['@type'] = ['TemperatureSensor', 'MultiLevelSensor'];

    switch (provider) {
      case 'openweathermap':
        this.provider = new OpenWeatherMapProvider(location, units, apiKey);
        break;
      case 'darksky':
        this.provider = new DarkSkyProvider(location, units, apiKey);
        break;
      case 'accuweather':
        this.provider = new AccuWeatherProvider(location, units, apiKey);
        break;
    }

    this.properties.set(
      'temperature',
      new WeatherProperty(
        this,
        'temperature',
        {
          label: 'Temperature',
          '@type': 'TemperatureProperty',
          type: 'integer',
          unit: units === 'imperial' ? 'degree fahrenheit' : 'degree celsius',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'feelsLike',
      new WeatherProperty(
        this,
        'feelsLike',
        {
          label: 'Feels Like',
          type: 'integer',
          unit: units === 'imperial' ? 'degree fahrenheit' : 'degree celsius',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'humidity',
      new WeatherProperty(
        this,
        'humidity',
        {
          label: 'Humidity',
          '@type': 'LevelProperty',
          type: 'integer',
          unit: 'percent',
          minimum: 0,
          maximum: 100,
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'cloudCover',
      new WeatherProperty(
        this,
        'cloudCover',
        {
          label: 'Cloud Cover',
          '@type': 'LevelProperty',
          type: 'integer',
          unit: 'percent',
          minimum: 0,
          maximum: 100,
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'pressure',
      new WeatherProperty(
        this,
        'pressure',
        {
          label: 'Atmospheric Pressure',
          type: 'integer',
          unit: 'hPa',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'windSpeed',
      new WeatherProperty(
        this,
        'windSpeed',
        {
          label: 'Wind Speed',
          type: 'integer',
          unit: units === 'imperial' ? 'mph' : 'm/s',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'windDirection',
      new WeatherProperty(
        this,
        'windDirection',
        {
          label: 'Wind Direction',
          type: 'integer',
          unit: '°',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'description',
      new WeatherProperty(
        this,
        'description',
        {
          label: 'Weather',
          type: 'string',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'raining',
      new WeatherProperty(
        this,
        'raining',
        {
          label: 'Raining',
          type: 'boolean',
          readOnly: true,
        },
        null
      )
    );

    this.properties.set(
      'snowing',
      new WeatherProperty(
        this,
        'snowing',
        {
          label: 'Snowing',
          type: 'boolean',
          readOnly: true,
        },
        null
      )
    );

    this.promise = this.poll().then(() => {
      this.links = [
        {
          rel: 'alternate',
          mediaType: 'text/html',
          href: this.provider.externalUrl(),
        },
      ];
    });
  }

  /**
   * Update the weather data.
   */
  poll() {
    const promise = this.provider.poll().then(() => {
      const properties = [
        'temperature',
        'feelsLike',
        'pressure',
        'humidity',
        'windSpeed',
        'windDirection',
        'description',
        'raining',
        'snowing',
        'cloudCover',
      ];
      for (const property of properties) {
        const value = this.provider[property]();
        const prop = this.properties.get(property);

        if (prop.value !== value) {
          prop.setCachedValue(value);
          this.notifyPropertyChanged(prop);
        }
      }
    }).catch((e) => {
      console.error('Failed to poll weather provider:', e);
    });

    setTimeout(this.poll.bind(this), this.pollInterval);
    return promise;
  }
}

module.exports = WeatherDevice;
