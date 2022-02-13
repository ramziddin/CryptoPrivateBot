const { BaseScene, Markup } = require("telegraf")
const {
  getChannel,
  canChannelActivate,
  updateChannel,
} = require("../helpers/channel")

const channelScene = new BaseScene("channel")

channelScene.enter(async (ctx) => {
  const { channelId } = ctx.scene.state

  if (!channelId) return ctx.scene.enter("start")

  let channel

  try {
    channel = await ctx.telegram.getChat(channelId)
  } catch (e) {
    await ctx.answerCbQuery(ctx.i18n.t("notifications.noAccessToChannel"), true)
    return
  }

  const text = ctx.i18n.t("scenes.channel", {
    channelTitle: channel.title,
  })

  const extra = Markup.inlineKeyboard([
    [
      Markup.callbackButton("Price", `___`),
      Markup.callbackButton("Currency", `___`),
    ],
    [Markup.callbackButton("Channel link", `___`)],
    [
      Markup.callbackButton(
        "Subscription: Deactivated",
        `toggle-subs:${channelId}`
      ),
    ],
  ]).extra()

  if (ctx.updateType === "callback_query") {
    await ctx.editMessageText(text, extra)
  } else {
    await ctx.reply(text, extra)
  }
})

channelScene.action(/toggle-subs:(.*)/, async (ctx) => {
  const channelId = ctx.match[1]

  const channel = await getChannel(channelId)

  if (canChannelActivate(channel)) {
    await updateChannel(channelId, { active: !channel.active })
  } else {
    await ctx.answerCbQuery(ctx.i18n.t("canNotActivate"), true)
  }

  await ctx.scene.enter("channel", { channelId })
})

module.exports = channelScene
