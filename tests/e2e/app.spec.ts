import { test, expect } from "@playwright/test";
test("learning completion survives reload, export, reset, and import", async ({
  page,
}) => {
  await page.goto("/#/academy/linux");
  await page.getByLabel("cgroups", { exact: true }).check();
  await page.getByRole("button", { name: "Wissenscheck auswerten" }).click();
  await expect(
    page.getByTestId("knowledge-check").getByRole("status"),
  ).toContainText("Grundlagen abgeschlossen");
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  await page.reload();
  await expect(page.getByTestId("theory-status")).toBeVisible();
  await page.goto("/#/settings");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportieren", exact: true }).click();
  const file = await (await download).path();
  await page.getByRole("button", { name: "Lernstand zurücksetzen" }).click();
  await page.getByRole("button", { name: "Ja, zurücksetzen" }).click();
  await expect(
    page.getByText(
      "0 Grundlagenabschlüsse · 0 Praxisaufgaben · 0 Lab-Schritte",
    ),
  ).toBeVisible();
  await page.getByLabel("Lernstand importieren").setInputFiles(file!);
  await expect(page.getByRole("status")).toContainText(
    "erfolgreich importiert",
  );
  await expect(
    page.getByText(
      "1 Grundlagenabschlüsse · 0 Praxisaufgaben · 0 Lab-Schritte",
    ),
  ).toBeVisible();
});
test("Monaco applies manifests and terminal scales resources", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/operations");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page
    .getByRole("button", { name: "Simuliert anwenden", exact: true })
    .click();
  await expect(page.locator(".lab-graph .badge")).toHaveText("2 Pods");
  await page
    .getByLabel("Simulierten Befehl eingeben")
    .fill("kubectl scale deployment hello-kubelab --replicas=3");
  await page
    .getByRole("button", { name: "Simulierten Befehl ausführen" })
    .click();
  await expect(page.locator(".lab-graph .badge")).toHaveText("3 Pods");
  await page.getByRole("button", { name: "Ressourcen", exact: true }).click();
  await expect(page.locator(".resource-list")).toContainText("hello-kubelab");
  await page.getByRole("button", { name: "Challenge starten" }).click();
  await page.getByRole("button", { name: "Lab ersetzen", exact: true }).click();
  await expect(page.locator(".validation-status")).toContainText(
    "selector.matchLabels",
  );
  expect(errors).toEqual([]);
});
test("scheduler and build checkpoints work", async ({ page }) => {
  await page.goto("/#/visualizer");
  await page.getByLabel("CPU-Anforderung").fill("6");
  await expect(page.getByRole("status")).toContainText("Pending");
  await page.goto("/#/build");
  await page.getByRole("checkbox").check();
  await page.reload();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await expect(page.getByText("1/7 geprüft")).toBeVisible();
});
test("mobile navigation and dark mode remain usable without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Verstehen. Bauen. Meistern." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dunkles Design aktivieren" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page
    .getByRole("navigation", { name: "Hauptnavigation" })
    .getByRole("link", { name: "Academy" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Kubernetes von innen verstehen." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("all routes render with no runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/academy",
    "/academy/containers",
    "/academy/control-plane",
    "/build",
    "/operations",
    "/visualizer",
    "/settings",
  ]) {
    await page.goto("/#" + route);
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
