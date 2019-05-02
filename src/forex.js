/** This file contains critical functions for pulling data from 3 forex APIs.
* Upon getting those, fetcher takes those values and computes median to get combined FX rates
*/

const request = require('request-promise');
const config = require('../config/constant.json');

const InternalFunctions = {
  getCurrencyFromDenom(denom) {
    return config.FX_CURRENCY_MAP[denom].toUpperCase();
  },

  getCurrencyPairFromDenom(denom, base = 'USD') {
    const currencyPair = base + InternalFunctions.getCurrencyFromDenom(denom);
    return currencyPair;
  },

  getAPIUrl(denoms, apiNum) {
    let currencyString;

    if (apiNum === 0) {
      currencyString = denoms.map(denom => InternalFunctions.getCurrencyPairFromDenom(denom)).join(',');
    } else {
      currencyString = denoms.map(denom => InternalFunctions.getCurrencyFromDenom(denom)).join(',');
    }

    const finalUrl = config[`FX_API${apiNum}`].url + currencyString;

    return finalUrl;
  },

  async getDataFromAPI(denoms, apiNum) {
    const url = InternalFunctions.getAPIUrl(denoms, apiNum);

    try {
      const data = await request.get(url);

      return { jsonData: JSON.parse(data), error: false };
    } catch (e) {
      return { jsonData: {}, error: true };
    }
  },

  getDenomToKey(denoms, apiNum) {
    const denomToKey = {};

    for (let i = denoms.length - 1; i >= 0; i -= 1) {
      if (apiNum === 0) {
        denomToKey[denoms[i]] = InternalFunctions.getCurrencyPairFromDenom(denoms[i]);
      } else {
        denomToKey[denoms[i]] = InternalFunctions.getCurrencyFromDenom(denoms[i]);
      }
    }

    return denomToKey;
  },


  parseAPIData(data, key, apiNum) {
    let res = null;

    try {
      if (apiNum === 0) {
        res = data.rates[key].rate;
      } else if (apiNum === 1) {
        res = data.rates[key];
      } else if (apiNum === 2) {
        res = data[key];
      }
    } catch (error) {
      res = null;
    }

    return res;
  },

  async getAPIData(denoms, apiNum) {
    const res = await InternalFunctions.getDataFromAPI(denoms, apiNum);

    const denomToKey = InternalFunctions.getDenomToKey(denoms, apiNum);

    if (!res.error) {
      const data = res.jsonData;

      let finalFXData = {};
      for (let i = denoms.length - 1; i >= 0; i -= 1) {
        const denom = denoms[i];
        finalFXData[denom] = InternalFunctions.parseAPIData(data, denomToKey[denom], apiNum);
      }

      return { parsedFXData: finalFXData, error: false };
    }
    return { error: true };
  },
};

async function getForexRates(denoms) {
  let promises = [];
  for (let i = 0; i < 3; i += 1) {
    promises.push(InternalFunctions.getAPIData(denoms, i));
  }
  const res = await Promise.all(promises);

  return res;
}

module.exports = {
  getForexRates,
};

// getForexRates(['jpt', 'ust']).then(x => console.log(x))
