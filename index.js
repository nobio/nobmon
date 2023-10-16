/* eslint-disable no-unused-vars */
// configure from .env
import 'dotenv/config'

import { RaspiTempMonitor } from './lib/monitor/raspitemp-monitor.js';
import { FritzboxMonitor } from './lib/monitor/fritz-monitor.js';
import { VeitsbronnWeatherMonitor } from './lib/monitor/veitsbronn-weather-monitor.js';
import { PingMonitor } from './lib/monitor/ping-monitor.js';
import { InfluxDBHandler } from './lib/handler/influxdb-handler.js';
import { MQTTHander } from './lib/handler/mqtt-handler.js';
import { NOPHander } from './lib/handler/nop-handler.js';
import { CPUMonitor } from './lib/monitor/cpu-monitor.js';
import { MemoryMonitor } from './lib/monitor/mem-monitor.js';
import { NMapMonitor } from './lib/monitor/nmap-monitor.js';
import { SmartPlugPowerMonitor } from './lib/monitor/smartplug-power-monitor.js';

printMyTag();

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

function printMyTag() {
  console.log(
    "               _      _        " + '\n' +
    "              | |    (_)       " + '\n' +
    " _ __    ___  | |__   _   ___  " + '\n' +
    "| '_ \\  / _ \\ | '_ \\ | | / _ \\ " + '\n' +
    "| | | || (_) || |_) || || (_) |" + '\n' +
    "|_| |_| \\___/ |_.__/ |_| \\___/ ") + '\n\n'

};
