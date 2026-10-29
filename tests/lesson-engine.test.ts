import { describe, it, expect } from "vitest";
import original from "./fixtures/architecture-v02.json";
import {
  lessons,
  architectureLessons,
  quizFor,
  practiceTasks,
  practiceMastered,
} from "../packages/lesson-engine/src";
import {
  parseLesson,
  parseCatalog,
} from "../packages/lesson-engine/src/schema";
import {
  gradeQuiz,
  checkPractice,
} from "../packages/lesson-engine/src/assessment";
import { parseProgress } from "../apps/web/src/stores/progress";
import {
  initialQuorum,
  toggleMember,
  electLeader,
} from "../packages/simulation-engine/src/architecture";
import {
  quorumWriteEvidence,
  schedulerEvidence,
  runtimeEvidence,
  apiEvidence,
} from "../packages/simulation-engine/src/evidence";
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object")
    return Object.values(value).flatMap(strings);
  return [];
}
const example = () => structuredClone(architectureLessons[0]);
describe("declarative lesson schema and lossless migration", () => {
  it("validates all 27 lessons including preserved introductions and validates every document", () => {
    expect(lessons).toHaveLength(27);
    expect(parseCatalog(lessons)).toEqual(lessons);
  });
  it.each(original.map((l) => [l.id, l] as const))(
    "preserves all original text, metadata and questions: %s",
    (id, old) => {
      const migrated = lessons.find((l) => l.id === id)!;
      const newStrings = new Set(strings(migrated));
      for (const s of strings(old))
        expect(newStrings.has(s), `${id}: missing ${s}`).toBe(true);
      expect(migrated.duration).toBe(old.duration);
      expect(quizFor(migrated).questions.map(({ id, ...q }) => q)).toEqual(
        old.questions,
      );
    },
  );
  it.each(["code", "table", "callout", "experiment", "task", "quiz", "list"])(
    "provides rendered data for block type %s",
    (type) =>
      expect(
        lessons.some((l) =>
          l.sections.some((s) => s.blocks.some((b) => b.type === type)),
        ),
      ).toBe(true),
  );
  it.each([
    (l: any) => (l.moduleId = "17"),
    (l: any) => l.sections[0].blocks.push({ type: "script", code: "alert(1)" }),
    (l: any) =>
      l.sections[0].blocks.push({
        type: "text",
        text: "hello",
        html: "<script/>",
      }),
    (l: any) => (l.sources[0].url = "javascript:alert(1)"),
    (l: any) => (l.sections[1].id = l.sections[0].id),
    (l: any) => (quizFor(l).questions[0].correct = 9),
    (l: any) => (quizFor(l).questions[1].id = quizFor(l).questions[0].id),
    (l: any) =>
      l.sections[1].blocks.push({
        type: "table",
        caption: "Bad shape",
        headers: ["A", "B"],
        rows: [["one"]],
      }),
    (l: any) =>
      l.sections[1].blocks.push({
        type: "code",
        language: "javascript",
        execution: "example",
        code: "alert(1)",
        caption: "Bad language",
      }),
    (l: any) =>
      (l.sections[2].blocks[1].verification = {
        kind: "experiment",
        experimentId: "missing",
        requirements: [{ event: "quorum.no-majority", label: "missing" }],
      }),
    (l: any) =>
      (l.sections[2].blocks[1].verification = {
        kind: "experiment",
        experimentId: "model",
        requirements: [{ event: "quorum.no-majority", label: "wrong model" }],
      }),
    (l: any) =>
      (l.sections[2].blocks[1].verification.items[0].answer = "unknown"),
    (l: any) => l.sections.push(structuredClone(l.sections.at(-1))),
  ])("rejects malformed documents before rendering", (mutate) => {
    const l = example();
    mutate(l);
    expect(() => parseLesson(l)).toThrow();
  });
  it("rejects duplicate lesson IDs", () =>
    expect(() => parseCatalog([example(), example()])).toThrow());
});
describe("theory and practice assessments", () => {
  it("requires every quiz answer and leaves the lesson data unchanged", () => {
    const questions = quizFor(example()).questions;
    expect(gradeQuiz(questions, {})).toBe(false);
    const answers = Object.fromEntries(questions.map((q) => [q.id, q.correct]));
    expect(gradeQuiz(questions, answers)).toBe(true);
    answers[questions[0].id] = -1;
    expect(gradeQuiz(questions, answers)).toBe(false);
  });
  it("checks matching tasks and excludes reflection from mastery", () => {
    const lesson = example();
    const task = practiceTasks(lesson)[0];
    expect(checkPractice(task, {}, []).every((c) => c.passed)).toBe(false);
    if (task.verification.kind !== "matching") throw Error("Expected matching");
    const answers = Object.fromEntries(
      task.verification.items.map((i, n) => [n, i.answer]),
    );
    expect(checkPractice(task, answers, []).every((c) => c.passed)).toBe(true);
    expect(practiceTasks(lesson)).toHaveLength(3);
    expect(practiceMastered(lesson, ["cluster-basics/practice"])).toBe(true);
    expect(
      practiceMastered(lesson, [
        "cluster-basics/practice",
        "cluster-basics/internals-transfer",
      ]),
    ).toBe(true);
    expect(
      practiceMastered(
        lessons.find((l) => l.id === "linux")!,
        [],
      ),
    ).toBe(false);
  });
  it("requires all experiment evidence from the correct model", () => {
    const task = practiceTasks(lessons.find((l) => l.id === "etcd")!)[0];
    expect(
      checkPractice(task, {}, ["api.accepted"]).every((c) => c.passed),
    ).toBe(false);
    if (task.verification.kind !== "experiment")
      throw Error("Expected experiment");
    const events = task.verification.requirements.map((r) => r.event);
    expect(
      checkPractice(task, {}, events.slice(1)).every((c) => c.passed),
    ).toBe(false);
    expect(checkPractice(task, {}, events).every((c) => c.passed)).toBe(true);
  });
  it("distinguishes leader loss, reelection and loss of the fixed majority", () => {
    let q = initialQuorum();
    expect(quorumWriteEvidence(q)).toBe("quorum.initial-write");
    q = toggleMember(q, 0);
    expect(quorumWriteEvidence(q)).toBe("quorum.leader-missing");
    q = electLeader(q);
    expect(quorumWriteEvidence(q)).toBe("quorum.recovered-write");
    q = toggleMember(q, 2);
    expect(quorumWriteEvidence(q)).toBe("quorum.no-majority");
  });
  it("does not grant task-specific scheduling or runtime evidence for unrelated states", () => {
    expect(schedulerEvidence(1, "auto", false, false)).toBeNull();
    expect(schedulerEvidence(3, "worker-01", false, false)).toBe(
      "scheduler.capacity-blocked",
    );
    expect(schedulerEvidence(3, "worker-02", true, false)).toBe(
      "scheduler.taint-blocked",
    );
    expect(schedulerEvidence(3, "worker-02", true, true)).toBe(
      "scheduler.tolerated",
    );
    expect(runtimeEvidence(true, false, true, true)).toBeNull();
    expect(runtimeEvidence(true, true, false, true)).toBe(
      "runtime.image-blocked",
    );
    expect(apiEvidence(false, false, false)).toBe("api.identity-rejected");
  });
});
describe("version 3 progress migration", () => {
  const v2 = {
    version: 2,
    completed: ["linux", "etcd", "control-plane"],
    checkpoints: [0, 6],
    challenge: true,
    completedChallenges: ["selector", "service"],
    lastLesson: "etcd",
    theme: "dark",
  };
  it("preserves v2 theory and unrelated state without inventing practice", () => {
    const p = parseProgress(v2);
    expect(p).toEqual({
      version: 5,
      readCompleted: ["linux", "etcd", "control-plane"],
      lastPath: null,
      recentLesson: "etcd",
      independentCompleted: [],
      theoryCompleted: v2.completed,
      practiceCompleted: [],
      checkpoints: v2.checkpoints,
      challenge: true,
      completedChallenges: v2.completedChallenges,
      lastLesson: "etcd",
      theme: "dark",
    });
  });
  it("retains the v1 control-plane migration rule", () =>
    expect(parseProgress({ ...v2, version: 1 }).theoryCompleted).toEqual([
      "linux",
      "etcd",
    ]));
  it("round trips independent theory and practice, deduplicating evidence IDs", () => {
    const p = {
      ...parseProgress(v2),
      theoryCompleted: [],
      practiceCompleted: ["etcd/practice", "etcd/practice"],
    };
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual({
      ...p,
      practiceCompleted: ["etcd/practice"],
    });
  });
  it.each([
    { practiceCompleted: ["etcd/expert"] },
    { practiceCompleted: ["linux/diagnosis"] },
    { practiceCompleted: ["unknown/practice"] },
    { theoryCompleted: ["unknown"] },
    { practiceCompleted: undefined },
    { version: 6 },
  ])("rejects corrupt or uncheckable completion", (patch) =>
    expect(() => parseProgress({ ...parseProgress(v2), ...patch })).toThrow(),
  );
});

describe("existing introductory content migration", () => {
  it("keeps every original MDX content line in the declarative documents", async () => {
    const { default: old } = await import("./fixtures/introductions-v02.json");
    for (const [id, source] of Object.entries(old)) {
      const content = strings(lessons.find((l) => l.id === id)).join("\n");
      for (const line of source.split("\n")) {
        if (!line.trim() || line.startsWith("```")) continue;
        expect(content, `${id}: missing line`).toContain(
          line.replace(/^#{2,3} /, "").replace(/^\d+\. /, ""),
        );
      }
    }
  });
});
