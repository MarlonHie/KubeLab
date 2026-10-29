import { describe, expect, it } from "vitest";
import { parseAllDocuments } from "yaml";
import { lessons } from "../packages/lesson-engine/src";
import { learningPaths, pathTopics, searchTopics, topicById } from "../packages/lesson-engine/src/library";
import { parseProgress } from "../apps/web/src/stores/progress";

const ids = ["resources-basics", "pods", "deployments", "networking", "ingress"];
const course = ids.map((id) => lessons.find((l) => l.id === id)!);
const blocks = (id: string) => course.find((l) => l.id === id)!.sections.flatMap((s) => s.blocks);
const manifests = (id: string): any[] => blocks(id).flatMap((b) =>
  b.type === "code" && b.language === "yaml" ? parseAllDocuments(b.code).map((d) => d.toJS()) : [],
);
const object = (id: string, kind: string, name: string) =>
  manifests(id).find((m) => m.kind === kind && m.metadata.name === name);

describe("KubeShop everyday content contract", () => {
  it("starts the everyday path with five available, unique lessons", () => {
    expect(pathTopics(learningPaths.find((p) => p.id === "alltag")!).slice(0, 5).map((t) => t.lessonId)).toEqual(ids);
    for (const l of course) {
      expect(topicById(l.id)?.lessonId).toBe(l.id);
      expect(l.sections.find((s) => s.id === "internals")?.collapsible).toBe(true);
    }
  });
  it.each([
    ["kubectl", "resources-basics"], ["Pods", "pods"], ["ReplicaSet", "deployments"],
    ["DNS", "networking"], ["HTTP Zugriff", "ingress"], ["Gateway API", "ingress"],
  ])("finds %s as an available topic", (query, id) => {
    expect(searchTopics(query, "", "available").map((t) => t.id)).toContain(id);
  });
  it("parses every YAML document, including fragments, without warnings or errors", () => {
    for (const l of course) for (const b of blocks(l.id)) {
      if (b.type !== "code" || b.language !== "yaml") continue;
      for (const d of parseAllDocuments(b.code)) {
        expect(d.errors, `${l.id}/${b.filename}`).toEqual([]);
        expect(d.warnings).toEqual([]);
      }
      expect(b.execution).toBe("example");
      expect(b.caption).toMatch(/illustrativ/i);
    }
  });
  it("keeps the same backend container from bare Pod through both Deployment examples", () => {
    const pod = object("resources-basics", "Pod", "kubeshop-api-demo");
    const deployment = object("deployments", "Deployment", "kubeshop-api");
    expect(deployment).toEqual(object("networking", "Deployment", "kubeshop-api"));
    expect(deployment.spec.template.spec.containers).toEqual(pod.spec.containers);
    expect(manifests("pods")[0].spec.containers).toEqual(pod.spec.containers);
    expect(deployment.spec.replicas).toBe(3);
    expect(deployment.spec.selector.matchLabels).toEqual(pod.metadata.labels);
  });
  it("resolves Service selectors and targetPorts to the matching Pod template", () => {
    for (const [lesson, name] of [["networking", "kubeshop-api"], ["ingress", "kubeshop-web"]]) {
      const deployment = object(lesson, "Deployment", name);
      const service = object(lesson, "Service", name);
      expect(service.metadata.namespace).toBe(deployment.metadata.namespace);
      expect(service.spec.selector).toEqual(deployment.spec.template.metadata.labels);
      expect(service.spec.ports[0].targetPort).toBe(deployment.spec.template.spec.containers[0].ports[0].containerPort);
      expect(service.spec.type).toBe("ClusterIP");
    }
  });
  it("routes Ingress and HTTPRoute to the same existing Service ports and Gateway listener", () => {
    const ingress = object("ingress", "Ingress", "kubeshop");
    const gateway = object("ingress", "Gateway", "kubeshop-gateway");
    const route = object("ingress", "HTTPRoute", "kubeshop");
    expect(route.spec.parentRefs[0].name).toBe(gateway.metadata.name);
    expect(route.spec.parentRefs[0].sectionName).toBe(gateway.spec.listeners[0].name);
    expect(route.spec.hostnames).toEqual([ingress.spec.rules[0].host]);
    expect(gateway.spec.listeners[0].hostname).toBe(route.spec.hostnames[0]);
    for (const [index, rule] of ingress.spec.rules[0].http.paths.entries()) {
      const backend = rule.backend.service;
      const service = [...manifests("networking"), ...manifests("ingress")].find((m) => m.kind === "Service" && m.metadata.name === backend.name);
      expect(service.spec.ports[0].port).toBe(backend.port.number);
      expect(route.spec.rules[index].backendRefs).toEqual([{ name: backend.name, port: backend.port.number }]);
      expect(route.spec.rules[index].matches[0].path.value).toBe(rule.path);
    }
  });
  it("uses explicit image placeholders and a consistent namespace and API contract", () => {
    const versions: Record<string, string> = { Pod: "v1", Service: "v1", Deployment: "apps/v1", Ingress: "networking.k8s.io/v1", Gateway: "gateway.networking.k8s.io/v1", HTTPRoute: "gateway.networking.k8s.io/v1" };
    for (const id of ids) for (const m of manifests(id)) {
      if (!m.kind) continue; // Deliberately labeled Pod spec fragment.
      expect(m.apiVersion).toBe(versions[m.kind]);
      expect(m.metadata.namespace).toBe("default");
      const containers = m.spec.containers ?? m.spec.template?.spec.containers ?? [];
      for (const c of containers) expect(c.image).toMatch(/^<KUBESHOP_(BACKEND|FRONTEND)_IMAGE>$/);
    }
  });
  it("retains the networking ID in old progress while accepting all five reading marks", () => {
    const p = parseProgress({ version: 4, theoryCompleted: ["networking"], practiceCompleted: [], independentCompleted: [], checkpoints: [], challenge: false, completedChallenges: [], lastLesson: "networking", theme: "dark" });
    expect(p.readCompleted).toEqual(["networking"]);
    expect(parseProgress({ ...p, readCompleted: ids }).readCompleted).toEqual(ids);
    expect(p.theoryCompleted).toEqual(["networking"]);
  });
});
