import { execSync } from 'child_process';

export class MemoryMonitor {

  constructor(handlers) {
    console.log('MEM Monitoring');
    this.handlers = handlers;
    this.platform = process.platform;
    this.delay = process.env.MEM_DELAY || 5;
    this.monitor();
  }

  /** implemented interface; will be called from main thread */
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
      //console.log(cmd);
      const cli = execSync(cmd);
      //console.log(cli.toString('UTF8'));

      // evaluate cli response depending on platform
      mem = this.evaluate(cli);
      //console.log(mem);

    } catch (error) {
      console.error(error)
    }
    // return cpu values
    return mem;
  }



  command() {
    let cmd;

    if (this.platform == 'darwin') {
      cmd = `echo '4025200640|196775936'`
    } else if (this.platform == 'linux') {
      cmd = `free -b | grep Mem | awk -F ' ' '{print $2 "|" $3}'`;
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
      // 4025200640|196775936
      //     |            |
      //   total        used
      // Einheit: Byte (/1024/1000 = MB)
      */
      const mems = cli.toString('UTF8').split('|');
      const memTotal = mems[0].trim() / 1024 / 1000;
      const memUsed = mems[1].trim() / 1024 / 1000;

      mem = {
        total: memTotal,
        used: memUsed,
      };
    }
    return mem;
  }

  async monitor() {
    const memory = await this.mem();
    console.log(`${new Date().toLocaleString()} | monitoring mem: total ${memory.total}MB used ${memory.used}MB`);

    const data = [];
    data.push({ name: 'mem-total', topic: 'memory', type: 'int', value: memory.total });
    data.push({ name: 'mem-used', topic: 'memory', type: 'int', value: memory.used });

    this.handlers.forEach(handler => {
      handler.send(data);
    });
  }
}
