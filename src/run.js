const cron = require('node-cron');
const service = require('service-systemd');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const serviceConfig = require('./../config/service.json');

const { fetchWithFallback } = require('./fetcher');

module.exports = {
  run: (options) => {
    console.log(options);
    console.log(process.cwd());
    if (options.interval === undefined) {
      throw Error('interval is necessary for run command');
      // Output with chalk
    }

    // CRON schedule format:
    // # ┌────────────── second (optional)
    // # │ ┌──────────── minute
    // # │ │ ┌────────── hour
    // # │ │ │ ┌──────── day of month
    // # │ │ │ │ ┌────── month
    // # │ │ │ │ │ ┌──── day of week
    // # │ │ │ │ │ │
    // # │ │ │ │ │ │
    // # * * * * * *

    cron.schedule(`* */${options.interval} * * *`, async () => {
      await fetchWithFallback(['ust']);
      // TODO vote
    });
    console.log('done');
  },
  addDaemon: (options) => {
    console.log(options);
    console.log(process.cwd());
    if (options.interval === undefined) {
      throw Error('interval is necessary for run command');
    }

    serviceConfig.cwd = process.cwd();
    serviceConfig['app.args'] = options.interval;
    console.log(serviceConfig);

    exec('which node')
      .then((resp) => {
        if (resp.stderr !== '') {
          return Promise.reject(Error('Install node'));
        }
        console.log('Found ', resp.stdout.trim());
        serviceConfig['engine.bin'] = resp.stdout.trim();
        return service.add(serviceConfig);
      }).then((success) => {
        console.log('successfully added service ', success);
        return exec(`service ${serviceConfig.name} start`);
      }).then((success) => {
        console.log('successfully start service ', success);
      })
      .catch((err) => {
        console.log('Error occurred ', err);
      });
  },
  removeDaemon: () => {
    service.remove(serviceConfig.name)
      .then((success) => {
        console.log('Successfully remove service ', success);
        return exec(`systemctl daemon-reload && service ${serviceConfig.name} stop`);
      }).then((success) => {
        console.log('Successfully relaod daemon.', success);
      }).catch((err) => {
        console.log('Error occurred', err);
      });
  },
};

if (require.main === module) {
  if (process.argv.length < 3) {
    throw Error('Need the interval params');
  }
  const args = process.argv.slice(2);
  const interval = Number(args[0]);
  console.log(args, interval);
  module.exports.run({ interval });
}
