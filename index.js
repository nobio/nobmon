// configure from .env
require('dotenv').config();

const RaspiTempMonitor = require('./lib/monitor/raspitemp-monitor');
const FritzboxMonitor = require('./lib/monitor/fritz-monitor');
const VeitsbronnWeatherMonitor = require('./lib/monitor/veitsbronn-weather-monitor');
const PingMonitor = require('./lib/monitor/ping-monitor');
const InfluxDBHandler = require('./lib/handler/influxdb-handler');
const MQTTHander = require('./lib/handler/mqtt-handler');
const CPUMonitor = require('./lib/monitor/cpu-monitor');
const MemoryMonitor = require('./lib/monitor/mem-monitor');

run = async () => {
    const influxDBHandler = new InfluxDBHandler();
    const mqttHandler = new MQTTHander();

    new FritzboxMonitor([influxDBHandler, mqttHandler]).run();
    new RaspiTempMonitor([influxDBHandler, mqttHandler]).run();
    new VeitsbronnWeatherMonitor([influxDBHandler, mqttHandler]).run();
    new PingMonitor([influxDBHandler, mqttHandler]).run();
    new CPUMonitor([influxDBHandler, mqttHandler]).run();
    new MemoryMonitor([influxDBHandler, mqttHandler]).run();
};

run();