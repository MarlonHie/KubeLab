import { type Cluster, pods } from "../../cluster-model/src";
import { apply, defaultManifest, brokenManifest, emptyCluster } from "./index";
export const serviceManifest = `apiVersion: v1
kind: Service
metadata:
  name: hello-service
spec:
  selector:
    app: hello
  ports:
    - port: 80
      targetPort: 80
`;
export const scenarios = [
  {
    id: "selector",
    title: "Deployment-Selektor reparieren",
    description:
      "Repariere den fehlerhaften Selektor und starte genau 3 Replikate.",
    hint: "selector.matchLabels und template.metadata.labels müssen zusammenpassen. Setze replicas auf 3 und wende das Manifest an.",
    source: brokenManifest,
    initial: emptyCluster,
  },
  {
    id: "service",
    title: "Service ohne Endpunkte",
    description:
      "Der Service erreicht keinen Pod. Finde die falsche Zuordnung und verbinde ihn mit beiden nginx-Pods.",
    hint: "Der Service wählt Pods im gleichen Namespace über Labels aus. Vergleiche seinen selector mit den Pod-Labels; app muss hello sein.",
    source:
      defaultManifest +
      "\n---\n" +
      serviceManifest.replace("app: hello", "app: wrong"),
    initial: apply(
      emptyCluster,
      defaultManifest +
        "\n---\n" +
        serviceManifest.replace("app: hello", "app: wrong"),
    ).cluster,
  },
  {
    id: "replicas",
    title: "Verschwundene Workloads",
    description:
      "Das Deployment existiert, aber es gibt keine Pods. Stelle genau zwei Replikate wieder her.",
    hint: "Ein Deployment mit replicas: 0 ist gültig und erzeugt keine Pods. Prüfe kubectl get deployments und skaliere auf 2.",
    source: defaultManifest.replace("replicas: 2", "replicas: 0"),
    initial: apply(
      emptyCluster,
      defaultManifest.replace("replicas: 2", "replicas: 0"),
    ).cluster,
  },
] as const;
export type ScenarioId = (typeof scenarios)[number]["id"];
export function serviceEndpoints(
  cluster: Cluster,
  service: Cluster["resources"][number],
) {
  return service.kind === "Service"
    ? pods(cluster).filter(
        (p) =>
          p.namespace === (service.metadata.namespace || "default") &&
          Object.entries(service.spec.selector).every(
            ([k, v]) => p.labels[k] === v,
          ),
      )
    : [];
}
export function taskChecks(cluster: Cluster, id: ScenarioId) {
  const deployment = cluster.resources.find(
    (r) =>
      r.kind === "Deployment" &&
      r.metadata.name === "hello-kubelab" &&
      (r.metadata.namespace || "default") === "default",
  );
  const ownPods = pods(cluster).filter(
    (p) => p.owner === "hello-kubelab" && p.namespace === "default",
  );
  const service = cluster.resources.find(
    (r) =>
      r.kind === "Service" &&
      r.metadata.name === "hello-service" &&
      (r.metadata.namespace || "default") === "default",
  );
  const expected = id === "selector" ? 3 : 2;
  const checks = [
    { label: "Deployment hello-kubelab ist angewendet", passed: !!deployment },
    {
      label: `Genau ${expected} Pods gehören zum Deployment`,
      passed: !!deployment && ownPods.length === expected,
    },
  ];
  if (id === "service")
    checks.push({
      label: "Service hello-service wählt beide Deployment-Pods aus",
      passed:
        !!service &&
        serviceEndpoints(cluster, service).length === 2 &&
        serviceEndpoints(cluster, service).every((p) =>
          ownPods.some((own) => own.name === p.name),
        ),
    });
  return checks;
}
