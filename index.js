// configure from .env
require('dotenv').config();

const RaspiTempMonitor = require('./lib/monitor/raspitemp-monitor');
const FritzboxMonitor = require('./lib/monitor/fritz-monitor');
const VeitsbronnWeatherMonitor = require('./lib/monitor/veitsbronn-weather-monitor');
const PingMonitor = require('./lib/monitor/ping-monitor');
const InfluxDBHandler = require('./lib/handler/influxdb-handler');
const MQTTHander = require('./lib/handler/mqtt-handler');
const NOPHander = require('./lib/handler/nop-handler');
const CPUMonitor = require('./lib/monitor/cpu-monitor');
const MemoryMonitor = require('./lib/monitor/mem-monitor');
const NMapMonitor = require('./lib/monitor/nmap-monitor');

run = async () => {
    const influxDBHandler = new InfluxDBHandler();
    const mqttHandler = new MQTTHander();
    //const mqttHandler = new NOPHander();

    console.table([
        ['FRITZBOX MONITOR', process.env.FRITZBOX_MONITOR],
        ['RASPITEMP MONITOR', process.env.RASPITEMP_MONITOR],
        ['VEITSBRONNWEATHER MONITOR', process.env.VEITSBRONNWEATHER_MONITOR],
        ['PING MONITOR', process.env.PING_MONITOR],
        ['CPU MONITOR', process.env.CPU_MONITOR],
        ['MEMORY MONITOR', process.env.MEMORY_MONITOR],
        ['NMAP MONITOR', process.env.NMAP_MONITOR],

    ]);

    if (process.env.FRITZBOX_MONITOR === 'true') new FritzboxMonitor([influxDBHandler, mqttHandler]).run();
    if (process.env.RASPITEMP_MONITOR === 'true') new RaspiTempMonitor([influxDBHandler, mqttHandler]).run();
    if (process.env.VEITSBRONNWEATHER_MONITOR === 'true') new VeitsbronnWeatherMonitor([influxDBHandler, mqttHandler]).run();
    if (process.env.PING_MONITOR === 'true') new PingMonitor([influxDBHandler, mqttHandler]).run();
    if (process.env.CPU_MONITOR === 'true') new CPUMonitor([influxDBHandler, mqttHandler]).run();
    if (process.env.MEMORY_MONITOR === 'true') new MemoryMonitor([influxDBHandler, mqttHandler]).run();
    if (process.env.NMAP_MONITOR === 'true') new NMapMonitor([influxDBHandler, mqttHandler]).run();
};

run();
