const { model, Schema } = require("mongoose")

// Represents a subscription to a Telegram channel
const subscriptionSchema = new Schema({
  // Telegram user ID
  userId: {
    type: Number,
    unique: true,
    required: true,
  },
  // Telegram channel ID
  channelId: {
    type: Number,
    unique: true,
    required: true,
  },
  // Subscription expiration date
  expiresAt: {
    type: Date,
    required: true,
  },
})

const Subscription = model("Subscription", subscriptionSchema)

module.exports = Subscription
