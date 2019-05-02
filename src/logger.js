const chalk = require('chalk');

module.exports = {
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(chalk.yellow(new Date().toUTCString(), ...args));
    }
  },
  info: (...args) => {
    console.log(chalk.green(new Date().toUTCString(), ...args));
  },
  error: (...args) => {
    console.log(chalk.red(new Date().toUTCString(), ...args));
  },
};
