import { getBotConfig } from "./config.mjs";
import { configureBot } from "./configure.mjs";
import { createTelegramClient } from "./telegram.mjs";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function appKeyboard(miniAppUrl) {
  return {
    inline_keyboard: [[
      {
        text: "Открыть SkinCode",
        web_app: { url: miniAppUrl },
      },
    ]],
  };
}

async function sendWelcome(api, chatId, miniAppUrl) {
  await api("sendMessage", {
    chat_id: chatId,
    text: "Твой тон — в новом флаконе. Выбери средство, которое уже подходит, и посмотри предварительные варианты без фото.",
    reply_markup: appKeyboard(miniAppUrl),
  });
}

async function handleMessage(api, message, miniAppUrl) {
  const chatId = message.chat?.id;
  if (!chatId) return;

  if (message.web_app_data?.data) {
    await api("sendMessage", {
      chat_id: chatId,
      text: "Данные из SkinCode получены.",
    });
    return;
  }

  const command = message.text?.trim().split(/\s+/, 1)[0]?.split("@", 1)[0];
  if (command === "/start" || command === "/app") {
    await sendWelcome(api, chatId, miniAppUrl);
    return;
  }

  if (command === "/help") {
    await api("sendMessage", {
      chat_id: chatId,
      text: "SkinCode сравнивает выбранный тобой знакомый оттенок с демонстрационной локальной базой. Результаты предварительные — проверяй средство при дневном свете.",
      reply_markup: appKeyboard(miniAppUrl),
    });
    return;
  }

  await sendWelcome(api, chatId, miniAppUrl);
}

async function main() {
  const { token, miniAppUrl } = getBotConfig();
  const api = createTelegramClient(token);
  const bot = await configureBot(api, miniAppUrl);
  let offset = 0;
  let stopping = false;
  let activeRequest;

  const stop = () => {
    stopping = true;
    activeRequest?.abort();
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  console.log(`@${bot.username} is running. Mini App: ${miniAppUrl}`);

  while (!stopping) {
    activeRequest = new AbortController();
    try {
      const updates = await api("getUpdates", {
        offset,
        timeout: 25,
        allowed_updates: ["message"],
      }, { signal: activeRequest.signal });

      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) {
          await handleMessage(api, update.message, miniAppUrl);
        }
      }
    } catch (error) {
      if (stopping && error?.name === "AbortError") break;
      console.error(error instanceof Error ? error.message : "Polling failed.");
      await delay(2000);
    }
  }

  console.log("Bot stopped.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Bot failed to start.");
  process.exitCode = 1;
});
