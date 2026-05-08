import { test, expect } from "@playwright/test";

const PREFS = "kiduki-insight-prefs-v1";
const PROFILE = "kiduki-insight-profile-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((profileKey) => {
    try {
      localStorage.removeItem(profileKey);
    } catch {
      /* ignore */
    }
  }, PROFILE);
});

/** LS を書いてリロードし、AIオフを確実に初期化（Strict Mode 下单体テスト向け） */
async function gotoWithAiOff(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({ useAiEnhancement: false }));
  }, PREFS);
  await page.reload();
  await page.locator("#use-ai-toggle").waitFor({ state: "visible" });
  await expect(page.locator("#use-ai-toggle")).not.toBeChecked({
    timeout: 15_000,
  });
}

test.describe("診察前フロー（AIオフ）", () => {
  test("最初から結果まで到達できる", async ({ page }) => {
    await gotoWithAiOff(page);

    await page.getByLabel("生年月日").fill("1990-05-01");
    await page.getByRole("radio", { name: "男性" }).check();
    await page.getByRole("button", { name: "次へ" }).click();

    await expect(page.getByText(/いまの設定は.*通信なし/i)).toBeVisible();

    await page
      .getByPlaceholder(/例：症状がいつまで続くか/i)
      .fill("胸の痛みが続いていて不安です");
    await page.getByRole("button", { name: "次へ" }).click();

    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "そう感じることが多い" }).click();
    }

    await expect(
      page.getByRole("button", { name: "すべてコピー" })
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/次に考えてみる問い/i)).toBeVisible();
  });

  test("途中で戻ることができる", async ({ page }) => {
    await gotoWithAiOff(page);

    await page.getByLabel("生年月日").fill("1990-05-01");
    await page.getByRole("radio", { name: "男性" }).check();
    await page.getByRole("button", { name: "次へ" }).click();
    await page.getByPlaceholder(/例：症状がいつまで続くか/i).fill("テスト");
    await page.getByRole("button", { name: "次へ" }).click();

    await page.getByRole("button", { name: "そう感じることが多い" }).click();
    await page.getByRole("button", { name: "← 戻る" }).click();

    await expect(
      page.getByPlaceholder(/例：症状がいつまで続くか/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
