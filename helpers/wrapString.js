/**
 * Wrap a string with a prefix and suffix
 * @param {string} str - The string to wrap
 * @param {string} prefix - The prefix to add
 * @param {string} suffix - The suffix to add
 * @returns {string} The wrapped string
 * @example
 * wrapString('foo', '<', '>') // '<foo>'
 */
const wrapString = (str, prefix, suffix = prefix) => {
  if (typeof str !== "string") {
    return str
  }

  return `${prefix}${str}${suffix}`
}

/**
 * Wrap a string with bullet points
 * @param {string} str - The string to wrap
 * @returns {string} The wrapped string
 * @example
 * wrapStringWithBullets('foo') // '• foo •'
 */
const wrapStringWithBullets = (str) => wrapString(str, "• ", " •")

module.exports = {
  wrapString,
  wrapStringWithBullets,
}
