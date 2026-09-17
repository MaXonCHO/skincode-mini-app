export async function configureBot(api, miniAppUrl) {
  const bot = await api("getMe");

  await api("setMyCommands", {
    commands: [
      { command: "start", description: "Открыть SkinCode" },
      { command: "app", description: "Запустить подбор оттенка" },
      { command: "help", description: "Как работает подбор" },
      { command: "tips", description: "Советы для точного подбора" },
    ],
  });

  await api("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Открыть SkinCode",
      web_app: { url: miniAppUrl },
    },
  });

  await api("setMyDescription", {
    description: "Подбор нового тонального средства по оттенку, который тебе уже подходит. Без фото.",
  });

  await api("setMyShortDescription", {
    short_description: "Твой тон — в новом флаконе. Демо-подбор без фото.",
  });

  return bot;
}
