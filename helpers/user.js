const User = require("../models/User")

function getUserTelegramId(ctx) {
  return ctx.from.id
}

async function getUser(userTelegramId) {
  return await User.findOne({ id: userTelegramId }).exec()
}

async function getUserByCtx(ctx) {
  const userTelegramId = getUserTelegramId(ctx)
  const user = await getUser(userTelegramId)
  return user
}

async function createUser(userTelegramId) {
  return await User.create({ id: userTelegramId })
}

async function updateUser(userTelegramId, data) {
  return await User.findOneAndUpdate({ id: userTelegramId }, data, {
    new: true,
  }).exec()
}

module.exports = {
  getUserTelegramId,
  getUser,
  getUserByCtx,
  createUser,
  updateUser,
}
