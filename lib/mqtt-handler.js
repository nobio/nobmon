const mqtt = require('mqtt');

const mqtt_uri = process.env.MQTT_URI;
const mqtt_user = process.env.MQTT_USER;
const mqtt_password = process.env.MQTT_PASSWORD;

class MQTTHander {
  constructor() {
    // connect to mqtt server
    const options = {
      clientId: 'nobmon_' + Math.random().toString(16).substr(2, 8),
      keepalive: 60,
      username: mqtt_user,
      password: mqtt_password,
    };
    console.log(`connecting to mqtt host ${mqtt_uri}...`);
    this.mqttClient = mqtt.connect(mqtt_uri);
    console.log(`...connecting to mqtt done`);
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
    if (!this.mqttClient.connected) { console.log(`connecting to mqtt host ${mqtt_uri}...`); return; }

    data.forEach(d => {
      //console.log(`mqtt: ${JSON.stringify(d.topic)}`)
      this.mqttClient.publish(`nobmon/${d.topic}/${d.name}`, JSON.stringify(d));
    });

  }
}

module.exports = MQTTHander;
