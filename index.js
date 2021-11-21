// configure from .env
require('dotenv').config();

const RaspiTempMonitor = require('./lib/raspitemp-monitor');
const FritzboxMonitor = require('./lib/fritz-monitor');
const VeitsbronnTempMonitor = require('./lib/veitsbronntemp-monitor');
const InfluxDBHandler = require('./lib/influxdb-handler');
const MQTTHander = require('./lib/mqtt-handler');

run = async () => {
    const influxDBHandler = new InfluxDBHandler();
    const mqttHandler = new MQTTHander();

    new FritzboxMonitor([influxDBHandler, mqttHandler]).run();
    new RaspiTempMonitor([influxDBHandler, mqttHandler]).run();
    new VeitsbronnTempMonitor([influxDBHandler, mqttHandler]).run();
};

run();