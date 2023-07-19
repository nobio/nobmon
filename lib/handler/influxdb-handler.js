/* eslint-disable no-console */
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const org = process.env.INFLUXBD_CLOUD_ORGANIZATION;
const bucket = process.env.INFLUXBD_CLOUD_BUCKET;
const token = process.env.INFLUXBD_CLOUD_TOKEN;
const url = process.env.INFLUXBD_CLOUD_HOST;
const host = process.env.HOST || 'localhost';

class InfluxDBHandler {
  constructor() {
    if (!url || !token) {
      throw new Error("INFLUXBD_CLOUD_HOST and INFLUXBD_CLOUD_TOKEN environment variables are required.");
    }
    this.influxdb = new InfluxDB({ url, token });
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
      throw new Error("Data must be an array.");
    }

    const writeApi = this.influxdb.getWriteApi(org, bucket);
    writeApi.useDefaultTags({ host });

    data.forEach((point) => {
      if (!point.hasOwnProperty('name') || !point.hasOwnProperty('topic') ||
          !point.hasOwnProperty('type') || !point.hasOwnProperty('value')) {
        console.warn("Skipping data point due to missing properties.");
        return;
      }

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

    writeApi.close()
      .catch((e) => {
        console.error(`Error while closing write API: ${e}`);
      });
  }
}

module.exports = InfluxDBHandler;
