# [🔒 Crypto Private Bot](https://t.me/CryptoPrivateBot)

Easily monetize your Telegram channels via the [Crypto Pay API](https://t.me/CryptoBotEN/34).

This bot was created to win the [Crypto Bot Contest](https://t.me/CryptoBotRU/74).

Developed with ❤️ by [@RamzCoder](https://t.me/RamzCoder).

## Development

1. Install dependencies via `npm install`

2. Copy the `.env.example` file into a `.env` file.

3. In `.env` file set the following environment variables:

    ```env
    NODE_ENV=development
    BOT_TOKEN=<your test bot token>
    MONGODB_URI=<your local mongodb instance uri>
    CRYPTO_PAY_TOKEN=<your crypto pay api token>
    ```

4. Start the bot using `npm start`

**Please note:** Running the bot with `NODE_ENV=development` deletes the webhook to start polling. Make sure to use a non-production token in `BOT_TOKEN` environment variable.
