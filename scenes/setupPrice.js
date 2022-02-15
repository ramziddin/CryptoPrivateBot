const { BaseScene, Markup } = require("telegraf")
const { getChannel, updateChannel } = require("../helpers/channel")
const { CURRENCIES } = require("../helpers/constants")

const setupPriceScene = new BaseScene("setupPrice")

setupPriceScene.enter(async (ctx) => {
  const { channelId } = ctx.scene.state

  if (!channelId) return ctx.scene.enter("start")

  ctx.scene.state.channelId = channelId

  const channel = await getChannel(channelId)

  const currentPrice =
    channel.price && channel.currency
      ? `${channel.price} ${channel.currency}`
      : ctx.i18n.t("notifications.notSetup")

  const text = ctx.i18n.t("scenes.setupPrice", {
    currentPrice,
  })

  const extra = Markup.inlineKeyboard([
    [Markup.callbackButton(ctx.i18n.t("buttons.back"), `channel:${channelId}`)],
  ]).extra()

  await ctx.editMessageText(text, extra)
})

setupPriceScene.hears(
  RegExp(
    `^(\\d{1,2}(?:\\.\\d{0,2})?|\\.\\d{1,2})\\s*(${CURRENCIES.join("|")})$`
  ),
  async (ctx) => {
    const { channelId } = ctx.scene.state

    if (!channelId) return ctx.scene.enter("start")

    const [, price, currency] = ctx.match

    const priceFloat = parseFloat(price)

    await updateChannel(channelId, { price: priceFloat, currency })

    await ctx.reply(
      ctx.i18n.t("notifications.priceUpdated", {
        price: priceFloat,
        currency,
      })
    )

    await ctx.scene.enter("channel", {
      channelId,
    })
  }
)

module.exports = setupPriceScene
