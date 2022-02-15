const { CryptoPay } = require("@foile/crypto-pay-api")
const { TESTNET } = require("./constants")
const { CRYPTO_PAY_TOKEN } = require("./env")

const cryptoPay = new CryptoPay(CRYPTO_PAY_TOKEN, {
  hostname: TESTNET,
  protocol: "https",
})

module.exports = {
  cryptoPay,
}
