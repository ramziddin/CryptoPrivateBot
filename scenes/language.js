const { BaseScene, Markup } = require("telegraf")
const { wrapStringWithBullets } = require("../helpers/wrapString")
const {
  getUserByCtx,
  getUserTelegramId,
  updateUser,
} = require("../helpers/user")

const languageScene = new BaseScene("language")

languageScene.enter(async (ctx) => {
  const text = ctx.i18n.t("scenes.language")

  const user = await getUserByCtx(ctx)

  const buttons = [
    [
      ["English", "language:en"],
      ["Русский", "language:ru"],
    ],
  ]
    .map((row) => {
      return row.map(([text, language]) => {
        const buttonLanguage = language.split(":")[1]
        const isSelected = user?.language === buttonLanguage
        const formattedText = isSelected ? wrapStringWithBullets(text) : text

        return Markup.callbackButton(formattedText, language)
      })
    })
    .concat([
      [
        Markup.callbackButton(
          ctx.i18n.t("buttons.back"),
          "settings",
          !user?.language
        ),
      ],
    ])

  const extra = Markup.inlineKeyboard(buttons).extra()

  if (ctx.updateType === "callback_query") {
    await ctx.editMessageText(text, extra)
  } else {
    await ctx.reply(text, extra)
  }
})

languageScene.action(/language:(en|ru)/, async (ctx) => {
  const [, language] = ctx.match

  const id = getUserTelegramId(ctx)

  ctx.i18n.locale(language)

  await updateUser(id, { language })

  await ctx.scene.enter("start")
})

module.exports = languageScene
