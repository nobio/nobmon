/* eslint-disable no-unused-vars */
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
const SmartPlugPowerMonitor = require('./lib/monitor/smartplug-power-monitor');

const run = async () => {
  const handlers = [];
  if (process.env.INFLUXDB_ENABLED === 'true') {
    handlers.push(new InfluxDBHandler());
  }
  if (process.env.MQTT_CLIENT_ENABLED === 'true') {
    handlers.push(new MQTTHander());
  }
  // const mqttHandler = new NOPHander();

  console.table([
    ['FRITZBOX MONITOR', process.env.FRITZBOX_MONITOR],
    ['RASPITEMP MONITOR', process.env.RASPITEMP_MONITOR],
    ['VEITSBRONNWEATHER MONITOR', process.env.VEITSBRONNWEATHER_MONITOR],
    ['PING MONITOR', process.env.PING_MONITOR],
    ['CPU MONITOR', process.env.CPU_MONITOR],
    ['MEMORY MONITOR', process.env.MEMORY_MONITOR],
    ['NMAP MONITOR', process.env.NMAP_MONITOR],
    ['SMARTPLUG POWER MONITOR', process.env.SMARTPLUG_MONITOR],
  ]);

  if (process.env.FRITZBOX_MONITOR === 'true') new FritzboxMonitor(handlers).run();
  if (process.env.RASPITEMP_MONITOR === 'true') new RaspiTempMonitor(handlers).run();
  if (process.env.VEITSBRONNWEATHER_MONITOR === 'true') new VeitsbronnWeatherMonitor(handlers).run();
  if (process.env.PING_MONITOR === 'true') new PingMonitor(handlers).run();
  if (process.env.CPU_MONITOR === 'true') new CPUMonitor(handlers).run();
  if (process.env.MEMORY_MONITOR === 'true') new MemoryMonitor(handlers).run();
  if (process.env.NMAP_MONITOR === 'true') new NMapMonitor(handlers).run();
  if (process.env.SMARTPLUG_MONITOR === 'true') new SmartPlugPowerMonitor(handlers).run();
};

run();
