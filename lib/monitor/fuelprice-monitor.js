/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import axios from 'axios';

const {
  FUEL_PRICE_DELAY,
  FUEL_PRICE_API_KEY,
  FUEL_PRICE_BASEURL,
  FUEL_PRICE_SEARCH_PARAMS,
} = process.env;

export class FuelPriceMonitor {
  constructor(handlers) {
    console.log('Fuel Price Monitor');
    this.handlers = handlers;
    this.delay = FUEL_PRICE_DELAY || 5; // delay in minutes
    this.fuelpriceSearchUrl = `${FUEL_PRICE_BASEURL}/list.php?apikey=${FUEL_PRICE_API_KEY}&${FUEL_PRICE_SEARCH_PARAMS}`;
    this.monitor();
  }

  run = async () => {
    setInterval(async () => { this.monitor(); }, this.delay * 60 * 1000);
  };

  async monitor() {
    try {
      // search for stations
      const respSearch = await axios.get(this.fuelpriceSearchUrl);
      if (!respSearch) return;
      if (!respSearch.status === 200) return;
      if (!respSearch.data) return;
      if (!respSearch.data.ok === true) return;

      for (const station of respSearch.data.stations) {
        this.monitorStation(station);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async monitorStation(station) {
    const data = [];

    // setup the data for the handler
    data.push({
      name: `${station.brand} (E5)`, topic: 'fuelprice', type: 'float', value: station.e5,
    });
    console.log(`${new Date().toLocaleString()} | monitoring ${station.brand} (E5) ${station.e5}€`);

    data.push({
      name: `${station.brand} (E10)`, topic: 'fuelprice', type: 'float', value: station.e10,
    });
    console.log(`${new Date().toLocaleString()} | monitoring ${station.brand} (E10) ${station.e10}€`);

    data.push({
      name: `${station.brand} (Diesel)`, topic: 'fuelprice', type: 'float', value: station.diesel,
    });
    console.log(`${new Date().toLocaleString()} | monitoring ${station.brand} (Diesel) ${station.diesel}€`);

    // send the data to all handlers
    this.handlers.forEach((handler) => { handler.send(data); });
  }
}
