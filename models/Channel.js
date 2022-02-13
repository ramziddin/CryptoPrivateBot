const { model, Schema } = require("mongoose")

// Represents a Telegram channel
const channelSchema = new Schema({
  // Telegram channel ID
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  // Is subscription active
  active: {
    type: Boolean,
    default: false,
  },
  // Private unique link of the channel
  link: {
    type: String,
    unique: true,
  },
  // A currency supported by @CryptoBot
  currency: {
    type: String,
    enum: ["BTC", "TON", "USDT", "USDC", "BUSD"],
  },
  // Subscription price
  price: {
    type: Number,
  },
})

const Channel = model("Channel", channelSchema)

module.exports = Channel
