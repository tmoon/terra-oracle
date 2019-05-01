/* eslint-disable */

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

    // const APIDictKey = ;
    const finalUrl = config[`FX_API${apiNum}`].url + currencyString;

    return finalUrl;
  },

  async getDataFromAPI(denoms, apiNum) {
    const url = InternalFunctions.getAPIUrl(denoms, apiNum);

    try {
      const data = await request.get(url);

      return { jsonData: JSON.parse(data), error: false };
    }
    catch(e) {
      return { jsonData: {}, error: true };
    }
  },

  getDenomToKey(denoms, apiNum) {
    let denomToKey = {};

    for (var i = denoms.length - 1; i >= 0; i--) {
      if (apiNum === 0) {
        denomToKey[denoms[i]] = InternalFunctions.getCurrencyPairFromDenom(denoms[i]);
      } else {
        denomToKey[denoms[i]] = InternalFunctions.getCurrencyFromDenom(denoms[i]);
      }
    }

    return denomToKey;
  },

  parseAPIData(denoms, data, apiNum) {
    var finalFXData = {};
    const denomToKey = InternalFunctions.getDenomToKey(denoms, apiNum);

    if (apiNum === 0) {
      for (let denom of Object.keys(denomToKey)) {
        let currencyName = config.FX_CURRENCY_MAP[denom];
        finalFXData[currencyName] = data.rates[denomToKey[denom]].rate;
      } 
    } else if (apiNum === 1) {
      for (let denom of Object.keys(denomToKey)) {
        let currencyName = config.FX_CURRENCY_MAP[denom];
        finalFXData[currencyName] = data.rates[denomToKey[denom]];
      }
    } else if (apiNum === 2) {
      for (let denom of Object.keys(denomToKey)) {
        let currencyName = config.FX_CURRENCY_MAP[denom];
        finalFXData[currencyName] = data[denomToKey[denom]];
      }
    }

    return finalFXData;
  },

  async getAPIData(denoms, apiNum) {
    const res = await InternalFunctions.getDataFromAPI(denoms, apiNum);

    if (!res.error) {
      const data = res.jsonData;

      return { parsedFXData: InternalFunctions.parseAPIData(denoms, data, apiNum), error: false };
    } else {
      return { error: true };
    }
  },
};

async function getForexRates(denoms) {
  let res = {};

  for (var i = 0; i < 3; i += 1) {
    res[`API${i}Data`] = await InternalFunctions.getAPIData(denoms, 0)
  }

  return res;
}

module.exports = {
  getForexRates,
};

// const denoms = ['ust', 'jpt', 'krt'];

// async function blah(denoms) {
//   const dat = await getForexRates(denoms)
//   console.log(dat);
// }


// blah(denoms);


/* eslint-enable */
