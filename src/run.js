// const cron = require('node-cron');

// const { fetchWithFallback } = require('./fetcher');

module.exports = {
  run: (options) => {
    // console.log(options);
    if (options.interval === undefined) {
      throw Error('interval is necessary for run command');
    }

    // cron.schedule(`* */${options.interval} * * *`, async () => {
    //   await fetchWithFallback('ust');
    //   // TODO vote
    // });
  },
};
