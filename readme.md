## argobj

This is a thin wrapper for the [`argparse`](https://github.com/nodeca/argparse) module, adding a few new features. Since `argparse` is a direct port of the [Python equivalent](https://docs.python.org/3/library/argparse.html), new features normally don't get added to it.

### Usage

First, run `makeArgObj()` to create the parser object.

```js
const makeArgObj = require('argobj')
const parser = makeArgObj({
  addHelp: true,
  description: `Suspendisse at sodales leo, in bibendum ex.`,
  longDescription: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac lectus lacinia, laoreet sem sit amet, imperdiet tellus. Etiam augue erat, elementum vel malesuada non, varius quis lectus. Phasellus quis sollicitudin dui, nec tristique ex.`,
  noWrapping: false,
  ensurePeriod: false,
  epilog: `For more information, see <https://michielsikma.com/>.`,
  version: '1.0.0'
})
```

The constructor argument takes several new attributes:

* `longDescription` - An optional extra block of text that gets added below the description
* `noWrapping` - Turns off the text wrapping that normally gets done to description text
* `ensurePeriod` - Ensures that `description` ends with a period - I use this when directly passing my `package.json`'s `description` field.

After the argparser object is instantiated, add any number of arguments.

```js
parser.addArgument(['--action'], { help: 'Which action to take.', choices: ['search', 'detail'], metavar: 'ACTION', choicesHelp: ['Runs a search query and returns results.', 'Returns information about a specific item by ID.'] })
parser.addArgument(['--output'], { help: 'Result output format.', choices: ['json', 'xml', 'terminal'], choicesHelp: ['JSON string (default).', 'XML string.', 'Plain text readable in terminal.'], defaultValue: 'json', metavar: 'TYPE' })
parser.addArgument(['--site'], { help: 'Site to run the query on.', choices: ['asdf'], defaultValue: 'asdf' })
```

New here is the `choicesHelp` attribute. When `choices` adds multiple values for an argument, `choicesHelp` will make them be listed explicitly with their own help string. The two `choices` and `choicesHelp` arrays must be of the same length.

You can make sections of arguments with the `addSection()` method. Note that there is still the limitation of every argument having to be unique, even if they appear in different sections.

```js
parser.addSection('Search options:')
parser.addArgument(['--query'], { help: 'Query string to search for.' })
parser.addArgument(['--category'], { help: 'Specific category ID.' })

const parsed = parser.parseArgs()
```

To see the above example, try running `./example.js --help` in this package.

### Copyright

© MIT license
