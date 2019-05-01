const request = require('request-promise');
const config = require('../config/constant.json');


const InternalFunctions = {
  async fetch(denoms) {
    const denomsString = denoms.toString();
    const API_URL = `${config.FETCH_APIS.BASE_API.URL}?fsym=ETH&tsyms=${denomsString}?api_key=${config.FETCH_APIS.BASE_API.API_KEY}`;
    const fetchResult = await request(API_URL);
    return fetchResult;
  },
  async fetchFallback(missingDenoms) {
    return missingDenoms;
  },
  getMissingDenoms(denoms, fetchResult) {
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
