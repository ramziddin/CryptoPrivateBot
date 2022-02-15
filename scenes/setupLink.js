const { BaseScene, Markup } = require("telegraf")
const { getChannel, updateChannel } = require("../helpers/channel")
const { CURRENCIES } = require("../helpers/constants")

const setupLinkScene = new BaseScene("setupLink")

setupLinkScene.enter(async (ctx) => {
  const { channelId } = ctx.scene.state

  if (!channelId) return ctx.scene.enter("start")

  ctx.scene.state.channelId = channelId

  const channel = await getChannel(channelId)

  const currentLink = channel.link || ctx.i18n.t("notifications.notSetup")

  const text = ctx.i18n.t("scenes.setupLink", {
    currentLink,
  })

  const extra = Markup.inlineKeyboard([
    [Markup.callbackButton(ctx.i18n.t("buttons.back"), `channel:${channelId}`)],
  ]).extra()

  await ctx.editMessageText(text, extra)
})

setupLinkScene.hears(/^(?:https\:\/\/)?t\.me\/.+$/, async (ctx) => {
  const { channelId } = ctx.scene.state

  if (!channelId) return ctx.scene.enter("start")

  const [link] = ctx.match

  await updateChannel(channelId, { link })

  await ctx.reply(ctx.i18n.t("notifications.linkUpdated", { link }))

  await ctx.scene.enter("channel", {
    channelId,
  })
})

module.exports = setupLinkScene
