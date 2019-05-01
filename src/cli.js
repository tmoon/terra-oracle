// import arg from 'arg';
const arg = require('arg');
const { help } = require('./help');
const { run } = require('./run.js');

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
    interval: args['--interval'] || undefined,
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
      run(options);
    }
  },
};
