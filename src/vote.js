const EXEC = require('child_process').exec;
const CHALK = require('chalk');
const VOTER = require('../config/voter.json');
const { CLI_CURRENCY_MAP } = require('../config/constant.json');

const InternalFunctions = {
  convertToMicroUnit: value => value * 1000000,
};

module.exports = {
  submitVote: (voteParam) => {
    if (Object.keys(voteParam).length < 4) {
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

    if (voteParam.key === undefined) {
      console.log(CHALK.red('"key" flag is missed in command'));
      return {
        status: 'error',
        message: '"key" flag is missed in command',
      };
    }

    if (voteParam.password === undefined) {
      console.log(CHALK.red('"pw" flag is missed in command'));
      return {
        status: 'error',
        message: '"pw" flag is missed in command',
      };
    }

    const microPrice = InternalFunctions.convertToMicroUnit(voteParam.price);
    const command = `echo ${voteParam.password} | terracli tx oracle vote --denom "${CLI_CURRENCY_MAP[voteParam.denom]}" --price "${microPrice}" --from ${voteParam.key} --chain-id ${VOTER.CHAIN_ID} -y`;

    EXEC(command, (error, stdOut, stdErr) => {
      if (error !== null) {
        console.log(CHALK.red(stdErr));
        return {
          status: 'error',
          message: stdErr,
        };
      }
      console.log('Successfully Voted!!', stdOut);
      return {
        status: 'succeed',
        message: stdOut,
      };
    });
    return {
      status: 'error',
      message: 'Invalid State',
    };
  },
};
