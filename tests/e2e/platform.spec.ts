import { test, expect } from "@playwright/test";

test("A: beginner finds a voluntary path and can read without an assessment", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kubernetes verstehen.",
  );
  await page
    .getByRole("link", { name: "Kubernetes verstehen starten", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Kubernetes verstehen",
  );
  await page
    .getByRole("link", {
      name: "Zur nächsten ungelesenen Lektion",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/academy\/linux\?path=verstehen/);
  await expect(page.getByTestId("knowledge-check")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Als gelesen markieren", exact: true })
    .click();
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Gelesen ✓ · Markierung aufheben" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen offen",
  );
  await page.goto("/");
  await expect(
    page.getByRole("complementary", { name: "Weiterlernen" }),
  ).toContainText("Kubernetes verstehen");
});
test("B: an existing-cluster developer opens Zalando directly with no mandatory quiz", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Was möchtest du über Kubernetes lernen?")
    .fill("Zalando Operator");
  await page.getByRole("button", { name: "Suchen", exact: true }).click();
  await page
    .getByRole("link", {
      name: "Zalando Postgres Operator verstehen und verwenden",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/academy\/zalando-postgres$/);
  await expect(
    page.getByRole("heading", { name: "Den gewünschten Zustand lesen" }),
  ).toBeVisible();
  await expect(page.locator("code.language-yaml")).toContainText(
    "kind: postgresql",
  );
  await expect(page.getByTestId("knowledge-check")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Als gelesen markieren", exact: true })
    .click();
  await page.goto("/#/paths/alltag");
  await expect(page.getByTestId("topic-zalando-postgres")).toContainText(
    "Gelesen",
  );
  await page.goto("/#/paths/verstehen");
  await expect(page.getByTestId("topic-zalando-postgres")).toContainText(
    "Gelesen",
  );
});
test("C: Scheduler search opens internals directly and focuses the optional section", async ({
  page,
}) => {
  await page.goto("/#/discover?q=Scheduling%20Framework");
  await page
    .getByRole("link", {
      name: "Deep Dive: Scheduler Framework und Binding →",
      exact: true,
    })
    .click();
  await expect(page.locator("#section-internals")).toHaveAttribute("open", "");
  await expect(page.locator("#section-internals")).toBeFocused();
  await expect(page.getByTestId("scheduler-internals")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Als gelesen markieren", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.locator("#section-internals")).toHaveAttribute("open", "");
});
test("search filters, alternate spelling, empty results and planned-topic links work", async ({
  page,
}) => {
  await page.goto("/#/discover");
  await page.getByLabel("Themen durchsuchen").fill("HTTP Zugriff");
  await expect(page.getByTestId("topic-ingress")).toContainText(
    "Thema geplant",
  );
  await page
    .getByTestId("topic-ingress")
    .getByRole("link", { name: "Ingress", exact: true })
    .click();
  await expect(
    page.getByText("Dieses Thema ist geplant.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Services und Pod-Verbindungen",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/#/discover?q=PVC");
  await expect(page.getByTestId("topic-storage")).toBeVisible();
  await page.getByLabel("Verfügbarkeit").selectOption("available");
  await expect(
    page.getByRole("heading", { name: "Keine passenden Themen" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Suche zurücksetzen" }).click();
  await page.getByLabel("Kategorie", { exact: true }).selectOption("Netzwerk");
  await page.getByLabel("Verfügbarkeit").selectOption("available");
  await expect(page.locator(".topic-card")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".topic-card")).toHaveCount(2);
});
test("version 4 auto-migration preserves original data and exports shared reading state", async ({
  page,
}) => {
  await page.goto("/#/settings");
  const original = {
    version: 4,
    theoryCompleted: ["etcd"],
    practiceCompleted: ["etcd/diagnosis"],
    independentCompleted: ["etcd/diagnosis"],
    checkpoints: [1],
    challenge: false,
    completedChallenges: [],
    lastLesson: "etcd",
    theme: "dark",
  };
  await page.evaluate(
    async (data) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("keyval-store");
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result;
          const tx = db.transaction("keyval", "readwrite");
          tx.objectStore("keyval").put(data, "kubelab-progress");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    original,
  );
  await page.reload();
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  const stored = await page.evaluate(
    async () =>
      new Promise<any>((resolve, reject) => {
        const r = indexedDB.open("keyval-store");
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result;
          const tx = db.transaction("keyval", "readonly");
          const a = tx.objectStore("keyval").get("kubelab-progress");
          const b = tx.objectStore("keyval").get("kubelab-progress-backup-v4");
          tx.oncomplete = () => {
            db.close();
            resolve({ current: a.result, backup: b.result });
          };
        };
      }),
  );
  expect(stored.backup).toEqual(original);
  expect(stored.current.readCompleted).toEqual(["etcd"]);
  expect(stored.current.independentCompleted).toEqual(
    original.independentCompleted,
  );
  await page.goto("/#/academy/etcd?path=betreiben");
  await page
    .getByRole("button", { name: "Gelesen ✓ · Markierung aufheben" })
    .click();
  await page.goto("/#/settings");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportieren", exact: true }).click();
  const file = await (await pending).path();
  await page.getByRole("button", { name: "Lernstand zurücksetzen" }).click();
  await page.getByRole("button", { name: "Ja, zurücksetzen" }).click();
  await page.getByLabel("Lernstand importieren").setInputFiles(file!);
  await page.goto("/#/academy/etcd");
  await expect(
    page.getByRole("button", { name: "Als gelesen markieren", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await page.goto("/");
  await expect(
    page.getByRole("complementary", { name: "Weiterlernen" }),
  ).toContainText("Kubernetes betreiben");
});
test("mobile navigation, direct reading and playground keep the layout within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/#/discover?q=Postgres",
    "/#/paths",
    "/#/paths/alltag",
    "/#/academy/zalando-postgres",
    "/#/academy/scheduling?section=internals",
    "/#/playground?tool=visualizer",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
  await expect(nav.getByRole("link")).toHaveCount(3);
  await nav.getByRole("link", { name: "Entdecken" }).click();
  await expect(page).toHaveURL(/discover$/);
});
