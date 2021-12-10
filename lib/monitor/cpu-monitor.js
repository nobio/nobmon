const { execSync } = require('child_process');
const { default: cluster } = require('cluster');

class CPUMonitor {

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
      let cmd;
      if (this.platform == 'darwin') {
        cmd = 'top -l 1 | grep "CPU usage"';  // CPU usage: 6.59% user, 24.17% sys, 69.23% idle 
      } else if (this.platform == 'linux') {
        cmd = 'export TERM=xterm; top -n 1 | grep Cpu';          // %Cpu(s):  3.7 us,  3.7 sy,  0.0 ni, 92.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
      }
      console.log(cmd)

      const cli = execSync(cmd);
      console.log(lsx.toString('UTF8'));

      // evaluate cli response depending on platform
      if (this.platform == 'darwin') {
        // parse this one: "CPU usage: 6.59% user, 24.17% sys, 69.23% idle"
        const cpus = cli.toString('UTF8').split(', ');
        const cpuUser = cpus[0].split(' ')[2].split('%')[0];
        const cpuSys = cpus[1].split('%')[0];
        const cpuIdle = cpus[2].split('%')[0];

        cpu = { user: cpuUser, sys: cpuSys, idle: cpuIdle }
      } else if (this.platform == 'linux') {
        // parse this one: "%Cpu(s):  3.7 us,  3.7 sy,  0.0 ni, 92.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st"
        const cpus = cli.toString('UTF8').split(', ');
        const cpuUser = cpus[1];
        const cpuSys = cpus[3];
        const cpuIdle = cpus[7];

        cpu = { user: cpuUser, sys: cpuSys, idle: cpuIdle }
      }

    } catch (error) {
      console.error(error)
    }
    // return cpu values
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
