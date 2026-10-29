import { test, expect } from "@playwright/test";

const sequence = ["resources-basics", "pods", "deployments", "networking", "ingress"];
test("five connected lessons remain readable with optional deep dives and persistent reading progress", async ({ page }) => {
  await page.goto("/#/paths/alltag");
  await page.getByRole("link", { name: "Zur nächsten ungelesenen Lektion", exact: true }).click();
  for (const [index, id] of sequence.entries()) {
    await expect(page).toHaveURL(new RegExp(`academy/${id}\\?path=alltag$`));
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("#section-internals")).not.toHaveAttribute("open", "");
    await expect(page.getByTestId("knowledge-check")).not.toBeVisible();
    await expect(page.locator("code.language-yaml").first()).toBeVisible();
    await page.getByRole("button", { name: "Als gelesen markieren", exact: true }).click();
    await expect(page.getByTestId("progress-save-status")).toHaveText("Lernstand lokal gespeichert");
    if (index < sequence.length - 1) await page.getByRole("link", { name: /^Nächstes Thema:/ }).click();
  }
  await page.reload();
  await expect(page.getByRole("button", { name: "Gelesen ✓ · Markierung aufheben" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/#/paths/alltag");
  for (const id of sequence) await expect(page.getByTestId(`topic-${id}`)).toContainText("Gelesen");
});

test("Deployment reuses reconciliation and links directly into the existing Controller deep dive", async ({ page }) => {
  await page.goto("/#/academy/deployments");
  const model = page.getByRole("region", { name: "Reconciliation-Experiment" });
  await expect(model).toContainText("Ist: 1 bereit");
  for (let i = 0; i < 4; i++) await model.getByRole("button", { name: "Regelkreis fortsetzen" }).click();
  await expect(model).toContainText("Ist: 3 bereit");
  await model.getByRole("button", { name: "Ausfall simulieren" }).click();
  await expect(model).toContainText("Ist: 1 bereit");
  await page.getByRole("link", { name: "Controller, Workqueues und Reconciliation", exact: true }).click();
  await expect(page).toHaveURL(/academy\/controllers\?section=internals$/);
  await expect(page.locator("#section-internals")).toHaveAttribute("open", "");
  await expect(page.locator("#section-internals")).toBeFocused();
});

test("five lessons are directly searchable and readable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [index, query] of ["kubectl", "Pods", "ReplicaSet", "DNS", "HTTP Zugriff"].entries()) {
    const id = sequence[index];
    await page.goto(`/#/discover?q=${encodeURIComponent(query)}`);
    await page.getByTestId(`topic-${id}`).locator("h3 a").click();
    await expect(page).toHaveURL(new RegExp(`academy/${id}$`));
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), id).toBe(true);
  }
});
