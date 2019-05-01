const EXEC = require('child_process').exec;
const VOTER = require('../../config/voter.json');
const { CLI_CURRENCY_MAP } = require('../../config/constant.json');

module.exports = {
  submitVote: (voteParam) => {
    if (Object.keys(voteParam).length !== 2) {
      throw new Error("Parameters doesn't match with standard format.");
    }
    if (voteParam.denom === undefined) {
      throw new Error('"denom" flag is missed in command');
    }
    if (CLI_CURRENCY_MAP[voteParam.denom] === undefined) {
      throw new Error(`"${voteParam.denom}" is not listed into Whitelist`);
    }
    if (voteParam.price === undefined) {
      throw new Error('"price" flag is missed in command');
    }
    if (typeof (voteParam.price) !== 'number') {
      throw new Error('"price" must be number');
    }

    const command = `terracli tx oracle vote --denom "${CLI_CURRENCY_MAP[voteParam.denom]}" --price "${voteParam.price}" --from ${VOTER.key}`;

    EXEC(command, (error, stdOut, stdErr) => {
      if (stdErr !== null) {
        throw new Error(stdErr);
      }
      if (error !== null) {
        throw new Error(error);
      }
      return {
        status: 'succeed',
      };
    });
  },
};
