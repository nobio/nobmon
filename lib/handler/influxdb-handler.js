/* eslint-disable no-prototype-builtins */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const ORG = process.env.INFLUXDB_CLOUD_ORGANIZATION;
const BUCKET = process.env.INFLUXDB_CLOUD_BUCKET;
const TOKEN = process.env.INFLUXDB_CLOUD_TOKEN;
const INFLUX_URL = process.env.INFLUXDB_CLOUD_HOST;
const SENDER_HOST = process.env.HOST || 'localhost';

export class InfluxDBHandler {
  constructor() {
    console.log('InfluxDB Handler initialized');
    console.log(`InfluxDB ORG=${ORG}`);
    console.log(`InfluxDB BUCKET=${BUCKET}`);
    console.log(`InfluxDB INFLUX_URL=${INFLUX_URL}`);
    console.log(`InfluxDB SENDER_HOST=${SENDER_HOST}`);

    if (!INFLUX_URL || !TOKEN) {
      throw new Error('INFLUXDB_CLOUD_HOST and INFLUXDB_CLOUD_TOKEN environment variables are required.');
    }
    this.influxdb = new InfluxDB({ url: INFLUX_URL, token: TOKEN });
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
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array.');
    }
    try {
      const writeApi = this.influxdb.getWriteApi(ORG, BUCKET);
      writeApi.useDefaultTags({ host: SENDER_HOST });

      data.forEach((point) => {
        if (!point.hasOwnProperty('name') || !point.hasOwnProperty('topic')
          || !point.hasOwnProperty('type') || !point.hasOwnProperty('value')) {
          console.warn('Skipping data point due to missing properties.');
          return;
        }

        // find the right type...
        let pointToWrite;
        if (point.type === 'int') {
          pointToWrite = new Point(point.topic).intField(point.name, point.value);
        } else if (point.type === 'float') {
          pointToWrite = new Point(point.topic).floatField(point.name, point.value);
        } else {
          console.warn(`Skipping data point due to unknown type: ${point.type}`);
          return;
        }

        writeApi.writePoint(pointToWrite);
      });

      writeApi.close().catch((e) => console.error(`Error while closing write API: ${e}`));

    } catch (error) {
      console.error(error);
      console.error('reinit influx');
      this.influxdb = new InfluxDB({ url: INFLUX_URL, token: TOKEN });
    }
  }
}
