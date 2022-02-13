const Channel = require("../models/Channel")

async function getChannel(channelId) {
  return await Channel.findOne({ id: channelId }).exec()
}

async function createChannel(channelId) {
  return await Channel.create({ id: channelId })
}

async function updateChannel(channelId, data) {
  return await Channel.findOneAndUpdate({ id: channelId }, data, {
    new: true,
    runValidators: true,
  }).exec()
}

async function deleteChannel(channelId) {
  return await Channel.remove({ id: channelId }).exec()
}

function canChannelActivate(channel) {
  return (
    channel &&
    channel.active &&
    channel.price &&
    channel.link &&
    channel.currency
  )
}

module.exports = {
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
  canChannelActivate,
}
