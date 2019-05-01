const fetcher = require('../src/fetcher');
const assert = require('assert');

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('fetcher', () => {
  describe('#fetch()', () => {
    it('should return json with values given in denoms', () => {
      let result = fetcher.fetch(['usd', 'jpy']);
      assert.equal('ust' in result && 'jpt' in result && Object.keys(result).length === 2, true);
    });
    it('should return json with all seven values given in denoms', () => {
      let result = fetcher.fetch(['usd', 'krw', 'sdr', 'cny', 'jpy', 'eur', 'gbp']);
      assert.equal('ust' in result && 'krt' in result && 'sdt' in result && 'cnt' in result && 'jpt' in result && 'eut' in result && 'gbt' in result && Object.keys(result).length === 7, true);
    });
  });

  describe('#fetchFallback()', () => {
    it('should return json with values given in denoms', () => {
      let result = fetcher.fetch(['usd', 'jpy']);
      assert.equal('ust' in result && 'jpt' in result && Object.keys(result).length === 2, true);
    });
    it('should return json with all seven values given in denoms', () => {
      let result = fetcher.fetch(['usd', 'krw', 'sdr', 'cny', 'jpy', 'eur', 'gbp']);
      assert.equal('ust' in result && 'krt' in result && 'sdt' in result && 'cnt' in result && 'jpt' in result && 'eut' in result && 'gbt' in result && Object.keys(result).length === 7, true);
    });
  });

  describe('#fetchWithFallback()', () => {
    it('should return json with values given in denoms', () => {
      let result = fetcher.fetch(['usd', 'jpy']);
      assert.equal('ust' in result && 'jpt' in result && Object.keys(result).length === 2, true);
    });
    it('should return json with all seven values given in denoms', () => {
      let result = fetcher.fetch(['usd', 'krw', 'sdr', 'cny', 'jpy', 'eur', 'gbp']);
      assert.equal('ust' in result && 'krt' in result && 'sdt' in result && 'cnt' in result && 'jpt' in result && 'eut' in result && 'gbt' in result && Object.keys(result).length === 7, true);
    });
  });
});
