import { test, expect, type Page } from "@playwright/test";
import { architectureLessons, quizFor } from "../../packages/lesson-engine/src";
async function edit(page: Page, source: string) {
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(source);
  await expect(page.getByTestId("lab-save-status")).toHaveText(
    "Lab lokal gespeichert",
  );
}
test("reference curriculum is navigable, filtered, and honest about planned modules", async ({
  page,
}) => {
  await page.goto("/#/academy");
  await expect(page.locator(".curriculum-lesson")).toHaveCount(9);
  await expect(page.locator(".roadmap-grid .phase")).toHaveCount(16);
  await page.getByLabel("Schwierigkeitsgrad").selectOption("Expert");
  await expect(page.locator(".curriculum-lesson")).toHaveCount(1);
  await page.getByLabel("Lektionen durchsuchen").fill("not-a-lesson");
  await expect(
    page.getByText("Keine Lektion passt zu diesem Filter.", { exact: false }),
  ).toBeVisible();
});
test("all nine reference lessons have working content and experiments without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const lesson of architectureLessons) {
    await page.goto("/#/academy/" + lesson.id);
    await expect(
      page.getByRole("heading", { name: lesson.title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".architecture-question")).toHaveCount(3);
    await expect(
      page.getByRole("button", { name: "Wissenscheck auswerten" }),
    ).toBeDisabled();
    await expect(
      page.locator(".experiment,.reconciliation").first(),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("etcd loses quorum without shrinking the majority and requires leader election", async ({
  page,
}) => {
  await page.goto("/#/academy/etcd");
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await expect(page.getByTestId("etcd-revision")).toHaveText("1");
  await page.getByRole("button", { name: /etcd-1/ }).click();
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await expect(page.getByTestId("etcd-revision")).toHaveText("1");
  await page.getByRole("button", { name: "Leader wählen" }).click();
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await expect(page.getByTestId("etcd-revision")).toHaveText("2");
  await page.getByRole("button", { name: /etcd-3/ }).click();
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await expect(page.getByTestId("etcd-revision")).toHaveText("2");
  await expect(
    page.getByText("Kein Quorum – Schreiben blockiert"),
  ).toBeVisible();
});
test("three correct answers are required and reference completion survives reload", async ({
  page,
}) => {
  const lesson = architectureLessons[0];
  await page.goto("/#/academy/" + lesson.id);
  for (const [i, q] of quizFor(lesson).questions.entries())
    await page
      .locator(".architecture-question")
      .nth(i)
      .getByLabel(q.answers[i === 0 ? (q.correct + 1) % 3 : q.correct], {
        exact: true,
      })
      .check();
  await page.getByRole("button", { name: "Wissenscheck auswerten" }).click();
  await expect(
    page.getByText("Theorie noch nicht abgeschlossen.", { exact: false }),
  ).toBeVisible();
  await page
    .locator(".architecture-question")
    .first()
    .getByLabel(
      quizFor(lesson).questions[0].answers[
        quizFor(lesson).questions[0].correct
      ],
      {
        exact: true,
      },
    )
    .check();
  await page.getByRole("button", { name: "Wissenscheck auswerten" }).click();
  await expect(
    page.getByText("Alle Antworten sind richtig.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  await page.reload();
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Theorie verstanden",
  );
});
test("invalid draft and applied cluster persist separately across route and reload", async ({
  page,
}) => {
  await page.goto("/#/operations");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page
    .getByRole("button", { name: "Simuliert anwenden", exact: true })
    .click();
  await expect(page.locator(".lab-graph .badge")).toHaveText("2 Pods");
  await edit(page, "kind: [unfinished-draft");
  await expect(page.locator(".validation-status")).toHaveClass(/invalid/);
  await page
    .getByRole("link", { name: "Diesen Cluster im Visualizer untersuchen" })
    .click();
  await expect(page.locator(".react-flow__node.node-pod")).toHaveCount(2);
  await page.getByRole("link", { name: "Im Editor bearbeiten" }).click();
  await page.reload();
  await expect(page.locator(".lab-graph .badge")).toHaveText("2 Pods");
  await expect(page.locator(".monaco-editor")).toContainText(
    "unfinished-draft",
  );
  await expect(page.locator(".validation-status")).toHaveClass(/invalid/);
});
test("prepared replica fault repairs via terminal and persists scenario", async ({
  page,
}) => {
  await page.goto("/#/operations");
  await page.getByLabel("Szenario auswählen").selectOption("replicas");
  await page.getByRole("button", { name: "Lab ersetzen", exact: true }).click();
  await expect(page.locator(".lab-graph .badge")).toHaveText("0 Pods");
  await page
    .getByLabel("Simulierten Befehl eingeben")
    .fill("kubectl scale deployment hello-kubelab --replicas=2");
  await page
    .getByRole("button", { name: "Simulierten Befehl ausführen" })
    .click();
  await page.getByRole("button", { name: "Aufgabe prüfen" }).click();
  await expect(page.locator(".lab-output")).toContainText("Geschafft");
  await expect(page.getByTestId("lab-save-status")).toHaveText(
    "Lab lokal gespeichert",
  );
  await page.reload();
  await expect(page.getByLabel("Szenario auswählen")).toHaveValue("replicas");
  await expect(page.locator(".lab-graph .badge")).toHaveText("2 Pods");
});
test("lab export and validated import restore the actual workspace", async ({
  page,
}) => {
  await page.goto("/#/operations");
  await page
    .getByRole("button", { name: "Simuliert anwenden", exact: true })
    .click();
  await expect(page.getByTestId("lab-save-status")).toHaveText(
    "Lab lokal gespeichert",
  );
  await page.goto("/#/settings");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Lab exportieren" }).click();
  const file = await (await download).path();
  await page.goto("/#/operations");
  await page.getByRole("button", { name: "Übung zurücksetzen" }).click();
  await page.getByRole("button", { name: "Lab ersetzen", exact: true }).click();
  await expect(page.locator(".lab-graph .badge")).toHaveText("0 Pods");
  await page.goto("/#/settings");
  await page
    .getByLabel("Lab importieren", { exact: true })
    .setInputFiles(file!);
  await page.getByRole("button", { name: "Lab-Import bestätigen" }).click();
  await page.goto("/#/operations");
  await expect(page.locator(".lab-graph .badge")).toHaveText("2 Pods");
});
test("mobile reference lessons and mode labels remain visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/academy/etcd");
  await expect(
    page.getByRole("heading", { name: "etcd, Desired State und Quorum" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/operations");
  await expect(
    page.getByText("Browser-Simulation", { exact: true }),
  ).toBeVisible();
  await page.goto("/#/build");
  await expect(
    page.getByText("Echte Ausführung · externes VM-Terminal"),
  ).toBeVisible();
});
