import { test, expect } from "@playwright/test";
import {
  architectureLessons,
  practiceTasks,
} from "../../packages/lesson-engine/src";
import {
  challengeSteps,
  type ChallengeId,
} from "../../packages/lesson-engine/src/challenges";
import {
  raftActions,
  schedulerActions,
} from "../../packages/simulation-engine/src/deep-labs";
for (const [lesson, model, id, labels] of [
  ["etcd", "raft-internals", "raft-partition-v1", raftActions],
  [
    "scheduling",
    "scheduler-internals",
    "scheduler-pipeline-v1",
    schedulerActions,
  ],
] as const)
  test(`${lesson}: state challenge rejects wrong order, completes, and persists independently`, async ({
    page,
  }) => {
    await page.goto(`/#/academy/${lesson}`);
    const details = page.locator("#section-internals");
    await expect(details).not.toHaveAttribute("open");
    await page.getByRole("button", { name: "Internals", exact: true }).click();
    await expect(details).toHaveAttribute("open", "");
    const simulator = page.getByTestId(model),
      task = page.getByTestId("practice-internals-practice");
    await simulator
      .getByRole("button", {
        name: lesson === "etcd" ? "Commit lokal anwenden" : "Bind und PostBind",
        exact: true,
      })
      .click();
    await task.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
    await expect(task.getByRole("status")).toContainText("Noch nicht gelöst");
    await expect(simulator.getByTestId("challenge-guide")).toContainText(
      "abgewichen",
    );
    await simulator
      .getByRole("button", { name: "Deep Dive zurücksetzen" })
      .click();
    for (const step of challengeSteps(id as ChallengeId))
      await simulator
        .getByRole("button", { name: labels[step.action], exact: true })
        .click();
    await expect(simulator.getByTestId("challenge-guide")).toContainText(
      "Prüfpfad vollständig",
    );
    await task.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
    await expect(task.getByRole("status")).toHaveText(
      "Praxisaufgabe erfolgreich geprüft.",
    );
    await expect(page.getByTestId("theory-status")).toHaveText("Theorie offen");
    await expect(page.getByTestId("practice-count")).toContainText("1 von 3");
    await expect(page.getByTestId("progress-save-status")).toHaveText(
      "Lernstand lokal gespeichert",
    );
    await page.reload();
    await page.getByRole("button", { name: "Internals", exact: true }).click();
    await expect(
      task.getByText("Praxisnachweis im Lernstand erfasst.", { exact: false }),
    ).toBeVisible();
    await expect(simulator.getByTestId("challenge-guide")).toContainText(
      "Prüfpfad 0/",
    );
  });
test("advanced transfer contributes to mastery, collapse preserves the current answers", async ({
  page,
}) => {
  const lesson = architectureLessons.find((l) => l.id === "cluster-basics")!;
  await page.goto("/#/academy/cluster-basics");
  await page.getByRole("button", { name: "Internals", exact: true }).click();
  for (const task of practiceTasks(lesson)) {
    const block = page.getByTestId(`practice-${task.id}`),
      v = task.verification;
    if (v.kind !== "matching") throw Error("fixture");
    for (const [i, item] of v.items.entries())
      await block.locator("select").nth(i).selectOption(item.answer);
    if (task.id === "internals-transfer") {
      await page.locator("#section-internals > summary").click();
      await page
        .getByRole("button", { name: "Internals", exact: true })
        .click();
      await expect(block.locator("select").first()).toHaveValue(
        v.items[0].answer,
      );
    }
    await block.getByRole("button", { name: "Praxisaufgabe prüfen" }).click();
  }
  await expect(page.getByTestId("practice-status")).toHaveText(
    "Praxis gemeistert",
  );
  await expect(page.getByTestId("theory-status")).toHaveText("Theorie offen");
});
test("every internals section opens on mobile without page overflow or runtime errors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const lesson of architectureLessons) {
    await page.goto(`/#/academy/${lesson.id}`);
    await page.getByRole("button", { name: "Internals", exact: true }).click();
    await expect(page.getByTestId("practice-internals-transfer")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      lesson.id,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
