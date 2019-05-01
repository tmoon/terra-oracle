const ccxt = require('ccxt');
const config = require('../config/constant.json');

/* eslint-disable */
const exchanges = {
  coinmarketcap: new ccxt.coinmarketcap(),
  bitfinex: new ccxt.bitfinex(),
  kraken: new ccxt.kraken(),
  coinbasepro: new ccxt.coinbasepro(),
  okex: new ccxt.okex(),
};
/* eslint-enable */

const LUNA = 'ETH';

const InternalFunctions = {
  denomMapper(denoms) {
    const newDenoms = [];
    for (let i = 0; i < denoms.length; i += 1) {
      if(config.FX_CURRENCY_MAP.hasOwnProperty(denoms[i]) === true){
        denom = config.FX_CURRENCY_MAP[denoms[i]];
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

  getMedian(numbers) {
    const sorted = numbers.slice().sort();
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }
};


async function fetchWithFallback(denoms) {
  const mappedDenoms = InternalFunctions.denomMapper(denoms);
  var denomsWithUSD = mappedDenoms.slice(0);
  if (denomsWithUSD.includes('USD') === false) {
    denomsWithUSD.push('USD');
  }

  const ratePromises = [];

  const exchangeNames = Object.keys(exchanges);
  for (let exchangeNamesIdx = 0; exchangeNamesIdx < exchangeNames.length; exchangeNamesIdx += 1) {
    const exchange = exchangeNames[exchangeNamesIdx];
    for (let denomsWithUSDIdx = 0; denomsWithUSDIdx < denomsWithUSD.length; denomsWithUSDIdx += 1) {
      const denom = denomsWithUSD[denomsWithUSDIdx];
      ratePromises.push(InternalFunctions.getRateByExchange(exchange, denom));
    }
  }

  const rateResults = await Promise.all(ratePromises);

  const exchangeCurrencyMap = {};
  for (let exchangeNamesIdx = 0; exchangeNamesIdx < exchangeNames.length; exchangeNamesIdx += 1) {
    const exchange = exchangeNames[exchangeNamesIdx];
    exchangeCurrencyMap[exchange] = {};
  }

  for (let rateResultsIdx = 0; rateResultsIdx < rateResults.length; rateResultsIdx += 1) {
    const rateResult = rateResults[rateResultsIdx];
    exchangeCurrencyMap[rateResult.exchange][rateResult.currency] = rateResult.rate;
  }

  var medianDenoms = {}
  const usdExchangeRates = {}

  for (let mappedDenomsIdx = 0; mappedDenomsIdx < mappedDenoms.length; mappedDenomsIdx += 1) {
    const denom = mappedDenoms[mappedDenomsIdx];
    var rates = [];
    for (let exchangeNamesIdx = 0; exchangeNamesIdx < exchangeNames.length; exchangeNamesIdx += 1) {
      const exchange = exchangeNames[exchangeNamesIdx];
      if(exchangeCurrencyMap[exchange][denom] === null) {
        if(usdExchangeRates.hasOwnProperty(denom)){
          const usdInferredExchangeRate = usdExchangeRates[denom] * exchangeCurrencyMap[exchange]['USD'];
          rates.push(usdInferredExchangeRate);
        } 
      }
      else {
        rates.push(exchangeCurrencyMap[exchange][denom]);
      }
    }
    medianDenoms[config.FX_CURRENCY_MAP_REVERSE[denom]] = InternalFunctions.getMedian(rates);
  }

  return medianDenoms;
}


module.exports = {
  fetchWithFallback,
};

// fetchWithFallback(['gbt', 'krt'])
// .then((res) => {
//   console.log(res);
// })
// .catch(e => {
//   console.log(e);
// })