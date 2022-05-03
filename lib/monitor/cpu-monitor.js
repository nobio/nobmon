const { execSync } = require('child_process');
const { default: cluster } = require('cluster');

class CPUMonitor {
  cpuLastSum = 0
  cpuLastIdle = 0;
  isFritzboxConnecting = false;

  constructor(handlers) {
    console.log('CPU Monitoring');
    this.handlers = handlers;
    this.platform = process.platform;
    this.delay = process.env.CPU_DELAY || 5;
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

  /**
   * cat /sys/class/thermal/thermal_zone0/temp && vcgencmd measure_temp
   *  -> 52582 (milli Grad)
   * sysctl -a | grep cpu_thermal_level
   *  -> machdep.xcpm.cpu_thermal_level: 61
   */
  cpu = async () => {
    let cpu;

    // exec command
    try {
      // prepare cli command depending on platform
      const cmd = this.getCommand();
      const cli = execSync(cmd);
      //console.log(cli.toString('UTF8'));

      // evaluate cli response depending on platform
      cpu = this.evaluate(cli);

    } catch (error) {
      console.error(error)
    }
    // return cpu values
    return cpu;
  }



  getCommand() {
    let cmd;
    if (this.platform == 'darwin') {
      cmd = 'top -l 1 | grep "CPU usage"'; // CPU usage: 6.59% user, 24.17% sys, 69.23% idle
    } else if (this.platform == 'linux') {
      cmd = 'cat /proc/stat | head -1'; // cpu  22238784 1994 28964906 3132073494 1766921 0 1566590 0 0 0
    }
    //console.log(cmd);
    return cmd;
  }

  evaluate(cli) {
    let cpu;

    if (this.platform == 'darwin') {
      // parse this one: "CPU usage: 6.59% user, 24.17% sys, 69.23% idle"
      const cpus = cli.toString('UTF8').split(', ');
      const cpuUser = cpus[0].split(' ')[2].split('%')[0];
      const cpuSys = cpus[1].split('%')[0];
      const cpuIdle = cpus[2].split('%')[0];

      cpu = {
        usage: cpuUser,
        user: cpuUser,
        sys: cpuSys,
        idle: cpuIdle
      };
    } else if (this.platform == 'linux') {
      /*
        Example:
            cpu  22238784 1994 28964906 3132073494 1766921 0 1566590 0 0 0

        The meanings of the columns are as follows, from left to right:

        2: user: normal processes executing in user mode
        3: nice: niced processes executing in user mode
        4: system: processes executing in kernel mode
        5: idle: twiddling thumbs
        6: iowait: waiting for I/O to complete
        7: irq: servicing interrupts
        8: softirq: servicing softirqs

        To calculate the percentage values: Example Idle:
        idlePercent = ( idle * 100 ) / ( user + nice + system + idle + iowait + irq + softirq )
      */
      const cpus = cli.toString('UTF8').split(' ');
      const cpuUser = parseInt(cpus[2]);
      const cpuNice = parseInt(cpus[3]);
      const cpuSys = parseInt(cpus[4]);
      const cpuIdle = parseInt(cpus[5]);
      const cpuIOWait = parseInt(cpus[6]);
      const cpuIRQ = parseInt(cpus[7]);
      const cpuSoftIRQ = parseInt(cpus[8]);

      const sum = cpuUser + cpuNice + cpuSys + cpuIdle + cpuIOWait + cpuIOWait + cpuIRQ + cpuSoftIRQ;

      // siehe https://www.idnt.net/en-US/kb/941772
      const delta = sum - this.cpuLastSum;
      const idle = cpuIdle - this.cpuLastIdle;
      const used = delta - idle;
      const usage = 100 * used / delta;

      this.cpuLastIdle = cpuIdle;
      this.cpuLastSum = sum;

      cpu = {
        usage: usage,
        user: cpuUser / sum * 100,
        sys: cpuSys / sum * 100,
        idle: cpuIdle / sum * 100
      };
    }
    return cpu;
  }

  async monitor() {
    const cpu = await this.cpu();
    console.log(`${new Date().toLocaleString()} | monitoring cpu: user ${cpu.user}%, sys ${cpu.sys}%, idle ${cpu.idle}%`);

    const data = [];
    data.push({ name: 'cpu-user', topic: 'cpu_load', type: 'float', value: cpu.user });
    data.push({ name: 'cpu-sys', topic: 'cpu_load', type: 'float', value: cpu.sys });
    data.push({ name: 'cpu-idle', topic: 'cpu_load', type: 'float', value: cpu.idle });

    this.handlers.forEach(handler => {
      handler.send(data);
    });
  }
}
module.exports = CPUMonitor;
