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

    return request.get(url);
  },

  async getAPI0Data(denoms) {
    const data = InternalFunctions.getDataFromAPI(denoms, 0);
    return data;
  },
};

async function getForexRates(denoms) {
  return InternalFunctions.getAPI0Data(denoms);
}

module.exports = {
  getForexRates,
};
