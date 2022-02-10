const { model, Schema } = require("mongoose")

// Represents a Telegram user
const userSchema = new Schema(
  {
    // Telegram user ID
    id: {
      type: Number,
      unique: true,
    },
    language: {
      type: String,
      enum: ["en", "ru"],
    },
    session: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    minimize: false,
  }
)

const User = model("User", userSchema)

module.exports = User
