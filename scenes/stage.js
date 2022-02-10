const { Stage } = require("telegraf")

const scenes = [
  require("./start"),
  require("./language"),
  require("./settings"),
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

const stageMiddleware = stage.middleware()

module.exports = stageMiddleware
