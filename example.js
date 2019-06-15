#!/usr/bin/env node

const makeArgObj = require('./src/index')
const parser = makeArgObj({
  addHelp: true,
  description: `Suspendisse at sodales leo, in bibendum ex.`,
  longDescription: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac lectus lacinia, laoreet sem sit amet, imperdiet tellus. Etiam augue erat, elementum vel malesuada non, varius quis lectus. Phasellus quis sollicitudin dui, nec tristique ex.`,
  noWrapping: false,
  ensurePeriod: false,
  epilog: `For more information, see <https://michielsikma.com/>.`,
  version: '1.0.0'
})

parser.addArgument(['--action'], { help: 'Which action to take.', choices: ['search', 'detail'], metavar: 'ACTION', choicesHelp: ['Runs a search query and returns results.', 'Returns information about a specific item by ID.'] })
parser.addArgument(['--output'], { help: 'Result output format.', choices: ['json', 'xml', 'terminal'], choicesHelp: ['JSON string (default).', 'XML string.', 'Plain text readable in terminal.'], defaultValue: 'json', metavar: 'TYPE' })
parser.addArgument(['--site'], { help: 'Site to run the query on.', choices: ['asdf'], defaultValue: 'asdf' })

// Search options:
parser.addSection('Search options:')
parser.addArgument(['--query'], { help: 'Query string to search for.' })
parser.addArgument(['--category'], { help: 'Specific category ID.' })

const parsed = parser.parseArgs()

console.log('Run with --help for an example of the new formatting options.')
console.log('Parsed options:')
console.log(parsed)
