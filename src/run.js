const cron = require('node-cron');
const pm2 = require('pm2');
const chalk = require('chalk');

const logger = require('./logger');
const pm2Config = require('./../config/pm2.json');
const CONSTANT = require('./../config/constant.json');

const { fetchWithFallback } = require('./fetcher');
const { submitVoteAsync } = require('./vote.js');

function sleep(ms) {
  logger.debug('sleep');
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  run: (options) => {
    logger.debug(options);
    logger.debug(process.cwd());
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
      logger.debug(CONSTANT.CLI_CURRENCY_MAP);
      const whiteListedCur = Object.keys(CONSTANT.CLI_CURRENCY_MAP);
      const res = await fetchWithFallback(whiteListedCur);
      let { result } = res;
      if (result === undefined) {
        result = {};
      }
      const currencyList = Object.keys(result);
      logger.info(result);
      logger.info(currencyList);
      for (let i = 0; i < currencyList.length; i += 1) {
        // logger.debug('currency calling ', i);
        try {
          /* eslint-disable */
          const voteRes = await submitVoteAsync({
            denom: currencyList[i],
            price: result[currencyList[i]],
            key: options.key,
            password: options.password,
          });
          await sleep(5000);
          /* eslint-enable */
          logger.info(`denom: ${currencyList[i]} price: ${result[currencyList[i]]}`);
          // logger.info('found res', voteRes);
        } catch (error) {
          logger.error(chalk.red('Error occurred during submitting vote, ', error.message));
        }
      }
    });
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
        pm2.disconnect();
        if (err1) {
          console.log(chalk.red('Error in pm2 init. ', err, apps));
        } else {
          console.log('Successfully added daemon.');
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
        pm2.disconnect();
        if (err1) {
          console.log(chalk.red('Error in pm2 init. ', err, apps));
        } else {
          console.log('Successfylly removed daemon.');
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
  // logger.debug(args);
  module.exports.run({ interval, key: args[1], password: args[2] });
}
