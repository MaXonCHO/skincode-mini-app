import { describe, expect, it } from "vitest";
import { getBotConfig } from "./config.mjs";

describe("getBotConfig", () => {
  it("accepts a server-side token and HTTPS Mini App URL", () => {
    expect(getBotConfig({ TELEGRAM_BOT_TOKEN: "test-token", MINI_APP_URL: "https://example.com/app" })).toEqual({
      token: "test-token",
      miniAppUrl: "https://example.com/app",
    });
  });

  it("rejects an insecure production URL", () => {
    expect(() => getBotConfig({ TELEGRAM_BOT_TOKEN: "test-token", MINI_APP_URL: "http://example.com" })).toThrow("HTTPS");
  });

  it("requires the token without revealing its value", () => {
    expect(() => getBotConfig({ MINI_APP_URL: "https://example.com" })).toThrow("TELEGRAM_BOT_TOKEN is missing");
  });
});
