import { describe, it, expect } from "vitest";
import {
  lessons,
  basicPracticeTasks,
  deepDiveTasks,
  deepDiveMastered,
  practiceMastered,
  practiceTasks,
  quizFor,
} from "../packages/lesson-engine/src";
import { parseProgress } from "../apps/web/src/stores/progress";
import {
  diagnosticCases,
  checkDiagnosis,
} from "../packages/simulation-engine/src/diagnosis";
import { parseLesson } from "../packages/lesson-engine/src/schema";
const v3 = {
  version: 3,
  theoryCompleted: ["etcd"],
  practiceCompleted: [
    "etcd/practice",
    "etcd/internals-transfer",
    "etcd/internals-practice",
  ],
  checkpoints: [2],
  challenge: true,
  completedChallenges: ["selector"],
  lastLesson: "etcd",
  theme: "dark",
};
describe("three independent progress stages", () => {
  it("migrates v3 credits without inventing independent completion", () => {
    const migrated = parseProgress(v3);
    expect(migrated).toEqual({
      ...v3,
      version: 5,
      independentCompleted: [],
      readCompleted: ["etcd"],
      lastPath: null,
      recentLesson: "etcd",
    });
    const lesson = lessons.find((l) => l.id === "etcd")!;
    expect(practiceMastered(lesson, migrated.practiceCompleted)).toBe(true);
    expect(deepDiveMastered(lesson, migrated)).toBe(false);
  });
  it("optional internals do not block basic practice, and deep mastery requires all three stages", () => {
    const l = lessons.find((l) => l.id === "cluster-basics")!;
    const p = parseProgress({
      ...v3,
      theoryCompleted: [l.id],
      practiceCompleted: [`${l.id}/practice`],
    });
    expect(basicPracticeTasks(l)).toHaveLength(1);
    expect(deepDiveTasks(l)).toHaveLength(2);
    expect(practiceMastered(l, p.practiceCompleted)).toBe(true);
    expect(deepDiveMastered(l, p)).toBe(false);
    const proofs = deepDiveTasks(l).map((t) => `${l.id}/${t.id}`);
    const complete = {
      ...p,
      practiceCompleted: [...p.practiceCompleted, ...proofs],
      independentCompleted: proofs,
    };
    expect(deepDiveMastered(l, complete)).toBe(true);
    expect(deepDiveMastered(l, { ...complete, theoryCompleted: [] })).toBe(
      false,
    );
    expect(
      deepDiveMastered(l, { ...complete, practiceCompleted: proofs }),
    ).toBe(false);
    expect(parseProgress(JSON.parse(JSON.stringify(complete)))).toEqual(
      complete,
    );
  });
  it.each([
    { independentCompleted: ["etcd/practice"] },
    { independentCompleted: ["etcd/internals-practice"] },
    { independentCompleted: ["etcd/diagnosis"] },
    { independentCompleted: undefined },
    { independentCompleted: ["unknown/diagnosis"] },
  ])("rejects malformed, guided or unrecorded independent credit", (patch) => {
    expect(() => parseProgress({ ...parseProgress(v3), ...patch })).toThrow();
  });
});
describe("diagnosis without a prescribed inspection order", () => {
  it.each(Object.keys(diagnosticCases))(
    "requires evidence, correct cause and remedy: %s",
    (id) => {
      const c = diagnosticCases[id],
        evidence = c.evidence.map((e) => e.id),
        answers = { 0: c.causes[c.cause], 1: c.remedies[c.remedy] };
      expect(checkDiagnosis(id, evidence, answers).every((c) => c.passed)).toBe(
        true,
      );
      expect(
        checkDiagnosis(id, [...evidence].reverse(), answers).every(
          (c) => c.passed,
        ),
      ).toBe(true);
      expect(
        checkDiagnosis(id, evidence.slice(1), answers).every((c) => c.passed),
      ).toBe(false);
      expect(
        checkDiagnosis(id, evidence, {
          ...answers,
          0: c.causes[(c.cause + 1) % c.causes.length],
        }).every((c) => c.passed),
      ).toBe(false);
      expect(
        checkDiagnosis(id, evidence, {
          ...answers,
          1: c.remedies[(c.remedy + 1) % c.remedies.length],
        }).every((c) => c.passed),
      ).toBe(false);
      expect(checkDiagnosis(id, evidence, {}).every((c) => c.passed)).toBe(
        false,
      );
    },
  );
  it("fails closed for unknown case IDs", () =>
    expect(checkDiagnosis("unknown", [], {}).every((c) => c.passed)).toBe(
      false,
    ));
  it("validates the case reference before render", () => {
    const l = structuredClone(lessons.find((l) => l.id === "linux-processes")!);
    const task = practiceTasks(l).find(
      (t) => t.verification.kind === "diagnosis",
    )!;
    if (task.verification.kind !== "diagnosis") throw Error("fixture");
    task.verification.caseId = "unknown";
    expect(() => parseLesson(l)).toThrow(/Diagnosefall/);
  });
});
describe("expanded foundation curriculum", () => {
  it("provides five Linux and four Container specialist lessons with goals, practice, internals, quiz and primary sources", () => {
    expect(lessons.filter((l) => l.moduleId === "01")).toHaveLength(6);
    expect(lessons.filter((l) => l.moduleId === "02")).toHaveLength(5);
    const advanced = lessons.filter(
      (l) =>
        ["01", "02"].includes(l.moduleId) &&
        !["linux", "containers"].includes(l.id),
    );
    expect(advanced).toHaveLength(9);
    for (const l of advanced) {
      expect(l.goals.length).toBeGreaterThanOrEqual(2);
      expect(quizFor(l).questions).toHaveLength(3);
      expect(basicPracticeTasks(l)).toHaveLength(1);
      expect(deepDiveTasks(l)).toHaveLength(1);
      expect(l.sources.length).toBeGreaterThanOrEqual(2);
      expect(l.sections.some((s) => s.collapsible)).toBe(true);
      expect(
        l.sections
          .flatMap((s) => s.blocks)
          .some((b) => b.type === "code" && b.execution === "external"),
      ).toBe(true);
    }
  });
});

it.each(["toString", "constructor", "__proto__"])(
  "rejects inherited diagnostic key %s",
  (id) => expect(checkDiagnosis(id, [], {}).every((c) => c.passed)).toBe(false),
);
