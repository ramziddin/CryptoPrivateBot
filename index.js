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
  CRYPTO_PAY_TOKEN,
} = require("./helpers/env")
const {
  getUserTelegramId,
  createUser,
  getUser,
  updateUser,
} = require("./helpers/user")
const { cryptoPay } = require("./helpers/cryptoPay")
const {
  getChannel,
  createChannel,
  deleteChannel,
  isChannelActive: isChannelActive,
} = require("./helpers/channel")
const {
  createOneMonthOfSubscription,
  checkSubscription,
} = require("./helpers/subscription")
const bodyParser = require("body-parser")

async function main() {
  await mongoose.connect(MONGODB_URI)

  const bot = new Telegraf(BOT_TOKEN)

  bot.use(i18nMiddleware)

  bot.use(async (ctx, next) => {
    // If the received message is from a private chat
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

    // If a bot was added/removed to/from a chat
    const myChatMember = ctx.update.my_chat_member
    if (myChatMember) {
      const { chat, new_chat_member, old_chat_member } = myChatMember

      if (chat.type === "channel") {
        const id = getUserTelegramId(myChatMember)

        const user = await getUser(id)

        ctx.i18n.locale(user?.language || "en")

        // Bot was added to a channel as an admin
        if (new_chat_member.status === "administrator") {
          const admins = await ctx.telegram.getChatAdministrators(chat.id)

          const channelOwner = admins.filter(
            (admin) => admin.status === "creator"
          )[0]

          const channelOwnerId = channelOwner.user.id

          // If bot was added to a channel not by the owner
          if (id !== channelOwnerId) {
            await ctx.telegram.sendMessage(
              id,
              ctx.i18n.t("notifications.notAnOwner", {
                channelTitle: chat.title,
              })
            )

            await ctx.telegram.leaveChat(chat.id)

            return
          }

          const hasRequiredPermissions =
            new_chat_member.can_restrict_members &&
            new_chat_member.can_invite_users

          const hadRequiredPersmissions =
            old_chat_member.can_restrict_members &&
            old_chat_member.can_invite_users

          // If bot has the required permissions
          if (hasRequiredPermissions && !hadRequiredPersmissions) {
            const channel = await getChannel(chat.id)

            if (!channel) {
              await createChannel(chat.id)
            }

            if (!user.channels.includes(chat.id)) {
              await updateUser(id, {
                channels: [...user.channels, chat.id],
              })
            }

            await ctx.telegram.sendMessage(
              id,
              ctx.i18n.t("notifications.canManage", {
                channelTitle: chat.title,
              }),
              Markup.inlineKeyboard([
                [
                  Markup.callbackButton(
                    ctx.i18n.t("buttons.manage"),
                    `channel:${chat.id}`
                  ),
                ],
              ]).extra()
            )
          }

          // If bot lost the required permissions
          if (!hasRequiredPermissions && hadRequiredPersmissions) {
            await ctx.telegram.sendMessage(
              id,
              ctx.i18n.t("notifications.canNotManage", {
                channelTitle: chat.title,
              })
            )
          }
        }

        // If the bot was removed from a channel
        if (new_chat_member.status === "left") {
          await deleteChannel(chat.id)
        }
      }
    }

    // On new chat join request
    const joinRequest = ctx.update.chat_join_request
    if (joinRequest) {
      const issuerId = joinRequest.from.id
      const issuer = await getUser(issuerId)

      ctx.i18n.locale(issuer?.language || "en")

      const { id: channelId, title: channelTitle } = joinRequest.chat

      const channel = await getChannel(channelId)
      const channelChat = await ctx.telegram.getChat(channelId)

      console.log(channel, channelChat, issuer)

      if (!isChannelActive(channel)) return

      if (checkSubscription(issuerId, channelId)) {
        await ctx.telegram.sendMessage(
          issuerId,
          ctx.i18n.t("notifications.subscriptionApproved", {
            channelTitle: channelChat.title,
            channelLink: channel.link,
          }),
          {
            parse_mode: "HTML",
          }
        )

        return ctx.telegram.callApi("approveChatJoinRequest", {
          chat_id: channelId,
          user_id: issuerId,
        })
      }

      const user = await getUser(issuerId)

      ctx.i18n.locale(user?.language || "en")

      const payload = `${user.id}:${channelId}`

      const invoice = await cryptoPay.createInvoice(
        channel.currency,
        channel.price,
        {
          payload,
          paid_btn_name: "openChannel",
          paid_btn_url: channel.link,
        }
      )

      try {
        await ctx.telegram.sendMessage(
          issuerId,
          ctx.i18n.t("notifications.joinRequest", {
            channelTitle,
          }),
          Markup.inlineKeyboard([
            [
              Markup.urlButton(
                ctx.i18n.t("buttons.paySubscription", {
                  price: channel.price,
                  currency: channel.currency,
                }),
                invoice.pay_url
              ),
            ],
          ]).extra()
        )
      } catch (e) {
        // The user probably blocked our bot...
      }
    }
  })

  bot.use(sessionMiddleware)
  bot.use(stageMiddleware)

  await bot.telegram.setMyCommands([
    {
      command: "start",
      description: "Main menu",
    },
  ])

  bot.command("start", async (ctx) => {
    await ctx.scene.enter("start")
  })

  // If NODE_ENV is "development", delete a webhook and start polling.
  if (NODE_ENV === "development") {
    bot.telegram.deleteWebhook()
    bot.startPolling()
  }

  // If NODE_ENV is "production", set a webhook for a given BOT_TOKEN and
  // start listening for updates on a given PORT.
  if (NODE_ENV === "production") {
    const webhookRoute = `bot${BOT_TOKEN}`

    await bot.telegram.setWebhook(`${APP_URL}${webhookRoute}`)

    const server = express()

    server.use(bot.webhookCallback(`/${webhookRoute}`))

    server.use(bodyParser.json())

    server.post(`/${CRYPTO_PAY_TOKEN}`, async (req, res) => {
      const {
        update_type,
        payload: { payload },
      } = req.body

      if (update_type === "invoice_paid") {
        const [userId, channelId] = payload.split(":")

        await createOneMonthOfSubscription(userId, channelId)

        // approveChatJoinRequest is not supported by telegraf@^3.39.0
        await bot.telegram.callApi("approveChatJoinRequest", {
          chat_id: channelId,
          user_id: userId,
        })

        await res.end()
      }
    })

    server.listen(PORT)
  }
}

main()
