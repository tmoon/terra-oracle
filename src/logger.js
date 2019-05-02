const chalk = require('chalk');

module.exports = {
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(chalk.yellow(...args));
    }
  },
  info: (...args) => {
    console.log(chalk.green(...args));
  },
  error: (...args) => {
    console.log(chalk.red(...args));
  },
};
