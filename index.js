// configure from .env
require('dotenv').config();

const RaspiTempMonitor = require('./lib/monitor/raspitemp-monitor');
const FritzboxMonitor = require('./lib/monitor/fritz-monitor');
const VeitsbronnTempMonitor = require('./lib/monitor/veitsbronntemp-monitor');
const PingMonitor = require('./lib/monitor/ping-monitor');
const InfluxDBHandler = require('./lib/handler/influxdb-handler');
const MQTTHander = require('./lib/handler/mqtt-handler');

run = async () => {
    const influxDBHandler = new InfluxDBHandler();
    const mqttHandler = new MQTTHander();

    new FritzboxMonitor([influxDBHandler, mqttHandler]).run();
    new RaspiTempMonitor([influxDBHandler, mqttHandler]).run();
    new VeitsbronnTempMonitor([influxDBHandler, mqttHandler]).run();
    new PingMonitor([influxDBHandler, mqttHandler]).run();
};

run();