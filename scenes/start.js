const { BaseScene, Markup } = require("telegraf")
const { getUserByCtx } = require("../helpers/user")

const startScene = new BaseScene("start")

startScene.enter(async (ctx) => {
  const user = await getUserByCtx(ctx)

  if (!user.language) {
    return await ctx.scene.enter("language")
  }

  const text = ctx.i18n.t("scenes.start")

  const extra = Markup.inlineKeyboard([
    [
      Markup.callbackButton(ctx.i18n.t("buttons.channels"), "channels"),
      Markup.callbackButton(ctx.i18n.t("buttons.settings"), "settings"),
    ],
  ]).extra()

  if (ctx.updateType === "callback_query") {
    await ctx.editMessageText(text, extra)
  } else {
    await ctx.reply(text, extra)
  }
})

startScene.action(/channels/, async (ctx) => {
  const user = await getUserByCtx(ctx)

  const channels = await Promise.all(
    user.channels.map(async (channelId) => {
      return await ctx.telegram.getChat(channelId)
    })
  )

  const extra = Markup.inlineKeyboard([
    ...channels.map((channel) => [
      Markup.callbackButton(channel.title, `channel:${channel.id}`),
    ]),
    [Markup.callbackButton(ctx.i18n.t("buttons.back"), "start")],
  ]).extra()

  await ctx.editMessageText(ctx.i18n.t("scenes.channels"), extra)
})

module.exports = startScene
