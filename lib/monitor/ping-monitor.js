//import Ping from 'ping'; const { ping } = Ping;
import ping from 'ping';

export class PingMonitor {

  constructor(handlers) {
    console.log('Ping Monitor');
    this.handlers = handlers;
    this.delay = process.env.PING_DELAY || 1;
    this.hosts = process.env.PING_HOST.split(', ');
    this.monitor();
  }

  run = async () => {
    setInterval(async () => {
      try {
        // console.log(`${new Date().toISOString()} -> monitor`);
        this.monitor();
      } catch (error) {
        console.error(error);
      }
    }, this.delay * 1000);
  };

  async monitor() {
    try {
      this.hosts.forEach(host => {
        ping.promise.probe(host)
          .then(resp => {
            if (!resp) return;
            if (!resp.time) return;
            if (resp.time == 'unknown') return;

            const latency = resp.time;
            const data = [{ name: 'ping-' + host, topic: 'latency', type: 'float', value: latency }];

            console.log(`${new Date().toLocaleString()} | monitoring Ping latency ${latency}ms to host ${host}`);

            this.handlers.forEach(handler => {
              handler.send(data);
            });
          })
          .catch(err => { console.error(err) });

      });
    } catch (error) {
      console.error(error);
    }
  }

}
