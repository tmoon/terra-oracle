# <span style="color:blue">Terra Oracle Feeder</span>



Oracle feeder is a robust tool that can 

1. fetch and infer ETH (or any other major crypto currency) exchange rates in 6 major active currencies (namely KRW, USD, JPY, GBP, EUR, CNY)
2. Submit vote for the price of that specific crypto using `terracli`
3. It can run a daemon in persistent mode such that it fetches and votes once in every regular pre-defined interval. It automatically restarts itself in case of a crash or a system restart.

As this tool is can be a critical part of Terra network, we designed this with various robust, failsafe mechanisms

## Installation

1. Install node.js
2. Download/clone this repo from `https://github.com/covalent-hq/terra-oracle.git`
3. run `npm install` : This installs necessary node modules
4. run `npm link` : registers the `oracle` CLI command to `bin/oracle`


## Dependencies and Other Tools
1. Obviously one need to have `terrad` and `terracli` installed and running to vote
2. In addition, 

## Functionality and Mechanism
### Fetch

### Vote

### Run
## Limitations
1. If ALL the major exchanges delist ETH/USD pair, then it might not be possible to infer the exchange values for other currencies. The reason we leaned towards this assumption is that for the free forex API we could find, there was no easy way to obtain covertion rates between non-USD pairs. In addition, it is highly unlikely that all the major crypto exchanges would de-list ETH/USD pair.
2. While we chose 5 major crypto exchanges and they have decent uptime, in case, a coin is listed in very few exchanges, downtime in those exchange APIs could stop this program from working. We could use a caching system. However, as we know crypto and forex both could be volatile and depending on stale values is not a great idea.
3. While we have tried to write various unit tests, due to time limitation our test coverage is not extremely high
