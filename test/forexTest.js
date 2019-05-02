const assert = require('assert');
const rewire = require('rewire');
const underscore = require('underscore');

const forex = rewire('../src/forex');
/* eslint-disable */
const forexInternal = forex.__get__('InternalFunctions');
/* eslint-enable */

describe('Forex Internal Functions Unit Testing', () => {
  describe('#getCurrencyFromDenom(denom)', () => {
    it('Should be return USD', () => {
      const result = forexInternal.getCurrencyFromDenom('ust');
      assert.equal(result === 'USD', true);
    });
    it('Should be GBP', () => {
      const result = forexInternal.getCurrencyFromDenom('gbt');
      assert.equal(result === 'GBP', true);
    });
  });
  describe('#getCurrencyPairFromDenom(denom, base)', () => {
    it('Should return USDGBP', () => {
      const result = forexInternal.getCurrencyPairFromDenom('gbt');
      assert.equal(result === 'USDGBP', true);
    });
    it('Should return USDUSD', () => {
      const result = forexInternal.getCurrencyPairFromDenom('ust');
      assert.equal(result === 'USDUSD', true);
    });
  });
  describe('#getAPIUrl(denoms, apiNum)', () => {
    it('Testing for api 0', () => {
      const result = forexInternal.getAPIUrl(['gbt', 'jpt'], 0);
      assert.equal(result === 'https://www.freeforexapi.com/api/live?pairs=USDGBP,USDJPY', true);
    });
    it('Testing for api 1', () => {
      const result = forexInternal.getAPIUrl(['ust', 'jpt'], 1);
      assert.equal(result === 'https://api.exchangeratesapi.io/latest?base=USD&symbols=USD,JPY', true);
    });
    it('Testing for api 2', () => {
      const result = forexInternal.getAPIUrl(['krt', 'eut'], 2);
      assert.equal(result === 'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=KRW,EUR', true);
    });
  });
  describe('#getDataFromAPI(denoms, apiNum)', () => {
    it('Retrive data from api 2', async () => {
      const result = await forexInternal.getDataFromAPI(['eut', 'jpt'], 2);
      assert.equal(underscore.isEqual(Object.keys(result.jsonData), ['EUR', 'JPY']), true);
    });
  });
  describe('#getDenomToKey(denoms, apiNum)', () => {
    it('Should return json object from api 0', () => {
      const result = forexInternal.getDenomToKey(['cnt', 'krt'], 0);
      assert.equal(underscore.isEqual(result, { cnt: 'USDCNY', krt: 'USDKRW' }), true);
    });
    it('Should return json object from api 1', () => {
      const result = forexInternal.getDenomToKey(['ust', 'eut'], 1);
      assert.equal(underscore.isEqual(result, { ust: 'USD', eut: 'EUR' }), true);
    });
  });
  describe('#getAPIData(denoms, apiNum)', () => {
    it('Should return json object from api 2', async () => {
      const result = await forexInternal.getAPIData(['ust', 'jpt'], 2);
      assert.equal(underscore.isEqual(Object.keys(result.parsedFXData), ['jpt', 'ust']), true);
    });
  });
  describe('#getForexRates(denoms)', () => {
    it('Should return json object', async () => {
      const result = await forex.getForexRates(['cnt', 'jpt']);
      assert.equal(Object.keys(result).length === 3, true);
    });
  });
});
