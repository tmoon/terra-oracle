/** This file contains critical functions that allow fetching a robust
* estimation for LUNA (here ETH) for various major foreign currencie.
*
* It has two steps: 1) Getting a matrix of ETH -> foreign currency data from 5 major exchanges
* 2) Then a best effort missing value estimation using 3 feeds of FX APIs
*
* Due to using 5 data feeds for crypto and 3 feeds for FX rates, this program is robust and has
* enough failsafe mechanisms built in
*/

const ccxt = require('ccxt');
const chalk = require('chalk');
const forex = require('./forex');
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

/* In future, if LUNA is exchanged in some of the exchanges it would be sufficient
* to change this flag */
const LUNA = 'ETH';

const InternalFunctions = {
  // checks to make sure only active/valid denominations are taken
  denomMapper(denoms) {
    const newDenoms = [];
    for (let i = 0; i < denoms.length; i += 1) {
      if (Object.prototype.hasOwnProperty.call(config.FX_CURRENCY_MAP, denoms[i]) === true) {
        const denom = config.FX_CURRENCY_MAP[denoms[i]];
        newDenoms.push(denom);
      }
    }
    return newDenoms;
  },

  // pull relevant currency exchange rate using ccxt
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

  // compute median
  getMedian(numbers) {
    const sorted = numbers.slice().sort();
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  },

  // get median values for USD to major foreign currency rates
  async getForexExchangeRates(denoms) {
    const exchangeRates = await forex.getForexRates(denoms);
    const medianRates = {};
    for (let i = 0; i < denoms.length; i += 1) {
      const denom = denoms[i];
      const rates = [];
      // TODO: num APIs
      for (let j = 0; j < 3; j += 1) {
        if (exchangeRates[j].error === false) {
          rates.push(exchangeRates[j].parsedFXData[denom]);
        }
      }
      medianRates[config.FX_CURRENCY_MAP[denoms]] = InternalFunctions.getMedian(rates);
    }
    return medianRates;
  },
};

// TODO: refactor and modulerize
async function fetchWithFallback(denoms) {
  const mappedDenoms = InternalFunctions.denomMapper(denoms);
  const denomsWithUSD = mappedDenoms.slice(0);
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

  const medianDenoms = {};
  const usdExchangeRates = await InternalFunctions.getForexExchangeRates(denoms);

  for (let mappedDenomsIdx = 0; mappedDenomsIdx < mappedDenoms.length; mappedDenomsIdx += 1) {
    const denom = mappedDenoms[mappedDenomsIdx];
    const rates = [];
    for (let exchangeNamesIdx = 0; exchangeNamesIdx < exchangeNames.length; exchangeNamesIdx += 1) {
      const exchange = exchangeNames[exchangeNamesIdx];
      if (exchangeCurrencyMap[exchange][denom] === null) {
        if (Object.prototype.hasOwnProperty.call(usdExchangeRates, denom)) {
          const usdInferredExchangeRate = usdExchangeRates[denom
          ] * exchangeCurrencyMap[exchange].USD;
          rates.push(usdInferredExchangeRate);
        }
      } else {
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

// TODO: remove
fetchWithFallback(['jpt', 'gbt', 'krt'])
  .then((res) => {
    console.log(chalk.green(res));
  })
  .catch((e) => {
    console.log(chalk.red(e));
  });
