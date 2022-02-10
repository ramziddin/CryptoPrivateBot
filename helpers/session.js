const User = require("../models/User")
const { getUserTelegramId, getUser, updateUser } = require("./user")

const sessionCache = new Map()

const getSession = async (userTelegramId) => {
  if (sessionCache.has(userTelegramId)) {
    return sessionCache.get(userTelegramId)
  }

  const user = await getUser(userTelegramId)

  const sessionData = user?.session

  sessionCache.set(userTelegramId, sessionData)

  return sessionData
}

const setSession = async (userTelegramId, session) => {
  const user = await updateUser(userTelegramId, { session })

  const sessionData = user?.session || {}

  sessionCache.set(userTelegramId, sessionData)

  return sessionData
}

const sessionMiddleware = async (ctx, next) => {
  const id = await getUserTelegramId(ctx)

  const session = await getSession(id)

  ctx.session = session

  await next()

  await setSession(id, ctx.session)
}

module.exports = sessionMiddleware
