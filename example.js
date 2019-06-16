#!/usr/bin/env node

// Usage example of argObj.
// Running './example --help' should print the following:

// usage: example.js [-h] [-v] [--output TYPE] [-a NAME] [--query QUERY]
//                   [--category CATEGORY]
//
// Suspendisse at sodales leo, in bibendum ex.
//
// Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac lectus
// lacinia, laoreet sem sit amet, imperdiet tellus. Etiam augue erat, elementum
// vel malesuada non, varius quis lectus. Phasellus quis sollicitudin dui, nec
// tristique ex.
//
// Optional arguments:
//   -h, --help           Show this help message and exit.
//   -v, --version        Show program's version number and exit.
//   --output TYPE        Result output format.
//      {json,              JSON string (default).
//       xml,               XML string.
//       terminal}          Plain text readable in terminal.
//   -a, --author NAME    Author of the work.
//
// Search options:
//   --query QUERY        Query string to search for.
//   --category CATEGORY  Specific category ID.
//
// For more information, see <https://michielsikma.com/>.

const makeArgObj = require('./src/index')
const parser = makeArgObj({
  addHelp: true,
  description: `Suspendisse at sodales leo, in bibendum ex.`,
  longDescription: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac lectus lacinia, laoreet sem sit amet, imperdiet tellus. Etiam augue erat, elementum vel malesuada non, varius quis lectus. Phasellus quis sollicitudin dui, nec tristique ex.`,
  noWrapping: false,
  ensurePeriod: false,
  noDoubleMetavars: true,
  epilog: `For more information, see <https://michielsikma.com/>.`,
  version: '1.0.0'
})
parser.addArgument(
  ['--output'],
  {
    help: 'Result output format.',
    choices: ['json', 'xml', 'terminal'],
    choicesHelp: ['JSON string (default).', 'XML string.', 'Plain text readable in terminal.'],
    defaultValue: 'json',
    metavar: 'TYPE'
  }
)
parser.addArgument(
  ['-a', '--author'],
  {
    help: 'Author of the work.',
    metavar: 'NAME',
    defaultValue: 'asdf'
  }
)

// Search options:
parser.addSection('Search options:')
parser.addArgument(
  ['--query'],
  {
    help: 'Query string to search for.'
  }
)
parser.addArgument(
  ['--category'],
  {
    help: 'Specific category ID.'
  }
)

const parsed = parser.parseArgs()

console.log('Run with --help for an example of the new formatting options.')
console.log('Parsed options:')
console.log(parsed)
