// argobj - Wrapper for argparse with some extras <https://github.com/msikma/argobj>
// © MIT license

// For some reason, argparse sometimes outputs an extra linebreak after the usage text.
// This seems to happen when the previous usage line is of a precise length.
// Bit hackish, but this removes it.
const removeUnnecessaryLines = (str) => (
  str.split('\n').map(s => s.trim() === '' ? s.trim() : s).join('\n').split('\n\n\n').join('\n\n')
)

// Ensures that a string ends with a period.
const ensurePeriod = (str) => {
  if (str.slice(-1) === '.') return str
  return `${str}.`
}

module.exports = {
  ensurePeriod,
  removeUnnecessaryLines
}
