import { getBotConfig } from "./config.mjs";
import { configureBot } from "./configure.mjs";
import { createTelegramClient } from "./telegram.mjs";

try {
  const { token, miniAppUrl } = getBotConfig();
  const api = createTelegramClient(token);
  const bot = await configureBot(api, miniAppUrl);

  console.log(`Configured @${bot.username} to open ${miniAppUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Bot setup failed.");
  process.exitCode = 1;
}
