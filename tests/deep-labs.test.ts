import { describe, it, expect } from "vitest";
import original from "./fixtures/architecture-v021.json";
import {
  architectureLessons,
  practiceTasks,
} from "../packages/lesson-engine/src";
import { parseLesson } from "../packages/lesson-engine/src/schema";
import { checkPractice } from "../packages/lesson-engine/src/assessment";
import {
  challengeSteps,
  checkChallenge,
  type ChallengeId,
} from "../packages/lesson-engine/src/challenges";
import {
  initialRaft,
  raftStep,
  replayRaft,
  initialScheduler,
  schedulerStep,
  replayScheduler,
} from "../packages/simulation-engine/src/deep-labs";
const ids: ChallengeId[] = ["raft-partition-v1", "scheduler-pipeline-v1"];
describe("additive architecture internals", () => {
  it.each(original)(
    "preserves every original section and goal of $id",
    (old) => {
      const lesson = architectureLessons.find((l) => l.id === old.id)!;
      expect(lesson.sections.filter((s) => s.id !== "internals")).toEqual(
        old.sections,
      );
      expect(lesson.goals.slice(0, old.goals.length)).toEqual(old.goals);
      expect(
        lesson.sections.find((s) => s.id === "internals")?.collapsible,
      ).toBe(true);
      expect(
        practiceTasks(lesson).some((t) => t.id === "internals-transfer"),
      ).toBe(true);
      expect(parseLesson(lesson)).toEqual(lesson);
    },
  );
  it("rejects a challenge referring to an incompatible or later model", () => {
    const lesson = structuredClone(
      architectureLessons.find((l) => l.id === "etcd")!,
    );
    const task = practiceTasks(lesson).find(
      (t) => t.id === "internals-practice",
    )!;
    if (task.verification.kind !== "state-machine") throw Error("fixture");
    task.verification.challengeId = "scheduler-pipeline-v1";
    expect(() => parseLesson(lesson)).toThrow(/Zustandsmaschinen/);
    task.verification.challengeId = "raft-partition-v1";
    task.verification.experimentId = "model";
    expect(() => parseLesson(lesson)).toThrow(/Zustandsmaschinen/);
  });
});
describe.each(ids)("ordered guarded challenge %s", (id) => {
  const actions = challengeSteps(id).map((s) => s.action);
  const passes = (trace: string[]) =>
    checkChallenge(id, trace).every((c) => c.passed);
  it("requires every step and accepts the guarded complete path", () => {
    expect(passes([])).toBe(false);
    for (let i = 1; i < actions.length; i++)
      expect(passes(actions.slice(0, i))).toBe(false);
    expect(passes(actions)).toBe(true);
  });
  it("rejects reversed, skipped, duplicated, unknown and stale event-set evidence", () => {
    for (const trace of [
      [...actions].reverse(),
      actions.slice(1),
      [actions[0], ...actions],
      [...new Set(actions)],
      ["quorum.initial-write", ...actions],
      [...actions, "unknown"],
    ])
      expect(passes(trace)).toBe(false);
  });
  it("integrates with practice assessment and reset", () => {
    const task = architectureLessons
      .flatMap(practiceTasks)
      .find(
        (t) =>
          t.verification.kind === "state-machine" &&
          t.verification.challengeId === id,
      )!;
    expect(checkPractice(task, {}, actions).every((c) => c.passed)).toBe(true);
    expect(checkPractice(task, {}, []).some((c) => c.passed)).toBe(false);
  });
});
describe("Raft teaching model safety", () => {
  it("separates proposal, quorum commit and application without mutating inputs", () => {
    const start = initialRaft(),
      copy = structuredClone(start);
    const proposed = raftStep(start, "write");
    expect(start).toEqual(copy);
    expect(proposed.members[0].commit).toBe(0);
    const committed = raftStep(proposed, "replicate");
    expect(
      committed.members.every((m) => m.commit === 1 && m.revision === 0),
    ).toBe(true);
    expect(
      raftStep(committed, "apply").members.every((m) => m.revision === 1),
    ).toBe(true);
  });
  it("never applies the isolated leader suffix and preserves the committed prefix through healing", () => {
    const trace = challengeSteps("raft-partition-v1").map((s) => s.action);
    const split = replayRaft(trace.slice(0, 6));
    expect(split.members[0].log.length).toBe(2);
    expect(split.members[0].commit).toBe(1);
    const applied = raftStep(split, "apply");
    expect(applied.members[0].revision).toBe(1);
    const noop = replayRaft(trace.slice(0, 9));
    expect(noop.members[1].applied).toBe(2);
    expect(noop.members[1].revision).toBe(1);
    const healed = replayRaft(trace.slice(0, 14));
    expect(
      healed.members.every(
        (m) =>
          m.log[0].value === split.members[0].log[0].value &&
          m.log[1].kind === "noop" &&
          m.revision === 2,
      ),
    ).toBe(true);
    const lost = replayRaft(trace);
    expect(lost.members.every((m) => m.commit === 3 && m.revision === 2)).toBe(
      true,
    );
  });
  it("keeps applied <= commit <= log length under arbitrary deterministic exploration", () => {
    let s = initialRaft(),
      seed = 19;
    const actions = [
      "write",
      "apply",
      "replicate",
      "partition",
      "elect",
      "heal",
      "isolate",
    ];
    for (let n = 0; n < 250; n++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const previous = structuredClone(s);
      s = raftStep(s, actions[seed % actions.length]);
      s.members.forEach((m, i) => {
        expect(m.applied).toBeLessThanOrEqual(m.commit);
        expect(m.commit).toBeLessThanOrEqual(m.log.length);
        expect(m.commit).toBeGreaterThanOrEqual(previous.members[i].commit);
        expect(m.log.slice(0, previous.members[i].commit)).toEqual(
          previous.members[i].log.slice(0, previous.members[i].commit),
        );
      });
    }
  });
});
describe("Scheduler pipeline", () => {
  it("hard constraints beat scores and binding cannot skip prerequisites", () => {
    expect(schedulerStep(initialScheduler(), "bind").bound).toBe(false);
    const scored = replayScheduler(["filter", "score"]);
    expect(scored.candidates[0].score).toBeNull();
    expect(scored.candidates[2].score).toBeNull();
    expect(scored.selected).toBe("worker-d");
    expect(schedulerStep(scored, "bind").bound).toBe(false);
  });
  it("releases reservations after PreBind failure, then re-evaluates before a successful bind", () => {
    const failed = replayScheduler([
      "filter",
      "score",
      "reserve",
      "permit",
      "fail",
    ]);
    expect(failed).toMatchObject({
      stage: "failed",
      reserved: false,
      bound: false,
      selected: null,
    });
    expect(schedulerStep(failed, "bind").bound).toBe(false);
    const end = replayScheduler(
      challengeSteps("scheduler-pipeline-v1").map((s) => s.action),
    );
    expect(end).toMatchObject({
      stage: "bound",
      reserved: false,
      bound: true,
      selected: "worker-d",
    });
  });
});
