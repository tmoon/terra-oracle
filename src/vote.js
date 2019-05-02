const EXEC = require('child_process').exec;
const CHALK = require('chalk');
const VOTER = require('../config/voter.json');
const { CLI_CURRENCY_MAP } = require('../config/constant.json');

const InternalFunctions = {
  convertToMicroUnit: value => value * 1000000,
};

module.exports = {
  submitVote: (voteParam) => {
    if (Object.keys(voteParam).length !== 2) {
      console.log(CHALK.red("Parameters doesn't match with standard format."));
      return {
        status: 'error',
        message: "Parameters doesn't match with standard format.",
      };
    }
    if (voteParam.denom === undefined) {
      console.log(CHALK.red('"denom" flag is missed in command'));
      return {
        status: 'error',
        message: '"denom" flag is missed in command',
      };
    }
    if (CLI_CURRENCY_MAP[voteParam.denom] === undefined) {
      console.log(CHALK.red(`"${voteParam.denom}" is not listed into Whitelist`));
      return {
        status: 'error',
        message: `"${voteParam.denom}" is not listed into Whitelist`,
      };
    }
    if (voteParam.price === undefined) {
      console.log(CHALK.red('"price" flag is missed in command'));
      return {
        status: 'error',
        message: '"price" flag is missed in command',
      };
    }
    if (typeof (voteParam.price) !== 'number') {
      console.log(CHALK.red('"price" must be a number'));
      return {
        status: 'error',
        message: '"price" must be number',
      };
    }

    const microPrice = InternalFunctions.convertToMicroUnit(voteParam.price);
    const command = `terracli tx oracle vote --denom "${CLI_CURRENCY_MAP[voteParam.denom]}" --price "${microPrice}" --from ${VOTER.key}`;

    EXEC(command, (error, stdOut, stdErr) => {
      if (stdErr !== null) {
        console.log(CHALK.red(stdErr));
        return {
          status: 'error',
          message: stdErr,
        };
      }
      if (error !== null) {
        console.log(CHALK.red(error));
        return {
          status: 'error',
          message: error,
        };
      }
      console.log('Successfully Voted!!');
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
