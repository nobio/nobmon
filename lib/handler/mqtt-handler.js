/* eslint-disable no-console */
const mqtt = require('mqtt');

const mqttUri = process.env.MQTT_URI;
const mqttUser = process.env.MQTT_USER;
const mqttPassword = process.env.MQTT_PASSWORD;

class MQTTHander {
  constructor() {
    // connect to mqtt server
    const options = {
      clientId: `nobmon_${Math.random().toString(16).substr(2, 8)}`,
      keepalive: 60,
      username: mqttUser,
      password: mqttPassword,
    };
    console.log(`connecting to mqtt host ${mqttUri}...`);
    // console.log(options);
    this.mqttClient = mqtt.connect(mqttUri, options); console.log(this.mqttClient.connected);
    this.mqttClient.on('error', (error) => { console.error(error); });
    console.log(`connecting to mqtt host ${mqttUri} DONE! (connected: ${this.mqttClient.connected})`);
  }

  /**
  * send data to mqtt server
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
    if (!this.mqttClient.connected) { console.log(`sorry, not connected to mqtt host ${mqttUri}...`); return; }

    data.forEach((d) => {
      // console.log(`mqtt: ${JSON.stringify(d)}`)
      this.mqttClient.publish(`nobmon/${d.topic}/${d.name}`, JSON.stringify(d));
    });
  }
}

module.exports = MQTTHander;
