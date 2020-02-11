class Provider {
  constructor(location, units, apiKey) {
    this.location = location;
    this.units = units;
    this.apiKey = apiKey;
  }

  poll() {
    return Promise.resolve();
  }

  externalUrl() {
    return null;
  }

  temperature() {
    return null;
  }

  feelsLike() {
    return null;
  }

  pressure() {
    return null;
  }

  humidity() {
    return null;
  }

  cloudCover() {
    return null;
  }

  windSpeed() {
    return null;
  }

  windDirection() {
    return null;
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

module.exports = Provider;
