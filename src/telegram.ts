type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function initTelegram() {
  const webApp = window.Telegram?.WebApp;
  webApp?.setHeaderColor?.("#f4f5f6");
  webApp?.setBackgroundColor?.("#f4f5f6");
  webApp?.ready?.();
  webApp?.expand?.();
  return webApp;
}
