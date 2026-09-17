# SkinCode Telegram bot

The bot opens the deployed SkinCode site as a Telegram Mini App from its persistent menu button and from `/start` or `/app` messages.

## Security first

If a token has appeared in chat, logs, screenshots, or source code, revoke it in BotFather and generate a new one. Never use a `VITE_` prefix for the bot token: Vite exposes those variables to every browser user.

## Configure

1. Deploy the Vite frontend to a public HTTPS URL.
2. Copy `.env.example` to `.env` locally.
3. Put the rotated token in `TELEGRAM_BOT_TOKEN` and the deployed URL in `MINI_APP_URL`.
4. Run `npm run bot:setup` once to set commands, descriptions, and the persistent Mini App menu button.
5. Run `npm run bot:start` on a continuously running server to answer `/start`, `/app`, and `/help`.

The `.env` file is ignored by version control. The bot uses Node's built-in `fetch`; no additional runtime dependency is required.

Official documentation: https://core.telegram.org/bots/webapps and https://core.telegram.org/bots/api#setchatmenubutton
