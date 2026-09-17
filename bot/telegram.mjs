export function createTelegramClient(token) {
  return async function callTelegram(method, payload = {}, options = {}) {
    let response;

    try {
      response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: options.signal,
      });
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      throw new Error(`Telegram API request failed while calling ${method}.`);
    }

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) {
      const description = body?.description || `HTTP ${response.status}`;
      throw new Error(`Telegram ${method} failed: ${description}`);
    }

    return body.result;
  };
}
