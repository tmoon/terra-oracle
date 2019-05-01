/* eslint-disable */

const request = require('request');
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

    // const APIDictKey = ;
    const finalUrl = config[`FX_API${apiNum}`].url + currencyString;

    return finalUrl;
  },

  async getDataFromAPI(denoms, apiNum) {
    const url = InternalFunctions.getAPIUrl(denoms, apiNum);

    try {
      const data = await request.get(url);
      return { jsonData: data, error: false };
    }
    catch(e) {
      return { jsonData: {}, error: true };
    }
  },

  getKeyToDenoms(denoms, apiNum) {
    let keyToDenoms = {};

    for (var i = denoms.length - 1; i >= 0; i--) {
      if (apiNum === 0) {
        keyToDenoms[denoms[i]] = InternalFunctions.getCurrencyPairFromDenom(denoms[i]);
      } else {
        keyToDenoms[denoms[i]] = InternalFunctions.getCurrencyFromDenom(denoms[i]);
      }
    }

    return keyToDenoms;
  },

  parseAPIData(denoms, data, apiNum) {
    var finalFXData = {};
    const keyToDenoms = InternalFunctions.getKeyToDenoms(denoms, apiNum);

    if (apiNum === 0) {
      for (let key of keyToDenoms.keys()) {
        finalFXData[keyToDenoms[key]] = data.rates[key].rate;
      } 
    } else if (apiNum === 1) {
      for (let key of keyToDenoms.keys()) {
        finalFXData[keyToDenoms[key]] = data.rates[key];
      }
    } else if (apiNum === 2) {
      for (let key of keyToDenoms.keys()) {
        finalFXData[keyToDenoms[key]] = data[key];
      }
    }

    return finalFXData;
  },

  async getAPIData(denoms, apiNum) {
    const res = InternalFunctions.getDataFromAPI(denoms, apiNum);

    if (!res.error) {
      const data = res.jsonData;

      return { parsedFXData: InternalFunctions.parseAPIData(denoms, data, apiNum), error: false };
    } else {
      return { error: true };
    }
  },
};

async function getForexRates(denoms) {
  const res = {
    API0Data: InternalFunctions.getAPIData(denoms, 0),
    API1Data: InternalFunctions.getAPIData(denoms, 1),
    API2Data: InternalFunctions.getAPIData(denoms, 2),
  };

  return res;
}

module.exports = {
  getForexRates,
};

/* eslint-enable */
