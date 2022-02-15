const moment = require("moment")
const Subscription = require("../models/Subscription")

async function checkSubscription(userId, channelId) {
  // Check if the subscription already exists
  const subscription = await Subscription.exists({ userId, channelId }).exec()

  if (subscription) {
    // If subscription is expired, delete it and return false
    if (moment().isAfter(subscription.expiresAt)) {
      await Subscription.remove({ userId, channelId }).exec()
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}

async function createOneMonthOfSubscription(userId, channelId) {
  // Check if the subscription already exists
  const subscription = await Subscription.findOne({ userId, channelId }).exec()

  if (subscription) {
    // Extend subscription by 1 month
    subscription.expiresAt = moment(subscription.expiresAt).add(1, "month")
    subscription.save()

    return subscription
  } else {
    // Create new subscription
    return await Subscription.create({
      userId,
      channelId,
      expiresAt: moment().add(1, "month"),
    })
  }
}

module.exports = {
  checkSubscription,
  createOneMonthOfSubscription,
}
