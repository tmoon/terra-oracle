// .___________. _______ .______      .______           ___           ______   .______           ___       ______  __       _______ 
// |           ||   ____||   _  \     |   _  \         /   \         /  __  \  |   _  \         /   \     /      ||  |     |   ____|
// `---|  |----`|  |__   |  |_)  |    |  |_)  |       /  ^  \       |  |  |  | |  |_)  |       /  ^  \   |  ,----'|  |     |  |__   
//     |  |     |   __|  |      /     |      /       /  /_\  \      |  |  |  | |      /       /  /_\  \  |  |     |  |     |   __|  
//     |  |     |  |____ |  |\  \----.|  |\  \----. /  _____  \     |  `--'  | |  |\  \----. /  _____  \ |  `----.|  `----.|  |____ 
//     |__|     |_______|| _| `._____|| _| `._____|/__/     \__\     \______/  | _| `._____|/__/     \__\ \______||_______||_______|
                                                                                                                                 

const arg = require('arg');
const { help } = require('./help');
const { addDaemon, removeDaemon } = require('./run.js');

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
      addDaemon(options);
    } else if (options.command === 'rm') {
      removeDaemon();
    }
  },
};
