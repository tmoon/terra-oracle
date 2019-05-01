const request = require('request-promise');
const config = require('../config/constant.json');


const InternalFunctions = {
  resultMapper(result) {
    const mappedResult = {};
    const resultKeys = Object.keys(result);
    for (let i = 0; i < resultKeys.length; i += 1) {
      const key = resultKeys[i];
      const newKey = `${key.toLocaleLowerCase().slice(0, -1)}t`;
      mappedResult[newKey] = result[key];
    }
    return mappedResult;
  },
  async fetch(denoms) {
    const denomsString = denoms.toString();
    const API_URL = `${config.FETCH_APIS.BASE_API.URL}?fsym=ETH&tsyms=${denomsString}?api_key=${config.FETCH_APIS.BASE_API.API_KEY}`;
    const fetchResult = JSON.parse(await request(API_URL));
    return InternalFunctions.resultMapper(fetchResult);
  },
  async fetchFallback(missingDenoms) {
    // TODO
    return missingDenoms;
  },
  getMissingDenoms(denoms, fetchResult) {
    // TODO
    return { denoms, fetchResult };
  },
};

async function fetchWithFallback(denoms) {
  const fetchResult = await InternalFunctions.fetch(denoms);
  const missingDenoms = InternalFunctions.getMissingDenoms(denoms, fetchResult);
  if (missingDenoms.length !== 0) {
    const fallbackFetchResult = await InternalFunctions.fetchFallback(missingDenoms);
    const finalFetchResult = { ...fetchResult, ...fallbackFetchResult };
    return finalFetchResult;
  }
  return fetchResult;
}

module.exports = {
  fetchWithFallback,
};
