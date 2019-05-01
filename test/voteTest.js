const assert = require('assert');
const { submitVote } = require('../src/vote/vote');

describe('Voting Tests', () => {
  describe('submitVote with wrong number of parameter', () => {
    const result = submitVote({ denom: 'ust', price: 0.1, other: 'no' });
    assert.equal(result.status === 'error' && result.message === "Parameters doesn't match with standard format.", true);
  });
});
