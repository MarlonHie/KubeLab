import { describe, it, expect } from "vitest";
import {
  initialQuorum,
  majority,
  canCommit,
  toggleMember,
  electLeader,
  commitWrite,
  apiRequest,
  schedulingCandidates,
  runtimeResult,
} from "../packages/simulation-engine/src/architecture";
import { architectureLessons, quizFor } from "../packages/lesson-engine/src";
import { curriculum, lessons } from "../packages/lesson-engine/src";
import { freshLab, parseLab } from "../packages/lab-state/src";
import {
  apply,
  defaultManifest,
  emptyCluster,
  command,
} from "../packages/simulation-engine/src";
import {
  scenarios,
  taskChecks,
  serviceEndpoints,
  serviceManifest,
} from "../packages/simulation-engine/src/scenarios";
import { parseProgress } from "../apps/web/src/stores/progress";
describe("etcd teaching model", () => {
  it("requires a fixed membership majority, even when members fail", () => {
    let s = initialQuorum();
    s = commitWrite(s);
    expect(s.revision).toBe(1);
    s = toggleMember(s, 1);
    expect(canCommit(s)).toBe(true);
    s = toggleMember(s, 2);
    expect(canCommit(s)).toBe(false);
    expect(commitWrite(s).revision).toBe(1);
    expect(majority(3)).toBe(2);
    expect(majority(4)).toBe(3);
    expect(majority(5)).toBe(3);
  });
  it("requires an election after losing the leader and recovers after quorum returns", () => {
    let s = toggleMember(initialQuorum(), 0);
    expect(canCommit(s)).toBe(false);
    s = electLeader(s);
    expect(s.leader).toBe(1);
    expect(s.term).toBe(2);
    s = toggleMember(s, 1);
    expect(electLeader(s).leader).toBeNull();
    s = toggleMember(s, 0);
    s = electLeader(s);
    expect(canCommit(s)).toBe(true);
    expect(commitWrite(s).revision).toBe(1);
  });
});
describe("API, scheduling and node responsibilities", () => {
  it.each([
    [false, true, true, 0],
    [true, false, true, 1],
    [true, true, false, 2],
  ] as const)("does not persist a rejected request", (a, b, c, index) => {
    const r = apiRequest(a, b, c);
    expect(r.accepted).toBe(false);
    expect(r.steps[index].state).toBe("failed");
    expect(r.steps[3].state).toBe("waiting");
  });
  it("accepts only the complete write path", () =>
    expect(apiRequest(true, true, true).accepted).toBe(true));
  it("tolerating a taint does not override other hard constraints", () => {
    expect(
      schedulingCandidates(3, "auto", true, false).every(
        (n) => n.reasons.length > 0,
      ),
    ).toBe(true);
    expect(schedulingCandidates(3, "auto", true, true)[1].reasons).toEqual([]);
    expect(
      schedulingCandidates(5, "auto", true, true).every(
        (n) => n.reasons.length > 0,
      ),
    ).toBe(true);
    expect(
      schedulingCandidates(3, "worker-01", false, true).every(
        (n) => n.reasons.length > 0,
      ),
    ).toBe(true);
  });
  it("distinguishes preparation, image failure and readiness", () => {
    expect(runtimeResult(false, true, true, true).stage).toBe(0);
    expect(runtimeResult(true, false, true, true).stage).toBe(1);
    expect(runtimeResult(true, true, false, true).stage).toBe(2);
    expect(runtimeResult(true, true, true, false).title).toBe(
      "Running · nicht Ready",
    );
    expect(runtimeResult(true, true, true, true).stage).toBe(4);
  });
});
describe("Versioned saved lab and realistic selector scenarios", () => {
  it("preserves invalid draft separately from applied resources", () => {
    const cluster = apply(emptyCluster, defaultManifest).cluster;
    const lab = { ...freshLab(), source: "kind: [unfinished", cluster };
    expect(parseLab(JSON.parse(JSON.stringify(lab)))).toEqual(lab);
  });
  it.each([
    null,
    { ...freshLab(), version: 2 },
    { ...freshLab(), scenario: "invalid" },
    { ...freshLab(), cluster: { revision: 0, resources: [{}] } },
    { ...freshLab(), source: "x".repeat(100001) },
  ])("rejects corrupt or oversized imports before replacing state", (value) =>
    expect(() => parseLab(value)).toThrow(),
  );
  it("rejects duplicate identities", () => {
    const c = apply(emptyCluster, defaultManifest).cluster;
    expect(() =>
      parseLab({
        ...freshLab(),
        cluster: { revision: 1, resources: [...c.resources, ...c.resources] },
      }),
    ).toThrow("Doppelte");
  });
  it("service repair changes actual endpoint checks, not just YAML validity", () => {
    const scenario = scenarios.find((s) => s.id === "service")!;
    expect(taskChecks(scenario.initial, "service").every((c) => c.passed)).toBe(
      false,
    );
    const repaired = apply(
      scenario.initial,
      defaultManifest + "\n---\n" + serviceManifest,
    ).cluster;
    expect(taskChecks(repaired, "service").every((c) => c.passed)).toBe(true);
    const service = repaired.resources.find((r) => r.kind === "Service")!;
    expect(serviceEndpoints(repaired, service)).toHaveLength(2);
    expect(
      serviceEndpoints(repaired, {
        ...service,
        metadata: { ...service.metadata, namespace: "elsewhere" },
      }),
    ).toHaveLength(0);
  });
  it("replica challenge can be repaired by the simulated terminal", () => {
    const scenario = scenarios.find((s) => s.id === "replicas")!;
    expect(
      taskChecks(scenario.initial, "replicas").every((c) => c.passed),
    ).toBe(false);
    const repaired = command(
      scenario.initial,
      "kubectl scale deployment hello-kubelab --replicas=2",
      scenario.source,
    ).cluster;
    expect(taskChecks(repaired, "replicas").every((c) => c.passed)).toBe(true);
  });
});
describe("Curriculum and backward-compatible learning progress", () => {
  it("defines sixteen unique modules and nine coherent reference lessons", () => {
    expect(curriculum).toHaveLength(16);
    expect(new Set(curriculum.map((m) => m.id)).size).toBe(16);
    expect(architectureLessons).toHaveLength(9);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    for (const l of architectureLessons) {
      expect(l.goals.length).toBeGreaterThanOrEqual(3);
      expect(
        l.sections.find((s) => s.id === "deep-dive")!.blocks.length,
      ).toBeGreaterThanOrEqual(6);
      expect(quizFor(l).questions).toHaveLength(3);
      expect(l.sources.length).toBeGreaterThanOrEqual(2);
      expect(lessons.find((meta) => meta.id === l.id)?.moduleId).toBe("03");
      for (const q of quizFor(l).questions) {
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.answers.length);
        expect(new Set(q.answers).size).toBe(q.answers.length);
      }
    }
  });
  it("migrates old progress without falsely completing the rewritten reference lesson", () => {
    const p = parseProgress({
      version: 1,
      completed: ["linux", "control-plane"],
      checkpoints: [0],
      challenge: true,
      lastLesson: "control-plane",
      theme: "dark",
    });
    expect(p.version).toBe(3);
    expect(p.theoryCompleted).toEqual(["linux"]);
    expect(p.completedChallenges).toEqual(["selector"]);
    expect(p.checkpoints).toEqual([0]);
  });
  it("preserves new reference completion across a version 2 round trip", () => {
    const p = parseProgress({
      version: 2,
      completed: ["etcd", "control-plane"],
      checkpoints: [],
      challenge: false,
      completedChallenges: [],
      lastLesson: "etcd",
      theme: "light",
    });
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
});
