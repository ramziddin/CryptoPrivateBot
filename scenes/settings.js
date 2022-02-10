const { BaseScene, Markup } = require("telegraf")

const settingsScene = new BaseScene("settings")

settingsScene.enter(async (ctx) => {
  const text = ctx.i18n.t("scenes.settings")

  const extra = Markup.inlineKeyboard([
    [Markup.callbackButton(ctx.i18n.t("buttons.language"), "language")],
    [Markup.callbackButton(ctx.i18n.t("buttons.back"), "start")],
  ]).extra()

  if (ctx.updateType === "callback_query") {
    await ctx.editMessageText(text, extra)
  } else {
    await ctx.reply(text, extra)
  }
})

module.exports = settingsScene
