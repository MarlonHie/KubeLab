import { test, expect, type Page } from "@playwright/test";
import {
  lessons,
  practiceTasks,
  quizFor,
} from "../../packages/lesson-engine/src";
import { diagnosticCases } from "../../packages/simulation-engine/src/diagnosis";
async function solveDiagnosis(page: Page, id: string, reverse = false) {
  const c = diagnosticCases[id],
    task = page.getByTestId("practice-diagnosis");
  const observations = reverse ? [...c.evidence].reverse() : c.evidence;
  for (const e of observations)
    await task.getByRole("button", { name: e.label, exact: true }).click();
  await task
    .getByLabel("Wahrscheinlichste Ursache")
    .selectOption(c.causes[c.cause]);
  await task
    .getByLabel("Begründete Korrektur")
    .selectOption(c.remedies[c.remedy]);
  await task.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
}
async function solveBasics(page: Page, id: string) {
  const l = lessons.find((l) => l.id === id)!;
  for (const q of quizFor(l).questions)
    await page
      .getByTestId("knowledge-check")
      .getByLabel(q.answers[q.correct], { exact: true })
      .check();
  await page.getByRole("button", { name: "Wissenscheck auswerten" }).click();
  const task = practiceTasks(l).find((t) => t.id === "practice")!;
  if (task.verification.kind !== "matching") throw Error("fixture");
  const block = page.getByTestId("practice-practice");
  for (const [i, item] of task.verification.items.entries())
    await block.locator("select").nth(i).selectOption(item.answer);
  await block.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
}
test("optional internals do not block practice; help disqualifies only the current independent attempt", async ({
  page,
}) => {
  await page.goto("/#/academy/linux-cgroups");
  await solveBasics(page, "linux-cgroups");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await expect(page.getByTestId("practice-status")).toHaveText(
    "Praxis abgeschlossen",
  );
  await expect(page.getByTestId("deep-dive-status")).toHaveText(
    "Deep Dive offen · optional",
  );
  await page.getByRole("button", { name: "Internals", exact: true }).click();
  const task = page.getByTestId("practice-diagnosis");
  await solveDiagnosis(page, "linux-cgroups");
  await expect(page.getByTestId("deep-dive-count")).toContainText("0 von 1");
  await page
    .getByRole("button", { name: "Eigenständige Challenge", exact: true })
    .click();
  await task.getByRole("button", { name: "Hinweis anzeigen" }).click();
  await solveDiagnosis(page, "linux-cgroups");
  await expect(task).toContainText("Dieser Versuch nutzt Hilfe");
  await expect(page.getByTestId("deep-dive-count")).toContainText("0 von 1");
  await page
    .getByRole("button", { name: "Neuen Versuch starten", exact: true })
    .click();
  await expect(task.getByLabel("Wahrscheinlichste Ursache")).toHaveValue("");
  await solveDiagnosis(page, "linux-cgroups", true);
  await expect(page.getByTestId("deep-dive-status")).toHaveText(
    "Deep Dive gemeistert",
  );
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  await page.reload();
  await expect(page.getByTestId("deep-dive-status")).toHaveText(
    "Deep Dive gemeistert",
  );
  await page.goto("/#/academy?module=01");
  await expect(
    page
      .locator(".curriculum-lesson")
      .filter({ hasText: "cgroups v2 und Ressourcenengpässe" }),
  ).toContainText("Deep Dive gemeistert");
});
test("challenge mode removes the guided path; explicit solution reveal never grants an independent proof", async ({
  page,
}) => {
  await page.goto("/#/academy/etcd");
  await page.getByRole("button", { name: "Internals", exact: true }).click();
  await expect(page.getByTestId("challenge-guide")).toBeVisible();
  await page
    .getByRole("button", { name: "Eigenständige Challenge", exact: true })
    .click();
  await expect(page.getByTestId("challenge-guide")).toHaveCount(0);
  await expect(page.getByTestId("practice-internals-practice")).toHaveCount(0);
  const task = page.getByTestId("practice-diagnosis");
  await expect(task.getByText("Lösung:", { exact: false })).toHaveCount(0);
  await task.getByRole("button", { name: "Lösung bewusst aufdecken" }).click();
  await solveDiagnosis(page, "etcd", true);
  await expect(task).toContainText("Eigenständiger Nachweis offen");
  await expect(page.getByTestId("deep-dive-count")).toContainText("0 von 2");
  await page
    .getByRole("button", { name: "Geführt lernen", exact: true })
    .click();
  await expect(page.getByTestId("challenge-guide")).toContainText(
    "Prüfpfad 0/",
  );
});
test("all nine new lessons support independent diagnosis on mobile without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const l of lessons.filter(
    (l) =>
      ["01", "02"].includes(l.moduleId) &&
      !["linux", "containers"].includes(l.id),
  )) {
    await page.goto("/#/academy/" + l.id);
    await page
      .getByRole("button", { name: "Eigenständige Challenge", exact: true })
      .click();
    await page.getByRole("button", { name: "Internals", exact: true }).click();
    await solveDiagnosis(page, l.id, true);
    await expect(page.getByTestId("deep-dive-count")).toContainText("1 von 1");
    await expect(page.getByTestId("deep-dive-status")).toHaveText(
      "Deep Dive offen · optional",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      l.id,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("version 3 imports retain guided credit without upgrading it to independent mastery", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await page.getByLabel("Lernstand importieren").setInputFiles({
    name: "v3.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 3,
        theoryCompleted: ["etcd"],
        practiceCompleted: [
          "etcd/practice",
          "etcd/internals-practice",
          "etcd/internals-transfer",
        ],
        checkpoints: [],
        challenge: false,
        completedChallenges: [],
        lastLesson: "etcd",
        theme: "dark",
      }),
    ),
  });
  await page.goto("/#/academy/etcd");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await expect(page.getByTestId("practice-status")).toHaveText(
    "Praxis abgeschlossen",
  );
  await expect(page.getByTestId("deep-dive-count")).toContainText("0 von 2");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
