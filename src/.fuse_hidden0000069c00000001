async function fetch(denoms){

}

async function fetchFallback(missingDenoms){

}

function getMissingDenoms(denoms, fetchResult){

}

async function fetchWithFallback(denoms) {
    const fetchResult = await fetch(denoms);
    const missingDenoms = getMissingDenoms(denoms, fetchResult);
    if(missingDenoms.length !== 0){
        const fallbackFetchResult = await fetchFallback(missingDenoms);
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

