const EXEC = require('child_process').exec;
const VOTER = require('../../config/voter.json');
const { CURRENCY_MAP } = require('../../config/constant.json');

module.exports = {
  submitVote: (currency, price) => {
    if (CURRENCY_MAP[currency] === undefined) {
      throw new Error(`"${currency}" is not listed into Whitelist`);
    }

    const command = `terracli tx oracle vote --denom "${CURRENCY_MAP[currency]}" --price "${price}" --from ${VOTER.key}`;

    EXEC(command, (error, stdOut, stdErr) => {
      if (stdErr !== null) {
        throw new Error(stdErr);
      }
      if (error !== null) {
        throw new Error(error);
      }
    });
  },
};
