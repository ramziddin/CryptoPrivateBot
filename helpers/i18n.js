const path = require("path")
const TelegrafI18n = require("telegraf-i18n")

const i18n = new TelegrafI18n({
  defaultLanguage: "en",
  allowMissing: false,
  directory: path.resolve(__dirname, "../locales"),
  useSession: true,
})

const i18nMiddleware = i18n.middleware()

module.exports = i18nMiddleware
