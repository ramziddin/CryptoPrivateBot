const dotenv = require("dotenv")

dotenv.config()

const { NODE_ENV, BOT_TOKEN, APP_URL, MONGODB_URI, CRYPTO_PAY_TOKEN, PORT } =
  process.env

if (!NODE_ENV || (NODE_ENV !== "development" && NODE_ENV !== "production")) {
  throw new Error(
    "NODE_ENV is not defined. Make sure you have a .env file with NODE_ENV=development or NODE_ENV=production"
  )
}

if (NODE_ENV === "production" && !APP_URL) {
  throw new Error(
    "APP_URL is not defined. Make sure you have a .env file with APP_URL=<your app url>"
  )
}

if (!BOT_TOKEN) {
  throw new Error(
    "BOT_TOKEN is not defined. Make sure you have a .env file with BOT_TOKEN=<your telegram bot token>"
  )
}

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Make sure you have a .env file with MONGODB_URI=<your mongodb uri>"
  )
}

if (!CRYPTO_PAY_TOKEN) {
  throw new Error(
    "CRYPTO_PAY_TOKEN is not defined. Make sure you have a .env file with CRYPTO_PAY_TOKEN=<your crypto pay token>"
  )
}

if (NODE_ENV === "production" && !PORT) {
  throw new Error(
    "PORT is not defined. Make sure you have a .env file with PORT=<your port>"
  )
}

module.exports = {
  NODE_ENV,
  BOT_TOKEN,
  APP_URL,
  MONGODB_URI,
  CRYPTO_PAY_TOKEN,
  PORT,
}
