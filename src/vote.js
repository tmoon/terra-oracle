const { exec } = require('child_process');
const chalk = require('chalk');
const voter = require('../config/voter.json');
const { CLI_CURRENCY_MAP } = require('../config/constant.json');

const InternalFunctions = {
  convertToMicroUnit: value => value * 1000000,
};

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error || stderr);
      }
      resolve(stdout || stderr);
    });
  });
}

module.exports = {
  checkVoteParams: (voteParam) => {
    if (Object.keys(voteParam).length < 4) {
      console.log(chalk.red("Parameters don't match with standard format."));
      return {
        status: 'error',
        message: "Parameters don't match with standard format.",
      };
    }
    if (voteParam.denom === undefined) {
      console.log(chalk.red('"denom" flag is missing in command'));
      return {
        status: 'error',
        message: '"denom" flag is missing in command',
      };
    }
    if (CLI_CURRENCY_MAP[voteParam.denom] === undefined) {
      console.log(chalk.red(`"${voteParam.denom}" is not listed in whitelist`));
      return {
        status: 'error',
        message: `"${voteParam.denom}" is not listed in whitelist`,
      };
    }
    if (voteParam.price === undefined) {
      console.log(chalk.red('"price" flag is missing in command'));
      return {
        status: 'error',
        message: '"price" flag is missing in command',
      };
    }
    if (typeof (voteParam.price) !== 'number') {
      console.log(chalk.red('"price" must be a number'));
      return {
        status: 'error',
        message: '"price" must be number',
      };
    }

    if (voteParam.key === undefined) {
      console.log(chalk.red('"key" flag is missing in command'));
      return {
        status: 'error',
        message: '"key" flag is missing in command',
      };
    }

    if (voteParam.password === undefined) {
      console.log(chalk.red('"pw" flag is missing in command'));
      return {
        status: 'error',
        message: '"pw" flag is missing in command',
      };
    }
    
    return false;
  },
  
  submitVoteAsync: async (voteParam) => {
    const error = InternalFunctions.checkVoteParams(voteParam);

    // if error is non-empty then something is wrong
    if (error) {
      return error;
    }

    const microPrice = InternalFunctions.convertToMicroUnit(voteParam.price);
    const command = `echo ${voteParam.password} | terracli tx oracle vote --denom "${CLI_CURRENCY_MAP[voteParam.denom]}" --price "${microPrice}" --from ${voteParam.key} --chain-id ${voter.CHAIN_ID} -y`;
    const res = await execShellCommand(command);
    return res;
  },
};
