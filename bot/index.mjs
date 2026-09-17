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

function appAsset(miniAppUrl, filename) {
  return new URL(`/assets/${filename}`, miniAppUrl).toString();
}

async function sendIllustratedMessage(api, payload) {
  try {
    await api("sendPhoto", payload);
  } catch (error) {
    console.warn(error instanceof Error ? `${error.message} Falling back to text.` : "Could not send image. Falling back to text.");
    await api("sendMessage", {
      chat_id: payload.chat_id,
      text: payload.caption,
      reply_markup: payload.reply_markup,
    });
  }
}

async function sendWelcome(api, chatId, miniAppUrl) {
  await sendIllustratedMessage(api, {
    chat_id: chatId,
    photo: appAsset(miniAppUrl, "skincode-foundation-hero-ui.png"),
    caption: "Твой тон — в новом флаконе.\n\nДобавь знакомое тональное средство и его оттенок — SkinCode покажет близкие варианты без фото и сканирования.",
    reply_markup: appKeyboard(miniAppUrl),
  });
}

async function sendHelp(api, chatId, miniAppUrl) {
  await sendIllustratedMessage(api, {
    chat_id: chatId,
    photo: appAsset(miniAppUrl, "foundation-smear-ui.png"),
    caption: "Как работает SkinCode:\n\n1. Добавь одно или несколько знакомых тональных средств.\n2. Укажи оттенок и оцени, как каждый из них выглядит на коже.\n3. Настрой финиш и бюджет — и получи рекомендации.",
    reply_markup: appKeyboard(miniAppUrl),
  });
}

async function sendTips(api, chatId, miniAppUrl) {
  await sendIllustratedMessage(api, {
    chat_id: chatId,
    photo: appAsset(miniAppUrl, "skincode-foundation-catalog-ui.png"),
    caption: "Три подсказки для более точного результата:\n\n• Проверь код оттенка на упаковке.\n• Добавь несколько средств, если пользуешься ими в разные сезоны.\n• Оцени рекомендации при дневном свете перед покупкой.",
    reply_markup: appKeyboard(miniAppUrl),
  });
}

async function handleMessage(api, message, miniAppUrl) {
  const chatId = message.chat?.id;
  if (!chatId) return;

  if (message.web_app_data?.data) {
    await api("sendMessage", {
      chat_id: chatId,
      text: "Готово — данные из SkinCode получены. Сохранённые оттенки можно открыть в приложении в любой момент.",
      reply_markup: appKeyboard(miniAppUrl),
    });
    return;
  }

  const command = message.text?.trim().split(/\s+/, 1)[0]?.split("@", 1)[0];
  if (command === "/start" || command === "/app") {
    await sendWelcome(api, chatId, miniAppUrl);
    return;
  }

  if (command === "/help") {
    await sendHelp(api, chatId, miniAppUrl);
    return;
  }

  if (command === "/tips") {
    await sendTips(api, chatId, miniAppUrl);
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
