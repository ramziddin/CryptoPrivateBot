const { model, Schema } = require("mongoose")

// Represents a Telegram user
const userSchema = new Schema(
  {
    // Telegram user ID
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    // User's language
    language: {
      type: String,
      enum: ["en", "ru"],
    },
    // Persisted session data on ctx.session
    session: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // List of managed channels (Telegram channel IDs)
    channels: [Number],
  },
  {
    minimize: false,
  }
)

const User = model("User", userSchema)

module.exports = User
