const { Stage } = require("telegraf")

const scenes = [
  require("./start"),
  require("./language"),
  require("./settings"),
  require("./channel"),
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

const stageMiddleware = stage.middleware()

module.exports = stageMiddleware
