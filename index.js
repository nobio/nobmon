// configure from .env
require('dotenv').config();
const { InfluxDB } = require('@influxdata/influxdb-client')

const RaspiTempMonitor = require('./lib/raspitemp-monitor');
const FritzboxMonitor = require('./lib/fritz-monitor');

/**
 * connect to influx database; config see .env
 */
connectInfluxDB = async (data) => {

    // You can generate a Token from the "Tokens Tab" in the UI
    const token = process.env.INFLUXBD_CLOUD_TOKEN;
    const url = process.env.INFLUXBD_CLOUD_HOST

    return new InfluxDB({ url, token });
}


run = async () => {
    let influxdb = await connectInfluxDB();
    new RaspiTempMonitor(influxdb).run();
    new FritzboxMonitor(influxdb).run();

};

run();