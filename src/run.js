const cron = require('node-cron');
const pm2 = require('pm2');
const chalk = require('chalk');

const pm2Config = require('./../config/pm2.json');
const CONSTANT = require('./../config/constant.json');

const { fetchWithFallback } = require('./fetcher');
const { submitVote } = require('./vote.js');


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
      console.log(CONSTANT.CLI_CURRENCY_MAP);
      const whiteListedCur = Object.keys(CONSTANT.CLI_CURRENCY_MAP);
      const res = fetchWithFallback(whiteListedCur);
      const currencyList = Object.keys(res);
      for (let i = 0; i < currencyList.length; i += 1) {
        try {
          const voteRes = submitVote({
            denom: currencyList[i],
            price: res[currencyList[i]],
            key: options.key,
            password: options.password,
          });
          if (voteRes.status !== 'success') {
            console.log('Error in sumitting values', voteRes.message, currencyList[i]);
          } else {
            console.log('Voting success', voteRes);
          }
        } catch (error) {
          console.log(chalk.red('Error occurred during submitting vote, ', error.message));
        }
      }
    });
    console.log('done');
  },
  runDaemonPM2: (options) => {
    if (options.interval === undefined) {
      console.log(chalk.red('please provide --interval options'));
      return;
    }

    if (options.key === undefined) {
      console.log(chalk.red('please provide --key options'));
      return;
    }

    if (options.password === undefined) {
      console.log(chalk.red('please provide --pw options'));
      return;
    }

    pm2Config.args = [options.interval, options.key, options.password];
    pm2Config.cwd = process.cwd();
    pm2Config.output = `${process.cwd()}${pm2Config.output}`;
    pm2Config.error = `${process.cwd()}${pm2Config.error}`;

    pm2.connect((err) => {
      if (err) {
        console.log(chalk.red('Error in pm2 connection. ', err));
      }

      pm2.start(pm2Config, (err1, apps) => {
        console.log(apps);
        pm2.disconnect();
        if (err1) {
          console.log(chalk.red('Error in pm2 init. ', err));
        }
      });
    });
  },
  removeDaemonPM2: () => {
    pm2.connect((err) => {
      if (err) {
        console.log(chalk.red('Error in pm2 connection. ', err));
      }

      pm2.delete('oracle-feeder', (err1, apps) => {
        console.log(apps);
        pm2.disconnect();
        if (err1) {
          console.log(chalk.red('Error in pm2 init. ', err));
        }
      });
    });
  },
};

if (require.main === module) {
  if (process.argv.length < 5) {
    throw Error('Need the interval params');
  }
  const args = process.argv.slice(2);
  const interval = Number(args[0]);
  console.log(args, interval);
  module.exports.run({ interval, key: args[1], password: args[2] });
}
