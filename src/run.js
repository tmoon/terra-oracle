const cron = require('node-cron');
const service = require('service-systemd');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');

const serviceConfig = require('./../config/service.json');
const CONSTANT = require('./../config/constant.json');

const { fetchWithFallback } = require('./fetcher');
const { submitVote } = require('./vote.js');

module.exports = {
  run: (options) => {
    console.log(chalk.green(options));
    console.log(chalk.green(process.cwd()));
    if (options.interval === undefined) {
      console.log(chalk.red('interval is necessary for run command!'));
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
      const currencyList = CONSTANT.CLI_CURRENCY_MAP.keys();
      const values = await fetchWithFallback(currencyList);
      for (let i = 0; i < currencyList.length; i += 1) {
        const resp = submitVote({
          denom: currencyList[i],
          price: values[currencyList[i]],
        });
        if (resp.status !== 'success') {
          console.log(chalk.red('Error in sumitting values', resp.message, currencyList[i]));
        }
      }
    });
    console.log(chalk.green('done'));
  },
  addDaemon: (options) => {
    console.log(chalk.green(options));
    console.log(chalk.green(process.cwd()));
    if (options.interval === undefined) {
      console.log(chalk.red('interval is necessary for run command'));
    }
    serviceConfig.cwd = process.cwd();
    serviceConfig['app.args'] = options.interval;
    console.log(chalk.green(serviceConfig));

    exec('which node')
      .then((resp) => {
        if (resp.stderr !== '') {
          return Promise.reject(Error('Install node'));
        }
        console.log('Found ', resp.stdout.trim());
        serviceConfig['engine.bin'] = resp.stdout.trim();
        return service.add(serviceConfig);
      }).then((success) => {
        console.log(chalk.green('successfully added service ', success));
        return exec(`service ${serviceConfig.name} start`);
      }).then((success) => {
        console.log(chalk.green('successfully start service ', success));
      })
      .catch((err) => {
        console.log(chalk.red('Error occurred ', err));
      });
  },
  removeDaemon: () => {
    service.remove(serviceConfig.name)
      .then((success) => {
        console.log(chalk.green('Successfully remove service ', success));
        return exec(`systemctl daemon-reload && service ${serviceConfig.name} stop`);
      }).then((success) => {
        console.log(chalk.green('Successfully relaod daemon.', success));
      }).catch((err) => {
        console.log(chalk.red('Error occurred ', err));
      });
  },
};

if (require.main === module) {
  if (process.argv.length < 3) {
    console.log(chalk.red('Need the interval params'));
  }
  const args = process.argv.slice(2);
  const interval = Number(args[0]);
  console.log(args, interval);
  module.exports.run({ interval });
}
