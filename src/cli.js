const arg = require('arg');
const chalk = require('chalk');
const { help } = require('./help');
const { runDaemonPM2, removeDaemonPM2 } = require('./run');
const { fetch } = require('./fetcher');
const { submitVoteAsync } = require('./vote');


function parseArgumentsIntoOptions(rawArgs) {
  const args = arg({
    '--denom': String,
    '--price': Number,
    '--key': String,
    '--pw': String,
    '--interval': Number,
    '--help': Boolean,
    '-p': '--price',
    '-h': '--help',
  }, {
    argv: rawArgs.slice(2),
  });
  return {
    denom: args['--denom'] || undefined,
    price: args['--price'] || undefined,
    key: args['--key'] || undefined,
    password: args['--pw'] || undefined,
    interval: args['--interval'] || 15,
    help: args['--help'] || false,
    command: args._[0],
  };
}

module.exports = {
  cli: (args) => {
    const options = parseArgumentsIntoOptions(args);
    if (options.help) {
      help();
    } else if (options.command === 'run') {
      runDaemonPM2(options);
    } else if (options.command === 'rm') {
      removeDaemonPM2();
    } else if (options.command === 'fetch') {
      fetch(options);
    } else if (options.command === 'vote') {
      submitVoteAsync(options);
    } else {
      console.log(chalk.red('Invalid format please check --help for available options.'));
    }
  },
};
