const cron = require('node-cron');

const { fetchWithFallback } = require('./fetcher');

module.exports = {
  run: (options) => {
    console.log(options);
    console.log(process.cwd());
    if (options.interval === undefined) {
      throw Error('interval is necessary for run command');
    }

    cron.schedule(`* */${options.interval} * * *`, async () => {
      await fetchWithFallback('ust');
      console.log('bokkor');
      // TODO vote
    });
    console.log('done');
  },
};

if (require.main === module) {
  module.exports.run({ interval: 1 });
}
