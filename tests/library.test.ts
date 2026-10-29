import { describe, it, expect } from "vitest";
import {
  topics,
  searchTopics,
  topicUrl,
  learningPaths,
  pathTopics,
  topicById,
} from "../packages/lesson-engine/src/library";
import { lessons, quizFor } from "../packages/lesson-engine/src";
import { parseLesson } from "../packages/lesson-engine/src/schema";
import { parseProgress } from "../apps/web/src/stores/progress";
const legacy = {
  version: 4,
  theoryCompleted: ["etcd"],
  practiceCompleted: ["etcd/diagnosis"],
  independentCompleted: ["etcd/diagnosis"],
  checkpoints: [0, 4],
  challenge: true,
  completedChallenges: ["selector"],
  lastLesson: "etcd",
  theme: "dark",
};
describe("shared library and discovery", () => {
  it.each([
    ["HTTP-Zugriff", "ingress"],
    ["http zugriff", "ingress"],
    ["PVC", "storage"],
    ["PersistentVolumeClaim", "storage"],
    ["Postgres", "zalando-postgres"],
    ["PostgreSQL", "zalando-postgres"],
    ["Zalando Operator", "zalando-postgres"],
    ["Postgres Operator", "zalando-postgres"],
    ["Kubernetes CLI", "cluster-basics"],
    ["kubectl", "cluster-basics"],
    ["Scheduling Framework", "scheduling"],
    ["SCHEDULER", "scheduling"],
  ])("finds %s without a backend", (query, id) =>
    expect(searchTopics(query).map((t) => t.id)).toContain(id),
  );
  it("filters availability/category and reports no results", () => {
    expect(searchTopics("definitely absent")).toEqual([]);
    expect(
      searchTopics("", "Netzwerk", "available").every(
        (t) => t.category === "Netzwerk" && t.lessonId,
      ),
    ).toBe(true);
    expect(searchTopics("PVC", "", "available")).toEqual([]);
    expect(searchTopics("PVC", "", "planned").map((t) => t.id)).toContain(
      "storage",
    );
  });
  it("shares exactly one identity per lesson across optional paths", () => {
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    expect(topics.filter((t) => t.lessonId)).toHaveLength(lessons.length);
    for (const p of learningPaths)
      expect(pathTopics(p).every((t) => topicById(t.id) === t)).toBe(true);
    expect(
      pathTopics(learningPaths[0]).find((t) => t.id === "zalando-postgres"),
    ).toBe(
      pathTopics(learningPaths[1]).find((t) => t.id === "zalando-postgres"),
    );
  });
  it("creates validated direct deep links and ignores unrecognized context", () => {
    const t = topicById("scheduling")!;
    expect(topicUrl(t, "alltag", "internals")).toBe(
      "/academy/scheduling?path=alltag&section=internals",
    );
    expect(topicUrl(t, "invented", "missing")).toBe("/academy/scheduling");
  });
  it("allows a substantive lesson without quizzes, tasks or time quota", () => {
    const l = structuredClone(
      lessons.find((l) => l.id === "zalando-postgres")!,
    );
    delete l.duration;
    expect(quizFor(parseLesson(l))).toBeUndefined();
    expect(
      l.sections.flatMap((s) => s.blocks).some((b) => b.type === "task"),
    ).toBe(false);
  });
});
describe("reading progress v5", () => {
  it("preserves all proofs and imports reading state without inventing a path", () => {
    const p = parseProgress(legacy);
    expect(p).toEqual({
      ...legacy,
      version: 5,
      readCompleted: ["etcd"],
      lastPath: null,
      recentLesson: "etcd",
    });
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it("manual reading and clearing it do not manufacture or remove proofs", () => {
    const p = parseProgress(legacy);
    const read = parseProgress({
      ...p,
      readCompleted: ["etcd", "zalando-postgres"],
      lastPath: "alltag",
      recentLesson: "zalando-postgres",
    });
    expect(read.theoryCompleted).toEqual(["etcd"]);
    const unread = parseProgress({ ...read, readCompleted: [] });
    expect(unread.practiceCompleted).toEqual(legacy.practiceCompleted);
    expect(unread.independentCompleted).toEqual(legacy.independentCompleted);
  });
  it("preserves the historical version 1 exclusion", () => {
    const p = parseProgress({
      ...legacy,
      version: 1,
      completed: ["linux", "control-plane"],
    });
    expect(p.readCompleted).toEqual(["linux"]);
    expect(p.theoryCompleted).toEqual(["linux"]);
  });
  it.each([
    { readCompleted: ["unknown"] },
    { readCompleted: null },
    { lastPath: "other" },
    { recentLesson: "missing" },
    { version: 6 },
  ])("rejects corrupt new fields %j", (patch) =>
    expect(() =>
      parseProgress({ ...parseProgress(legacy), ...patch }),
    ).toThrow(),
  );
});
