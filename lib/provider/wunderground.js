// eslint-disable-next-line max-len
// API docs: https://docs.google.com/document/d/1eKCnKXI9xnoMGRRzOL1xPCBihNV2rOet08qpE_gArAY/edit

const Provider = require('./provider');
const fetch = require('node-fetch');

const BASE_URL = 'https://api.weather.com';

class WeatherUndergroundProvider extends Provider {
  constructor(location, units, apiKey) {
    super(location, units, apiKey);

    this.stationIds = [];
    this.apiUnit = units === 'imperial' ? 'e' : 'm';
    this.dataUnit = units;
    this.data = null;
  }

  async poll() {
    if (this.stationIds.length === 0) {
      const searchUrl = `${BASE_URL}/v3/location/near?` +
        `geocode=${this.location.latitude},${this.location.longitude}&` +
        `product=pws&format=json&apiKey=${this.apiKey}`;

      await fetch(searchUrl).then((res) => {
        return res.json();
      }).then((body) => {
        if (body.location && body.location.stationId &&
            body.location.stationId.length > 0) {
          this.stationIds = body.location.stationId;
        } else {
          throw new Error('Location not found');
        }
      });
    }

    this.data = null;
    for (const stationId of this.stationIds) {
      try {
        const url = `${BASE_URL}/v2/pws/observations/current?` +
          `stationId=${stationId}&format=json&units=${this.apiUnit}&` +
          `apiKey=${this.apiKey}`;

        const data = await fetch(url).then((res) => {
          return res.json();
        }).then((body) => {
          return body.observations[0];
        });

        if (data) {
          this.data = data;
          break;
        }
      } catch (e) {
        console.debug(`Failed to fetch observations for ${stationId}: ${e}`);
      }
    }
  }

  externalUrl() {
    return `https://www.wunderground.com/weather/${
      this.location.latitude},${this.location.longitude}`;
  }

  temperature() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data[this.dataUnit].temp);
  }

  feelsLike() {
    const temperature = this.temperature();
    if (temperature === null) {
      return null;
    }

    let heatIndexTemp, windChillTemp;

    if (this.units === 'metric') {
      heatIndexTemp = 21.1;
      windChillTemp = 16.1;
    } else {
      heatIndexTemp = 70;
      windChillTemp = 61;
    }

    if (temperature <= windChillTemp) {
      return Math.round(this.data[this.dataUnit].windChill);
    } else if (temperature >= heatIndexTemp) {
      return Math.round(this.data[this.dataUnit].heatIndex);
    } else {
      return temperature;
    }
  }

  pressure() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data[this.dataUnit].pressure);
  }

  humidity() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.humidity);
  }

  cloudCover() {
    return null;
  }

  windSpeed() {
    if (!this.data) {
      return null;
    }

    let value = Math.round(this.data[this.dataUnit].windSpeed);

    // If metric, convert from km/h to m/s.
    if (this.units === 'metric') {
      value *= 1000 / (60 * 60);
    }

    return value;
  }

  windDirection() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.winddir);
  }

  description() {
    return null;
  }

  raining() {
    return null;
  }

  snowing() {
    return null;
  }
}

module.exports = WeatherUndergroundProvider;
