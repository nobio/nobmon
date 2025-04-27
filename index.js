/* eslint-disable no-useless-concat */
/* eslint-disable no-console */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
// configure from .env
import 'dotenv/config';
import figlet from 'figlet';

import { RaspiTempMonitor } from './lib/monitor/raspitemp-monitor.js';
import { FritzboxMonitor } from './lib/monitor/fritz-monitor.js';
import { WeatherMonitor } from './lib/monitor/weather-monitor.js';
import { PingMonitor } from './lib/monitor/ping-monitor.js';
import { InfluxDBHandler } from './lib/handler/influxdb-handler.js';
import { MQTTHander } from './lib/handler/mqtt-handler.js';
import { NOPHander } from './lib/handler/nop-handler.js';
import { CPUMonitor } from './lib/monitor/cpu-monitor.js';
import { MemoryMonitor } from './lib/monitor/mem-monitor.js';
import { NMapMonitor } from './lib/monitor/nmap-monitor.js';
import { SmartPlugPowerMonitor } from './lib/monitor/smartplug-power-monitor.js';
import { FuelPriceMonitor } from './lib/monitor/fuelprice-monitor.js';

const {
  FRITZBOX_MONITOR,
  RASPITEMP_MONITOR,
  WEATHER_MONITOR,
  PING_MONITOR,
  CPU_MONITOR,
  MEMORY_MONITOR,
  NMAP_MONITOR,
  SMARTPLUG_MONITOR,
  INFLUXDB_ENABLED,
  MQTT_CLIENT_ENABLED,
  FUEL_PRICE_MONITOR,
} = process.env;

console.log(figlet.textSync('nobmon'));

const run = async () => {
  const handlers = [];
  if (INFLUXDB_ENABLED === 'true') {
    handlers.push(new InfluxDBHandler());
  }
  if (MQTT_CLIENT_ENABLED === 'true') {
    handlers.push(new MQTTHander());
  }
  // const mqttHandler = new NOPHander();

  console.table([
    ['FRITZBOX MONITOR', FRITZBOX_MONITOR, process.env.FRITZ_DELAY],
    ['RASPITEMP MONITOR', RASPITEMP_MONITOR, process.env.TEMP_DELAY],
    ['WEATHER MONITOR', WEATHER_MONITOR, process.env.OWM_DELAY],
    ['PING MONITOR', PING_MONITOR, process.env.PING_DELAY],
    ['CPU MONITOR', CPU_MONITOR, process.env.CPU_DELAY],
    ['MEMORY MONITOR', MEMORY_MONITOR, process.env.MEM_DELAY],
    ['NMAP MONITOR', NMAP_MONITOR, process.env.NMAP_DELAY],
    ['SMARTPLUG POWER MONITOR', SMARTPLUG_MONITOR, process.env.SMARTPLUG_DELAY],
    ['FUEL_PRICE_MONITOR', FUEL_PRICE_MONITOR, process.env.FUEL_PRICE_DELAY],
  ]);

  if (FRITZBOX_MONITOR === 'true') new FritzboxMonitor(handlers).run();
  if (RASPITEMP_MONITOR === 'true') new RaspiTempMonitor(handlers).run();
  if (WEATHER_MONITOR === 'true') new WeatherMonitor(handlers).run();
  if (PING_MONITOR === 'true') new PingMonitor(handlers).run();
  if (CPU_MONITOR === 'true') new CPUMonitor(handlers).run();
  if (MEMORY_MONITOR === 'true') new MemoryMonitor(handlers).run();
  if (NMAP_MONITOR === 'true') new NMapMonitor(handlers).run();
  if (SMARTPLUG_MONITOR === 'true') new SmartPlugPowerMonitor(handlers).run();
  if (FUEL_PRICE_MONITOR === 'true') new FuelPriceMonitor(handlers).run();
};

run();
