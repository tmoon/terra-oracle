const assert = require('assert');
const forex = require('../src/forex');

describe('Forex Internal Functions Unit Testing', () => {
  describe('#getCurrencyFromDenom(denom)', () => {
    it('Should be return USD', () => {
      const result = forex.getCurrencyFromDenom('ust');
      assert.equal(result === 'USD', true);
    });
    it('Should be GBP', () => {
      const result = forex.getCurrencyFromDenom('gbt');
      assert.equal(result === 'GBP', true);
    });
  });
  describe('#getCurrencyPairFromDenom(denom, base)', () => {
    it('Should return USDGBP', () => {
      const result = forex.getCurrencyPairFromDenom('gbt');
      assert.equal(result === 'USDGBP', true);
    });
    it('Should return USDUSD', () => {
      const result = forex.getCurrencyPairFromDenom('USD');
      assert.equal(result === 'USDUSD', true);
    });
  });
  describe('#getAPIUrl(denoms, apiNum)', () => {
    it('Testing for api 0', () => {
      const result = forex.getAPIUrl(['gbt', 'jpt'], 0);
      assert.equal(result === 'https://www.freeforexapi.com/api/live?pairs=USDGBP,USDJPY', true);
    });
    it('Testing for api 1', () => {
      const result = forex.getAPIUrl(['ust', 'jpt'], 1);
      assert.equal(result === 'https://api.exchangeratesapi.io/latest?base=USD&symbols=USD,JPY', true);
    });
    it('Testing for api 2', () => {
      const result = forex.getAPIUrl(['krt', 'eut'], 2);
      assert.equal(result === 'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=KRW,EUR', true);
    });
  });
  describe('#getDataFromAPI(denoms, apiNum)', () => {
    it('Retrive data from api', async () => {
      const result = await forex.getDataFromAPI(['eut', 'jpt'], 2);
      assert.equal(Object.keys(result.jsonData) === ['EUR', 'JPY'], true);
    });
  });
  describe('#getDenomToKey(denoms, apiNum)', () => {
    it('Should return json object', () => {
      const result = forex.getDenomToKey(['cnt', 'krt'], 0);
      assert.equal(result === { cnt: 'USDCNY', krt: 'USDKRW' }, true);
    });
  });
  describe('#getAPIData(denoms, apiNum)', () => {
    it('Should return json object', async () => {
      const result = await forex.getAPIData(['ust', 'jpt'], 2);
      assert.equal(Object.keys(result.parsedFXData) === ['USD', 'JPY'], true);
    });
  });
  describe('#getForexRates(denoms)', () => {
    it('Should return json object', async () => {
      const result = await forex.getForexRates(['cnt', 'jpt']);
      assert.equal(Object.keys(result).length === 3, true);
    });
  });
});
