const { BaseScene, Markup } = require("telegraf")
const {
  getChannel,
  isChannelActive,
  updateChannel,
  canChannelActivate,
} = require("../helpers/channel")

const channelScene = new BaseScene("channel")

channelScene.enter(async (ctx) => {
  const { channelId } = ctx.scene.state

  if (!channelId) return ctx.scene.enter("start")

  let channelChat

  try {
    channelChat = await ctx.telegram.getChat(channelId)
  } catch (e) {
    await ctx.answerCbQuery(ctx.i18n.t("notifications.noAccessToChannel"), true)
    return
  }

  const channel = await getChannel(channelId)
  const isActive = isChannelActive(channel)

  const text = ctx.i18n.t("scenes.channel", {
    channelTitle: channelChat.title,
  })

  const extra = Markup.inlineKeyboard([
    [
      Markup.callbackButton(
        ctx.i18n.t("buttons.subscriptionPrice"),
        `setupPrice:${channelId}`
      ),
      Markup.callbackButton(
        ctx.i18n.t("buttons.channelLink"),
        `setupLink:${channelId}`
      ),
    ],
    [
      Markup.callbackButton(
        isActive
          ? ctx.i18n.t("buttons.subscriptionActivated")
          : ctx.i18n.t("buttons.subscriptionDeactivated"),
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
    await ctx.scene.enter("channel", { channelId })
  } else {
    await ctx.answerCbQuery(ctx.i18n.t("notifications.canNotActivate"), true)
  }
})

module.exports = channelScene
