export function getBotConfig(env = process.env) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const miniAppUrl = env.MINI_APP_URL?.trim();

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing. Add the rotated token to the local .env file.");
  }

  if (!miniAppUrl) {
    throw new Error("MINI_APP_URL is missing. Add the deployed HTTPS website URL to the local .env file.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(miniAppUrl);
  } catch {
    throw new Error("MINI_APP_URL must be a valid absolute URL.");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("MINI_APP_URL must use HTTPS for a production Telegram Mini App.");
  }

  return Object.freeze({ token, miniAppUrl: parsedUrl.toString() });
}
