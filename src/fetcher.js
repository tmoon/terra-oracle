/** This file contains critical functions that allow fetching a robust
* estimation for LUNA (here ETH) for various major foreign currencie.
*
* It has two steps: 1) Getting a matrix of ETH -> foreign currency data from 5 major exchanges
* 2) Then a best effort missing value estimation using 3 feeds of FX APIs
*
* Due to using 5 data feeds for crypto and 3 feeds for FX rates, this program is robust and has
* enough failsafe mechanisms built in
*/
const chalk = require('chalk');

const ccxt = require('ccxt');
const forex = require('./forex');
const config = require('../config/constant.json');


/* eslint-disable */
const ccxtExchanges = {
  coinmarketcap: new ccxt.coinmarketcap(),
  bitfinex: new ccxt.bitfinex(),
  kraken: new ccxt.kraken(),
  coinbasepro: new ccxt.coinbasepro(),
  okex: new ccxt.okex(),
};
/* eslint-enable */

/* In future, if LUNA is exchanged in some of the exchanges it would be sufficient
to change this flag */
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
      rate = (await ccxtExchanges[exchange].fetchTicker(`${LUNA}/${currency}`)).last;
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
    const sorted = numbers.sort((a, b) => a - b);
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
      for (let j = 0; j < 3; j += 1) {
        if (exchangeRates[j].error === false) {
          rates.push(exchangeRates[j].parsedFXData[denom]);
        }
      }
      medianRates[config.FX_CURRENCY_MAP[denom]] = InternalFunctions.getMedian(rates);
    }
    return medianRates;
  },

  // Get crypto-fiat currency pairs for all the exchanges in specified denomination
  // To speed up the call, we pool promises for web api requests
  // and try to resolve all of them together
  async getExchangeCurrencyMap(excahnges, denoms) {
    const ratePromises = [];
    for (let excahngesIdx = 0; excahngesIdx < excahnges.length; excahngesIdx += 1) {
      const exchange = excahnges[excahngesIdx];
      for (let denomsIdx = 0; denomsIdx < denoms.length; denomsIdx += 1) {
        const denom = denoms[denomsIdx];
        ratePromises.push(InternalFunctions.getRateByExchange(exchange, denom));
      }
    }

    // pool together the promises for speedup
    const rateResults = await Promise.all(ratePromises);
    const exchangeCurrencyMap = {};

    for (let excahngesIdx = 0; excahngesIdx < excahnges.length; excahngesIdx += 1) {
      const exchange = excahnges[excahngesIdx];
      exchangeCurrencyMap[exchange] = {};
    }

    // create crypto-fiat rate matrix (mapping) for all exchanges
    for (let rateResultsIdx = 0; rateResultsIdx < rateResults.length; rateResultsIdx += 1) {
      const rateResult = rateResults[rateResultsIdx];
      exchangeCurrencyMap[rateResult.exchange][rateResult.currency] = rateResult.rate;
    }

    return exchangeCurrencyMap;
  },

  // Infers the crypto-fiat rates for each exchage using the FX rates
  // The computes median to get the final values
  getMedianRatesWithForexInferredRates(exchangeCurrencyMap, usdExchangeRates, exchanges, denoms) {
    const medianDenoms = {};
    for (let denomsIdx = 0; denomsIdx < denoms.length; denomsIdx += 1) {
      const denom = denoms[denomsIdx];
      const rates = [];
      for (let exchangesIdx = 0; exchangesIdx < exchanges.length; exchangesIdx += 1) {
        const exchange = exchanges[exchangesIdx];
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
  },
};

// main fetch function
async function fetchWithFallback(denoms) {
  try {
    const mappedDenoms = InternalFunctions.denomMapper(denoms);
    const validDenoms = [];
    for (let mappedDenomsIdx = 0; mappedDenomsIdx < mappedDenoms.length; mappedDenomsIdx += 1) {
      validDenoms.push(config.FX_CURRENCY_MAP_REVERSE[mappedDenoms[mappedDenomsIdx]]);
    }
    const needsSanitization = denoms.filter(x => !validDenoms.includes(x));
    const denomsWithUSD = mappedDenoms.slice(0);
    if (denomsWithUSD.includes('USD') === false) {
      denomsWithUSD.push('USD');
    }
    const exchangeNames = Object.keys(ccxtExchanges);
    const exchangeCurrencyMap = await InternalFunctions.getExchangeCurrencyMap(exchangeNames,
      denomsWithUSD);
    const usdExchangeRates = await InternalFunctions.getForexExchangeRates(validDenoms);
    const result = InternalFunctions.getMedianRatesWithForexInferredRates(exchangeCurrencyMap,
      usdExchangeRates, exchangeNames, mappedDenoms);

    return {
      error: false,
      errorMsg: null,
      result,
      needsSanitization,
    };
  } catch (e) {
    return {
      error: true,
      errorMsg: e.message,
      result: null,
      needsSanitization: null,
    };
  }
}

// wrapper function for the CLI fetch command
function fetch(options) {
  let denoms;
  if (options.denom === undefined) {
    denoms = Object.keys(config.FX_CURRENCY_MAP);
  } else {
    denoms = options.denom.split(',').map(cur => cur.trim());
  }

  fetchWithFallback(denoms)
    .then((res) => {
      if (res.error === true) {
        console.log(chalk.red('Error in fetch: ', res.errorMsg));
      } else {
        if (res.needsSanitization.length > 0) {
          console.log(chalk.yellow(`Warning: These denoms are not valid -> ${res.needsSanitization.toString()}`));
        }
        console.log(res.result);
      }
    }).catch((err) => {
      console.log(chalk.red('Error in fetch: ', err));
    });
}

module.exports = {
  fetchWithFallback,
  fetch,
};
