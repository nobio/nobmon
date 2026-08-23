import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { InfluxDBHandler } from './influxdb-handler.js';

export class InfluxDBHandler2 extends InfluxDBHandler {
  constructor() {
    super();
    this.INFLUXDB_CLOUD_ORGANIZATION = process.env.INFLUXDB2_CLOUD_ORGANIZATION;
    this.INFLUXDB_CLOUD_BUCKET = process.env.INFLUXDB2_CLOUD_BUCKET;
    this.INFLUXDB_CLOUD_TOKEN = process.env.INFLUXDB2_CLOUD_TOKEN;
    this.INFLUXDB_CLOUD_HOST = process.env.INFLUXDB2_CLOUD_HOST;
    this.SENDER_HOST = process.env.SENDER_HOST;

    console.log('------------------------------------------------');
    console.log('InfluxDB Handler initialized');
    console.log(`InfluxDB ORG=${this.INFLUXDB_CLOUD_ORGANIZATION}`);
    console.log(`InfluxDB BUCKET=${this.INFLUXDB_CLOUD_BUCKET}`);
    console.log(`InfluxDB INFLUX_URL=${this.INFLUXDB_CLOUD_HOST}`);
    console.log(`InfluxDB SENDER_HOST=${this.SENDER_HOST}`);

    if (!this.INFLUXDB_CLOUD_HOST || !this.INFLUXDB_CLOUD_TOKEN) {
      throw new Error('INFLUXDB_CLOUD_HOST and INFLUXDB_CLOUD_TOKEN environment variables are required.');
    }
    this.influxdb = new InfluxDB({ url: this.INFLUXDB_CLOUD_HOST, token: this.INFLUXDB_CLOUD_TOKEN });
  }

  /**
  * write data to influx database
  *
  * 'data' type:
  * {
  *    "name":"...",
  *    "topic":"bndw",
  *    "type":"int",
  *    "value":0.0281829833984375
  * }
  */
  send(data) {
    super.send(data);
  }
}