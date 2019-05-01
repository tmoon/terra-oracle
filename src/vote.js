const EXEC = require('child_process').exec;
const chalk = require('chalk');
const VOTER = require('../config/voter.json');
const { CLI_CURRENCY_MAP } = require('../config/constant.json');

module.exports = {
  submitVote: (voteParam) => {
    if (Object.keys(voteParam).length !== 2) {
      return {
        status: 'error',
        message: "Parameters doesn't match with standard format.",
      };
    }
    if (voteParam.denom === undefined) {
      return {
        status: 'error',
        message: '"denom" flag is missed in command',
      };
    }
    if (CLI_CURRENCY_MAP[voteParam.denom] === undefined) {
      return {
        status: 'error',
        message: `"${voteParam.denom}" is not listed into Whitelist`,
      };
    }
    if (voteParam.price === undefined) {
      return {
        status: 'error',
        message: '"price" flag is missed in command',
      };
    }
    if (typeof (voteParam.price) !== 'number') {
      return {
        status: 'error',
        message: '"price" must be number',
      };
    }

    const command = `terracli tx oracle vote --denom "${CLI_CURRENCY_MAP[voteParam.denom]}" --price "${voteParam.price}" --from ${VOTER.key}`;

    EXEC(command, (error, stdOut, stdErr) => {
      if (stdErr !== null) {
        console.log(chalk.red(stdErr));
      }
      if (error !== null) {
        console.log(chalk.red(error));
      }
      return {
        status: 'succeed',
        message: '',
      };
    });
    return {
      status: 'error',
      message: 'Invalid State',
    };
  },
};
