import arg from 'arg';
import help from './help';

function parseArgumentsIntoOptions(rawArgs) {
  // for debug
  console.log(rawArgs);
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

export function cli(args) {
  const options = parseArgumentsIntoOptions(args);
  // for debug
  console.log(options);
  if(options.help) {
    help();
  }
}
