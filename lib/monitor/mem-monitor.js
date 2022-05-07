const { execSync } = require('child_process');

class MemoryMonitor {

  constructor(handlers) {
    console.log('MEM Monitoring');
    this.handlers = handlers;
    this.platform = process.platform;
    this.delay = process.env.MEM_DELAY || 5;
    this.monitor();
  }

  run = async () => {
    setInterval(async () => {
      try {
        this.monitor();
      } catch (error) {
        console.error(error);
      }
    }, this.delay * 1000);
  };

  mem = async () => {
    let mem;

    // exec command
    try {
      // prepare cli command depending on platform
      const cmd = this.command();
      console.log(cmd);
      const cli = execSync(cmd);
      console.log(cli.toString('UTF8'));

      // evaluate cli response depending on platform
      mem = this.evaluate(cli);

    } catch (error) {
      console.error(error)
    }
    // return cpu values
    return mem;
  }



  command() {
    let cmd;
    if (this.platform == 'darwin') {
      cmd = 'echo "Mem:     4025200640   262012928   625967104   217255936  3137220608  3394392064      "';
      // purged:                   9194.96 Mi
    } else if (this.platform == 'linux') {
      cmd = 'free -b | grep Mem';
      // Mem:     4025200640   262377472   663945216   216817664  3098877952  3394469888
      //              |            |            |           |         |
      //            total        used         free       shared   buff/cache   available
      // Einheit: Byte (/1024 = MB)
    }
    //console.log(cmd);
    return cmd;
  }

  evaluate(cli) {
    let mem;

    if (this.platform == 'darwin') {
      // not implemented yet because I don't know how to calculate; there is no free command
      mem = {
        total: 16,
        used: 3,
      };
    } else if (this.platform == 'linux') {
      /*
      4025200640
       262012928
       625967104
       217255936
      3394392064
        Example:
          Mem:     4025200640   262012928   625967104   217255936  3137220608  3394392064
                      |            |            |           |         |
                    total        used         free       shared   buff/cache   available

      */
      // parse this one: "CPU usage: 6.59% user, 24.17% sys, 69.23% idle"
      const mems = cli.toString('UTF8').split('   ');
      const memTotal = mems[1].trim() / 1024 / 1000;
      const memUsed = mems[2].trim() / 1024 / 1000;

      mem = {
        total: memTotal,
        used: memUsed,
      };
    }
    return mem;
  }

  async monitor() {
    const mem = await this.mem();
    console.log(`${new Date().toLocaleString()} | monitoring mem: total ${mem.total}MB used ${mem.used}MB`);

    const data = [];
    data.push({ name: 'mem-total', topic: 'memory', type: 'int', value: mem.total });
    data.push({ name: 'mem-used', topic: 'memory', type: 'int', value: mem.used });

    this.handlers.forEach(handler => {
      handler.send(data);
    });
  }
}
module.exports = MemoryMonitor;
