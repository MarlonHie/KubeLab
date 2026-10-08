import { describe, it, expect } from "vitest";
import {
  apply,
  command,
  defaultManifest,
  brokenManifest,
  emptyCluster,
  pods,
} from "../packages/simulation-engine/src";
import { validateYaml } from "../packages/validation/src";
import { schedule } from "../packages/cluster-model/src";
import { parseProgress } from "../apps/web/src/stores/progress";
describe("Kubernetes simulation", () => {
  it("creates, reapplies, scales, and deletes without duplicating resources", () => {
    const first = apply(emptyCluster, defaultManifest);
    expect(first.ok).toBe(true);
    expect(pods(first.cluster)).toHaveLength(2);
    const again = apply(first.cluster, defaultManifest);
    expect(again.cluster.resources).toHaveLength(1);
    const scaled = command(
      again.cluster,
      "kubectl scale deployment hello-kubelab --replicas=3",
      "",
    );
    expect(pods(scaled.cluster)).toHaveLength(3);
    expect(pods(first.cluster)).toHaveLength(2);
    const removed = command(
      scaled.cluster,
      "kubectl delete deployment hello-kubelab",
      "",
    );
    expect(pods(removed.cluster)).toHaveLength(0);
  });
  it("rejects selector mismatch and preserves the current cluster", () => {
    const c = apply(emptyCluster, defaultManifest).cluster;
    const result = apply(c, brokenManifest);
    expect(result.ok).toBe(false);
    expect(result.cluster).toBe(c);
    expect(result.output).toContain("selector.matchLabels");
  });
  it("rejects all documents atomically if any manifest is invalid", () => {
    expect(
      apply(emptyCluster, defaultManifest + "\n---\nkind: Service").cluster
        .resources,
    ).toHaveLength(0);
  });
  it.each([
    "",
    "[bad",
    defaultManifest.replace("replicas: 2", "replicas: -1"),
    defaultManifest.replace("replicas: 2", "replicas: 21"),
    defaultManifest.replace("apps/v1", "v1"),
    defaultManifest.replace("name: hello-kubelab", "name: Bad_Name"),
  ])("rejects malformed and unsupported manifests", (source) => {
    expect(validateYaml(source).errors.length).toBeGreaterThan(0);
  });
  it("supports standalone pods and selector services", () => {
    const r = validateYaml(
      "apiVersion: v1\nkind: Pod\nmetadata:\n  name: test\nspec:\n  containers:\n    - name: web\n      image: nginx\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80",
    );
    expect(r.errors).toEqual([]);
    expect(r.resources).toHaveLength(2);
  });
  it("keeps namespaces separate and scopes terminal actions to default", () => {
    const source = defaultManifest.replace(
      "name: hello-kubelab",
      "name: hello-kubelab\n  namespace: other",
    );
    const c = apply(
      apply(emptyCluster, source).cluster,
      defaultManifest,
    ).cluster;
    expect(c.resources).toHaveLength(2);
    expect(
      command(c, "kubectl delete deployment hello-kubelab", "").cluster
        .resources[0].metadata.namespace,
    ).toBe("other");
  });
  it("does not execute shell commands or silently ignore unsupported flags", () => {
    for (const input of [
      "rm -rf /",
      "kubectl get pods --all-namespaces",
      "kubectl get pods | cat",
      "kubectl scale deployment hello-kubelab --replicas=2.5",
    ])
      expect(command(emptyCluster, input, "").ok).toBe(false);
  });
});
describe("Scheduler teaching model", () => {
  it("respects capacity and forced node", () => {
    expect(schedule(2)).toBe("worker-01");
    expect(schedule(3)).toBe("worker-02");
    expect(schedule(3, "worker-01")).toBeNull();
    expect(schedule(6)).toBeNull();
  });
});
describe("Progress import", () => {
  const valid = {
    version: 1,
    completed: ["linux"],
    checkpoints: [0, 1],
    challenge: false,
    lastLesson: "linux",
    theme: "light",
  };
  it("accepts versioned data and removes duplicate IDs", () => {
    expect(parseProgress({ ...valid, completed: ["linux", "linux"] })).toEqual(
      valid,
    );
  });
  it.each([
    null,
    {},
    { ...valid, version: 2 },
    { ...valid, completed: ["unknown"] },
    { ...valid, checkpoints: [99] },
    { ...valid, theme: "system" },
  ])("rejects corrupt imports", (value) => {
    expect(() => parseProgress(value)).toThrow();
  });
});
