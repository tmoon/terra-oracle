/**
* This file enables the cli to show beautifully formatted help prompts
* using command-line-usage and chalk
*/

const commandLineUsage = require('command-line-usage');
const chalk = require('chalk');

const sections = [
  {
    header: chalk.red('Terra Oracle Feeder'),
    content: 'Command line interface for interacting with the Terra Oracle Feeder',
  },
  {
    header: 'Usage:',
    content: 'oracle [command]',
  },
  {
    header: 'Available Commands:',
    content: [
      { name: 'fetch', summary: 'Fetch the current price of luna. If denom is not specified, fetches the prices in all available denoms' },
      { name: 'run', summary: 'Runs in daemon mode. Runs periodically (constrained by the interval command) to fetch and vote to the chain' },
      { name: 'vote', summary: 'Transactions subcommands' },
    ],
  },
  {
    header: 'Flags',

    optionList: [
      {
        name: 'denom',
        typeLabel: 'string',
        description: 'denomination flag, one of "luna | krt | ust | srt | jpt | gbt | eut | cnt"',
      },
      {
        name: 'price',
        alias: 'p',
        typeLabel: 'float',
        description: 'price flag, to be used by vote',
      },
      {
        name: 'help',
        alias: 'h',
        description: 'help for oracle',
      },
      {
        name: 'key',
        typeLabel: 'string',
        description: 'name of the terra key stored on disk by terracli',
      },
      {
        name: 'pw',
        typeLabel: 'string',
        description: 'password of the terra key',
      },
      {
        name: 'interval',
        typeLabel: 'int',
        description: 'the minute intervals by which oracle should run (default 15 mins)',
      },
    ],
  },
];

module.exports = {
  help: () => {
    const usage = commandLineUsage(sections);
    console.log(usage);
  },
};
