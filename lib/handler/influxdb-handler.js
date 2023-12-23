/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
/* eslint-disable no-prototype-builtins */
/* eslint-disable import/no-unresolved */
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const {
  INFLUXDB_CLOUD_ORGANIZATION,
  INFLUXDB_CLOUD_BUCKET,
  INFLUXDB_CLOUD_TOKEN,
  INFLUXDB_CLOUD_HOST,
  SENDER_HOST,
} = process.env;

export class InfluxDBHandler {
  constructor() {
    console.log('InfluxDB Handler initialized');
    console.log(`InfluxDB ORG=${INFLUXDB_CLOUD_ORGANIZATION}`);
    console.log(`InfluxDB BUCKET=${INFLUXDB_CLOUD_BUCKET}`);
    console.log(`InfluxDB INFLUX_URL=${INFLUXDB_CLOUD_HOST}`);
    console.log(`InfluxDB SENDER_HOST=${SENDER_HOST}`);

    if (!INFLUXDB_CLOUD_HOST || !INFLUXDB_CLOUD_TOKEN) {
      throw new Error('INFLUXDB_CLOUD_HOST and INFLUXDB_CLOUD_TOKEN environment variables are required.');
    }
    this.influxdb = new InfluxDB({ url: INFLUXDB_CLOUD_HOST, token: INFLUXDB_CLOUD_TOKEN });
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
      const writeApi = this.influxdb.getWriteApi(INFLUXDB_CLOUD_ORGANIZATION, INFLUXDB_CLOUD_BUCKET);
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

      // writeApi.close().catch((e) => console.error(`Error while closing write API: ${e}`));
      writeApi.close();
    } catch (error) {
      console.error(error);
      console.error('reinit influx');
      this.influxdb = new InfluxDB({ url: INFLUXDB_CLOUD_HOST, token: INFLUXDB_CLOUD_TOKEN });
    }
  }
}
