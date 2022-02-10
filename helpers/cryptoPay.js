const { CryptoPay } = require("@foile/crypto-pay-api")
const { CRYPTO_PAY_TOKEN } = require("./env")

const mainnet = "pay.crypt.bot" // @CryptoBot
const testnet = "testnet-pay.crypt.bot" // @CryptoTestnetBot

const cryptoPay = new CryptoPay(CRYPTO_PAY_TOKEN, {
  hostname: testnet,
  protocol: "https",
})

module.exports = {
  cryptoPay,
}
