import { test, expect, type Page } from "@playwright/test";
import {
  lessons,
  quizFor,
  practiceTasks,
} from "../../packages/lesson-engine/src";
async function expectBasicPractice(page: Page) {
  await expect(
    page
      .getByTestId("practice-practice")
      .getByText("Praxisnachweis im Lernstand erfasst.", { exact: false }),
  ).toBeVisible();
  // Optional Internals do not block basic practice completion.
  await expect(page.getByTestId("practice-status")).toHaveText(
    "Praxis abgeschlossen",
  );
}
async function answerQuiz(page: Page, id: string) {
  const quiz = quizFor(lessons.find((l) => l.id === id)!);
  for (const q of quiz.questions)
    await page
      .getByTestId("knowledge-check")
      .getByLabel(q.answers[q.correct], { exact: true })
      .check();
  await page.getByRole("button", { name: "Wissenscheck auswerten" }).click();
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
}
async function quorumTask(page: Page) {
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await page.getByRole("button", { name: /etcd-1/ }).click();
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await page.getByRole("button", { name: "Leader wählen" }).click();
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
  await page.getByRole("button", { name: /etcd-3/ }).click();
  await page.getByRole("button", { name: "Änderung schreiben" }).click();
}
test("all 22 lessons use the same page and retain their content", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const l of lessons) {
    await page.goto("/#/academy/" + l.id);
    await expect(
      page.getByRole("heading", { name: l.title, exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("knowledge-check")).toBeVisible();
    await expect(page.getByTestId("theory-status")).toHaveText(
      "Grundlagen offen",
    );
  }
  expect(errors).toEqual([]);
});
test("client navigation and back reset quiz answers and feedback, but retain theory completion", async ({
  page,
}) => {
  await page.goto("/#/academy/cluster-basics");
  await answerQuiz(page, "cluster-basics");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await page
    .getByRole("link", { name: "Nächste Lektion", exact: true })
    .click();
  await expect(page).toHaveURL(/control-plane$/);
  await expect(
    page.getByTestId("knowledge-check").locator("input:checked"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Wissenscheck auswerten" }),
  ).toBeDisabled();
  await expect(
    page.getByTestId("knowledge-check").getByRole("status"),
  ).toHaveCount(0);
  await page.goBack();
  await expect(
    page.getByTestId("knowledge-check").locator("input:checked"),
  ).toHaveCount(0);
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await expect(page.getByTestId("practice-status")).toHaveText("Praxis offen");
});
test("practice requires actual evidence, resets observations, and persists separately from theory", async ({
  page,
}) => {
  await page.goto("/#/academy/etcd");
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expect(page.getByTestId("practice-status")).toHaveText("Praxis offen");
  await quorumTask(page);
  await page.getByRole("button", { name: "Zurücksetzen", exact: true }).click();
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expect(page.getByTestId("practice-status")).toHaveText("Praxis offen");
  await quorumTask(page);
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expectBasicPractice(page);
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen offen",
  );
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  await page.reload();
  await expectBasicPractice(page);
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen offen",
  );
  await answerQuiz(page, "etcd");
  await page.reload();
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await expectBasicPractice(page);
});
test("matching checks reject incomplete work and opening a solution never grants mastery", async ({
  page,
}) => {
  await page.goto("/#/academy/cluster-basics");
  const task = page.getByTestId("practice-practice");
  await task.getByText("Lösung bewusst aufdecken", { exact: true }).click();
  await task.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expect(page.getByTestId("practice-status")).toHaveText("Praxis offen");
  const verification = practiceTasks(
    lessons.find((l) => l.id === "cluster-basics")!,
  )[0].verification;
  if (verification.kind !== "matching") throw Error("Wrong fixture");
  for (const [i, item] of verification.items.entries())
    await task.locator("select").nth(i).selectOption(item.answer);
  await task.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expectBasicPractice(page);
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen offen",
  );
});
test("version 2 IndexedDB migrates and export/import round trips both completion types", async ({
  page,
}) => {
  await page.goto("/#/academy");
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("keyval-store");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("keyval", "readwrite");
        tx.objectStore("keyval").put(
          {
            version: 2,
            completed: ["linux", "etcd"],
            checkpoints: [1],
            challenge: true,
            completedChallenges: ["selector"],
            lastLesson: "etcd",
            theme: "dark",
          },
          "kubelab-progress",
        );
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
  await page.reload();
  await page.goto("/#/academy/etcd");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await expect(page.getByTestId("practice-status")).toHaveText("Praxis offen");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await quorumTask(page);
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await page.goto("/#/settings");
  await expect(page.getByTestId("progress-save-status")).toHaveText(
    "Lernstand lokal gespeichert",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportieren", exact: true }).click();
  const file = await (await download).path();
  await page.getByRole("button", { name: "Lernstand zurücksetzen" }).click();
  await page.getByRole("button", { name: "Ja, zurücksetzen" }).click();
  await expect(
    page.getByText(
      "0 Grundlagenabschlüsse · 0 Praxisaufgaben · 0 Lab-Schritte",
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  await page.getByLabel("Lernstand importieren").setInputFiles(file!);
  await expect(
    page.getByText(
      "2 Grundlagenabschlüsse · 1 Praxisaufgaben · 1 Lab-Schritte",
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  await page.goto("/#/academy/etcd");
  await page.reload();
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen abgeschlossen",
  );
  await expectBasicPractice(page);
});
test("scheduler and runtime observations follow explicit task states", async ({
  page,
}) => {
  await page.goto("/#/academy/scheduling");
  await page.getByLabel("CPU-Request im Playground").fill("3");
  await page.getByLabel("Harter Node-Wunsch").selectOption("worker-01");
  await page
    .getByRole("button", { name: "Zustand für Aufgabe prüfen" })
    .click();
  await page.getByLabel("Harter Node-Wunsch").selectOption("worker-02");
  await page.getByLabel("worker-02: NoSchedule-Taint").check();
  await page
    .getByRole("button", { name: "Zustand für Aufgabe prüfen" })
    .click();
  await page.getByLabel("Pod toleriert diesen Taint").check();
  await page
    .getByRole("button", { name: "Zustand für Aufgabe prüfen" })
    .click();
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expectBasicPractice(page);
  await page.goto("/#/academy/kubelet-runtime");
  for (const label of [
    "Pod-Netzwerk verfügbar",
    "Image verfügbar",
    "Readiness erfolgreich",
  ]) {
    await page.getByLabel(label, { exact: true }).uncheck();
    await page
      .getByRole("button", { name: "Zustand für Aufgabe prüfen" })
      .click();
    await page.getByLabel(label, { exact: true }).check();
  }
  await page
    .getByRole("button", { name: "Zustand für Aufgabe prüfen" })
    .click();
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expectBasicPractice(page);
});
test("code, YAML, outputs and tables render safely without mobile overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/academy/cluster-basics");
  await expect(page.getByRole("table").first()).toBeVisible();
  await page.goto("/#/academy/apply-to-pod");
  await expect(page.locator("code.language-yaml")).toContainText("replicas: 3");
  await expect(
    page.getByText("Beispielausgabe · nicht live", { exact: false }),
  ).toBeVisible();
  await expect(
    page.locator("code.language-yaml .syntax-keyword").first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/academy/cilium");
  await expect(page.locator("code.language-yaml")).toHaveCount(2);
  await expect(page.getByTestId("practice-status")).toHaveText(
    "Praxis nicht automatisch geprüft",
  );
});

test("API practice records rejected requests without awarding theory completion", async ({
  page,
}) => {
  await page.goto("/#/academy/api-lifecycle");
  for (const name of [
    "Gültige Identität",
    "Operation erlaubt",
    "Admission akzeptiert",
  ]) {
    await page.getByLabel(name, { exact: true }).uncheck();
    await page
      .getByRole("button", { name: "Schreibanfrage simulieren" })
      .click();
    await page.getByLabel(name, { exact: true }).check();
  }
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expect(page.getByTestId("practice-status")).toHaveText("Praxis offen");
  await page.getByRole("button", { name: "Schreibanfrage simulieren" }).click();
  await page.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  await expectBasicPractice(page);
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen offen",
  );
});

test("an unreadable saved progress record survives passive lesson navigation", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open("keyval-store");
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction("keyval", "readwrite");
        tx.objectStore("keyval").put(
          { version: 99, keep: "original-data" },
          "kubelab-progress",
        );
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
    });
  });
  await page.reload();
  await expect(
    page.getByText("Lokaler Lernstand konnte nicht geladen werden.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.goto("/#/academy/etcd");
  await expect(page.getByTestId("theory-status")).toHaveText(
    "Grundlagen offen",
  );
  const record = await page.evaluate(
    async () =>
      new Promise<unknown>((resolve, reject) => {
        const r = indexedDB.open("keyval-store");
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result;
          const tx = db.transaction("keyval", "readonly");
          const read = tx.objectStore("keyval").get("kubelab-progress");
          read.onsuccess = () => resolve(read.result);
          tx.oncomplete = () => db.close();
        };
      }),
  );
  expect(record).toEqual({ version: 99, keep: "original-data" });
});
