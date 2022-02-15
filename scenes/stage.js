const { Stage } = require("telegraf")

const scenes = [
  require("./start"),
  require("./language"),
  require("./settings"),
  require("./channel"),
  require("./setupPrice"),
  require("./setupLink"),
]

const stage = new Stage(scenes)

stage.start(async (ctx) => await ctx.scene.enter("start"))

// Register each scene to the stage,
// to be able to navigate to the scene
// from any other scene.
scenes.forEach((scene) => {
  stage.action(scene.id, async (ctx) => {
    await ctx.scene.enter(scene.id)
  })
})

stage.action(/channel:(.*)/, async (ctx) => {
  const channelId = ctx.match[1]
  await ctx.scene.enter("channel", { channelId })
})

stage.action(/setupPrice:(.*)/, async (ctx) => {
  const channelId = ctx.match[1]
  await ctx.scene.enter("setupPrice", { channelId })
})

stage.action(/setupLink:(.*)/, async (ctx) => {
  const channelId = ctx.match[1]
  await ctx.scene.enter("setupLink", { channelId })
})

const stageMiddleware = stage.middleware()

module.exports = stageMiddleware
