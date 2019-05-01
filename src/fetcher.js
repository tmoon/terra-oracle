const config = require("../config/constant.json");
var request = require('request-promise');

const InternalFunctions = {
    async fetch(denoms){
        const fetchResult = await request(config.FETCH_APIS.BASE_API);
        return fetchResult;
    },
    async fetchFallback(missingDenoms){
    
    },
    getMissingDenoms(denoms, fetchResult){
    
    }
}

async function fetchWithFallback(denoms) {
    const fetchResult = await InternalFunctions.fetch(denoms);
    const missingDenoms = InternalFunctions.getMissingDenoms(denoms, fetchResult);
    if(missingDenoms.length !== 0){
        const fallbackFetchResult = await InternalFunctions.fetchFallback(missingDenoms);
        const finalFetchResult = { ...fetchResult, ...fallbackFetchResult };
        return finalFetchResult;
    }
    else {
        return fetchResult;
    }
}

module.exports = {
    fetchWithFallback
}

console.log(fetch)
