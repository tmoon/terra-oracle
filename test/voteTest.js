const assert = require('assert');
const rewire = require('rewire');
const { submitVote } = require('../src/vote');
/* eslint-disable */
const voteInternal = rewire('../src/vote').__get__('InternalFunctions');
/* eslint-enable */

describe('Voting Tests', () => {
  describe('#submitVote(voteParam)', () => {
    it('Should return error with error message about format', () => {
      const result = submitVote({ denom: 'ust', price: 0.1, other: 'no' });
      assert.equal(result.status === 'error' && result.message === "Parameters doesn't match with standard format.", true);
    });
    it('Should return error with error message denom flag missing', () => {
      const result = submitVote({
        demon: 'ust', price: 0.1, key: 'thisIskey', password: 'password',
      });
      assert.equal(result.status === 'error' && result.message === '"denom" flag is missed in command', true);
    });
    it('Should return error with message about currency is not in white listed', () => {
      const result = submitVote({
        denom: 'sdt', price: 90, key: 'thisIskey', password: 'password',
      });
      assert.equal(result.status === 'error' && result.message === '"sdt" is not listed into Whitelist', true);
    });
    it('Should return error with message about price flag is missing', () => {
      const result = submitVote({
        denom: 'ust', pice: 90, key: 'thisIskey', password: 'password',
      });
      assert.equal(result.status === 'error' && result.message === '"price" flag is missed in command', true);
    });
    it('Should return error with message about price should be number', () => {
      const result = submitVote({
        denom: 'ust', price: 'is', key: 'thisIskey', password: 'password',
      });
      assert.equal(result.status === 'error' && result.message === '"price" must be number', true);
    });
    it('Should return succeed', () => {
      const result = submitVote({
        denom: 'ust', price: 114.7, key: 'thisIskey', password: 'password',
      });
      assert.equal(result.status === 'succeed' && result.message === '', true);
    });
  });
  describe('Internal Function: $convertToMicroUnit', () => {
    it('Should return 1000000 times for each input', () => {
      const result = voteInternal.convertToMicroUnit(7);
      assert.equal(result === 7000000, true);
    });
    it('Should return 1000000 times for each input [double]', () => {
      const result = voteInternal.convertToMicroUnit(0.123456);
      assert.equal(result === 123456, true);
    });
  });
});
