// argobj - Wrapper for argparse with some extras <https://github.com/msikma/argobj>
// © MIT license

const ArgumentParser = require('argparse').ArgumentParser
const HelpFormatter = require('argparse/lib/help/formatter')
const { removeUnnecessaryLines, ensurePeriod } = require('./text')

// A simple wrapper for the ArgumentParser library. Adds support for an extra help paragraph,
// and the ability to add multiple sections. This is useful for grouping certain options together.
// Original library: <https://github.com/nodeca/argparse>
const makeArgObj = (opts) => {
  return new class ArgumentParserWrapper {
    constructor() {
      // List of extra multiple choice items we'll print.
      this.choices = []
      // List of section headers we'll print.
      this.sections = []
      // Used to keep track of sections and add them after the argument following them.
      this.sectionReady = false
      this.sectionNext = null
      // Limits metavars to one occurrence per line even with multiple argument hooks.
      this.noDoubleMetavar = opts.noDoubleMetavar

      // Ensure a period unless 'ensurePeriod' is explicitly false.
      this.parser = new ArgumentParser({ ...opts, description: opts.ensurePeriod !== false && opts.description ? ensurePeriod(opts.description) : opts.description })
      this.addLongDescription(opts.longDescription, opts.noWrapping)
      this.helpFormatter = new HelpFormatter({ prog: this.parser.prog })
    }

    // Wrapper for ArgumentParser.addArgument().
    addArgument(...opts) {
      // Add a section if we've set one up to be printed.
      if (this.sectionReady) {
        // We'll save the longest argument to do string matching on.
        this.sections.push({ header: this.sectionNext, match: this.longestArgument(opts[0]) })
        this.sectionReady = false
      }
      // Special formatting case: if an argument has 'choices', 'metavar' and
      // our own 'choicesHelp', we want to display its options differently than normal.
      // Save a reference and modify the output before parsing.
      if (opts[1].choices && opts[1].metavar && opts[1].choicesHelp) {
        this.choices.push({ name: opts[0], choices: opts[1].choices, choicesHelp: opts[1].choicesHelp })
      }
      return this.parser.addArgument(...opts)
    }

    // Wrapper for ArgumentParser.error().
    error(...opts) {
      return this.parser.error(...opts)
    }

    // Adds any option sections we have and then runs the parser.
    parseArgs(...opts) {
      this.formatHelp()
      return this.parser.parseArgs(...opts)
    }

    // Adds a new section to the list of arguments, right before whatever argument comes next.
    addSection(header) {
      this.sectionReady = true
      this.sectionNext = header
    }

    // Wraps text (if 'wrapping' is set to true; otherwise it just returns the original string).
    wrapText(text, wrapping) {
      if (!text) return null
      if (!wrapping) return text
      return HelpFormatter.prototype._splitLines(text, 78).join('\n') + '\n'
    }

    // Adds extra help lines to the output if needed, and sets up a modified help formatter.
    addLongDescription(longDescription, noWrapping = false, removeLines = true) {
      const ldContent = this.wrapText(longDescription, !noWrapping)
      this.parser.formatHelp = () => {
        // Here we do some messing around with the private ArgumentParser API in order to
        // get extra text to show up. You're never supposed to do that, but oh well.
        this.helpFormatter.addUsage(this.parser.usage, this.parser._actions, this.parser._mutuallyExclusiveGroups)
        this.helpFormatter.addText(this.parser.description)
        if (longDescription) {
          // Add the long help text without filtering the text formatting.
          this.helpFormatter._addItem(str => str, [ldContent])
        }
        this.parser._actionGroups.forEach((actionGroup) => {
          this.helpFormatter.startSection(actionGroup.title)
          this.helpFormatter.addText(actionGroup.description)
          this.helpFormatter.addArguments(actionGroup._groupActions)
          this.helpFormatter.endSection()
        });
        // Add epilogue without reformatting the whitespace.
        // Don't you DARE take away my linebreaks.
        this.helpFormatter._addItem(str => str, [this.parser.epilog])
        const formatted = this.helpFormatter.formatHelp()
        return removeLines ? removeUnnecessaryLines(formatted) : formatted
      }
    }

    // Checks if a line has a specific argument.
    hasArgument(arg, line) {
      return new RegExp(`[^\[]${arg}([^\s]|$)`).test(line)
    }

    // Returns the longest string in an array of strings.
    longestArgument(args) {
      return args.reduce((l, o) => (o.length > l.length ? o : l), '')
    }

    removeDoubleMetavars(buffer) {
      // Remove extra metavars if we need to.
      if (!this.noDoubleMetavar) {
        return buffer
      }
      const multiMetavars = []
      for (const action of this.parser._actions) {
        if (action.optionStrings.length < 2 || action.constructor.name !== 'ActionStore') continue
        const meta = action.metavar == null ? action.dest.toUpperCase() : action.metavar
        const options = action.optionStrings
        multiMetavars.push({ meta, options })
      }
      // Don't continue if we have no actions with a metavar and multiple options.
      if (multiMetavars.length === 0) return buffer

      // Iterate over the help buffer and replace matching options.
      buffer = buffer.map(line => {
        for (const mmVar of multiMetavars) {
          const { meta, options } = mmVar

          if (line.indexOf(meta) === -1) continue
          const noLast = options.slice(0, -1)
          const matchOpts = noLast.map(opt => `(${opt})( ${meta})`).join('|')

          // Replace the '--opt VAR' sequences with just '--opt'.
          return line.replace(new RegExp(matchOpts), (_, opt) => opt)
        }
        return line
      })

      return buffer
    }

    // Replaces ArgumentParser's usual help formatter with one that supports multiple sections.
    // Also cleans up the output a bit.
    formatHelp() {
      const originalFormatHelp = this.parser.formatHelp;
      this.parser.formatHelp = () => {
        // Run the original formatting function, then find the 'query' argument.
        // Add a header string in front of it.
        let buffer = originalFormatHelp().split('\n')
        this.sections.forEach(section => {
          buffer = buffer.map(line => {
            // Find the first argument that this section should be directly above.
            return this.hasArgument(section.match, line) ? `\n${section.header}\n${line}` : line
          })
        })

        // Format the extra multiple choice sections.
        this.choices.forEach(choiceItem => {
          let choiceSection = []
          const choices = choiceItem.choices.length
          const indent = ' '.repeat(5)
          // Determine the width at which the help strings are being printed.
          // This corrects for the extra indentation we use in choice sections.
          const width = Math.min(this.helpFormatter._actionMaxLength - 2, this.helpFormatter._maxHelpPosition - 4)
          for (let a = 0; a < choices; ++a) {
            choiceSection.push(`${indent}${a === 0 ? '{' : ' '}${`${choiceItem.choices[a]}${a < choices - 1 ? ',' : '}'}`.padEnd(width)}${choiceItem.choicesHelp[a] ? choiceItem.choicesHelp[a] : ''}`)
          }
          buffer = buffer.map(line => {
            return this.hasArgument(this.longestArgument(choiceItem.name), line) ? `${line}\n${choiceSection.join('\n')}` : line
          })
        })

        // Remove double metavars if they exist.
        buffer = this.removeDoubleMetavars(buffer)

        // While we're at it, remove double empty lines.
        return removeUnnecessaryLines(buffer.join('\n'))
      }
    }
  }
}

module.exports = makeArgObj
