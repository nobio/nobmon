const mqtt = require('mqtt');

class MQTTHander {
  // optional parameters; easy to test this way
  constructor(mqttUri = process.env.MQTT_URI, mqttUser = process.env.MQTT_USER, mqttPassword = process.env.MQTT_PASSWORD) {
    this.mqttUri = mqttUri;
    this.mqttUser = mqttUser;
    this.mqttPassword = mqttPassword;
    this.connectToMqttServer();
  }

  connectToMqttServer() {
    const options = {
      clientId: `nobmon_${Math.random().toString(16).substr(2, 8)}`,
      keepalive: 60,
      username: this.mqttUser,
      password: this.mqttPassword,
    };
    console.log(`Connecting to MQTT host ${this.mqttUri}...`);
    this.mqttClient = mqtt.connect(this.mqttUri, options);
    this.mqttClient.on('error', error => {
      console.error(`Error connecting to MQTT host: ${error}`);
    });
    this.mqttClient.on('connect', () => {
      console.log(`Connection to MQTT host ${this.mqttUri} successful!`);
    });
    this.mqttClient.on('offline', () => {
      console.warn(`MQTT client is offline. Attempting to reconnect...`);
      this.connectToMqttServer();
    });
  }

  send(data) {
    if (!this.mqttClient.connected) {
      console.warn(`Sorry, not connected to MQTT host ${this.mqttUri}. I try to reconnect...`);
      this.connectToMqttServer();
      return;
    }

    data.forEach(d => {
      this.mqttClient.publish(`nobmon/${d.topic}/${d.name}`, JSON.stringify(d));
    });
  }
}

module.exports = MQTTHander;
