const express = require("express")
const mongoose = require("mongoose")
const { Telegraf, Markup } = require("telegraf")
const i18nMiddleware = require("./helpers/i18n")
const stageMiddleware = require("./scenes/stage")
const sessionMiddleware = require("./helpers/session")
const {
  NODE_ENV,
  BOT_TOKEN,
  MONGODB_URI,
  APP_URL,
  PORT,
} = require("./helpers/env")
const { getUserTelegramId, createUser, getUser } = require("./helpers/user")
const { cryptoPay } = require("./helpers/cryptoPay")

async function main() {
  await mongoose.connect(MONGODB_URI)

  const bot = new Telegraf(BOT_TOKEN)

  bot.use(i18nMiddleware)

  bot.use(async (ctx, next) => {
    // If the received message is a private chat
    if (ctx.chat?.type === "private") {
      const id = getUserTelegramId(ctx)
      const user = await getUser(id)

      // Set a default language or use the one from the user.
      // A default language is set in case user messaged the first time,
      // without choosing a language.
      ctx.i18n.locale(user?.language || "en")

      if (!user) {
        await createUser(id)
      }

      return await next()
    }

    // If a bot was added/removed to/from a channel
    const myChatMember = ctx.update.my_chat_member
    if (myChatMember) {
      const { chat, from, new_chat_member, old_chat_member } = myChatMember

      if (chat.type === "channel") {
        const id = from.id
        const user = await getUser(id)

        ctx.i18n.locale(user?.language || "en")

        // Bot was added to a channel as an admin
        if (new_chat_member.status === "administrator") {
          const admins = await ctx.telegram.getChatAdministrators(chat.id)
          const owner = admins.filter((admin) => admin.status === "creator")[0]
          const ownerId = owner.user.id

          // If bot was added to a channel not by the owner
          if (id !== ownerId) {
            await ctx.telegram.sendMessage(
              id,
              ctx.i18n.t("notifications.notAnOwner", {
                channelTitle: chat.title,
              })
            )

            return
          }

          const hasRequiredPermissions =
            new_chat_member.can_restrict_members &&
            new_chat_member.can_invite_users

          const hadRequiredPersmissions =
            old_chat_member.can_restrict_members &&
            old_chat_member.can_invite_users

          // If bot can manage subscribers
          if (hasRequiredPermissions && !hadRequiredPersmissions) {
            await ctx.telegram.sendMessage(
              ownerId,
              ctx.i18n.t("notifications.canManage", {
                channelTitle: chat.title,
              }),
              Markup.inlineKeyboard([
                [Markup.callbackButton(ctx.i18n.t("buttons.manage"), "_")],
              ]).extra()
            )
          } else if (!hasRequiredPermissions && hadRequiredPersmissions) {
            await ctx.telegram.sendMessage(
              ownerId,
              ctx.i18n.t("notifications.canNotManage", {
                channelTitle: chat.title,
              })
            )
          }
        }
      }
    }

    // On new channel join request
    const joinRequest = ctx.update.chat_join_request
    if (joinRequest) {
      const channelTitle = joinRequest.chat.title
      const issuerId = joinRequest.from.id

      const user = await getUser(issuerId)

      ctx.i18n.locale(user?.language || "en")

      const invoice = await cryptoPay.createInvoice("TON", "0.01", {
        paid_btn_name: "openChannel",
        paid_btn_url: `https://t.me/RamzCoder`,
      })

      try {
        await ctx.telegram.sendMessage(
          issuerId,
          ctx.i18n.t("notifications.joinRequest", {
            channelTitle,
          }),
          Markup.inlineKeyboard([
            [
              Markup.urlButton(
                ctx.i18n.t("buttons.paySubscription"),
                invoice.pay_url
              ),
            ],
          ]).extra()
        )
      } catch (e) {
        console.dir(e, { depth: null })
      }
    }
  })

  bot.use(sessionMiddleware)
  bot.use(stageMiddleware)

  await bot.telegram.setMyCommands([])

  bot.command("start", async (ctx) => {
    await ctx.scene.enter("start")
  })

  if (NODE_ENV === "development") {
    bot.startPolling()
  } else if (NODE_ENV === "production") {
    const webhookRoute = `bot${BOT_TOKEN}`

    await bot.telegram.setWebhook(`${APP_URL}${webhookRoute}`)

    const server = express()

    server.use(bot.webhookCallback(`/${webhookRoute}`))

    server.listen(PORT)
  }
}

main()
