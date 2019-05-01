const request = require('request-promise');
const ccxt = require('ccxt');
const config = require('../config/constant.json');

const exchanges = {
  coinmarketcap: new ccxt.coinmarketcap(),
  bitfinex: new ccxt.bitfinex(),
  kraken: new ccxt.kraken(),
  coinbasepro: new ccxt.coinbasepro(),
  okex: new ccxt.okex(),
};

const LUNA = 'ETH';

const InternalFunctions = {
  denomMapper(denoms) {
    const newDenoms = [];
    for (let i = 0; i < denoms.length; i += 1) {
      const denom = config.FX_CURRENCY_MAP[denoms[i]];
      if (denom !== undefined) {
        newDenoms.push(denom);
      }
    }
    return newDenoms;
  },

  async getRateByExchange(exchange, currency) {
    let rate;
    try {
      rate = (await exchanges[exchange].fetchTicker(`${LUNA}/${currency}`)).last;
    } catch (e) {
      rate = null;
    }
    return {
      exchange,
      currency,
      rate,
    };
  },
};


async function fetchWithFallback(denoms) {
  const mappedDenoms = InternalFunctions.denomMapper(denoms);
  const denomsWithUSD = mappedDenoms;
  if (denomsWithUSD.includes('USD') === false) {
    denomsWithUSD.push('USD');
  }

  const ratePromises = [];

  const exchangeNames = Object.keys(exchanges);
  for (var exchangeNamesIdx = 0; exchangeNamesIdx < exchangeNames.length; exchangeNamesIdx += 1) {
    const exchange = exchangeNames[exchangeNamesIdx];
    for (let denomsWithUSDIdx = 0; denomsWithUSDIdx < denomsWithUSD.length; denomsWithUSDIdx += 1) {
      const denom = denomsWithUSD[denomsWithUSDIdx];
      ratePromises.push(InternalFunctions.getRateByExchange(exchange, denom));
    }
  }

  const rateResults = await Promise.all(ratePromises);

  const exchangeCurrencyMap = {};
  for (var exchangeNamesIdx = 0; exchangeNamesIdx < exchangeNames.length; exchangeNamesIdx += 1) {
    const exchange = exchangeNames[exchangeNamesIdx];
    exchangeCurrencyMap[exchange] = {};
  }

  for (let rateResultsIdx = 0; rateResultsIdx < rateResults.length; rateResultsIdx += 1) {
    const rateResult = rateResults[rateResultsIdx];
    exchangeCurrencyMap[rateResult.exchange][rateResult.currency] = rateResult.rate;
  }

  return exchangeCurrencyMap;
}


module.exports = {
  fetchWithFallback,
};
