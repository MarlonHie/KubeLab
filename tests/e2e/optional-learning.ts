import { expect, type Page } from "@playwright/test";
// Regression tests explicitly opt into exercises. Normal visits leave them closed.
export async function openOptionalLearning(page: Page) {
  await expect(page.locator("main h1")).toBeVisible();
  const records = page.locator(".optional-records:not([open]) > summary");
  if (await records.isVisible()) await records.click();
  for (const summary of await page
    .locator(".optional-exercise > summary")
    .all()) {
    if (
      (await summary.isVisible()) &&
      !((await summary.locator("..").getAttribute("open")) !== null)
    )
      await summary.click();
  }
}
