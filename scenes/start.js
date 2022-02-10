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
      Markup.callbackButton(ctx.i18n.t("buttons.channels"), "_"),
      Markup.callbackButton(ctx.i18n.t("buttons.subscriptions"), "_"),
    ],
    [Markup.callbackButton(ctx.i18n.t("buttons.settings"), "settings")],
  ]).extra()

  if (ctx.updateType === "callback_query") {
    await ctx.editMessageText(text, extra)
  } else {
    await ctx.reply(text, extra)
  }
})

module.exports = startScene
