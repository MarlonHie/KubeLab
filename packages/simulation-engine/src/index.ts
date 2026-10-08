import { emptyCluster, pods, type Cluster } from "../../cluster-model/src";
import { validateYaml } from "../../validation/src";
export { emptyCluster, pods };
export const defaultManifest = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-kubelab
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
        - name: nginx
          image: nginx:1.28
          ports:
            - containerPort: 80
`;
export const brokenManifest = defaultManifest.replace(
  "app: hello\n  template:",
  "app: broken\n  template:",
);
export function apply(cluster: Cluster, source: string) {
  const result = validateYaml(source);
  if (result.errors.length)
    return { cluster, output: result.errors.join("\n"), ok: false };
  const resources = [...cluster.resources];
  for (const r of result.resources) {
    const i = resources.findIndex(
      (x) =>
        x.kind === r.kind &&
        x.metadata.name === r.metadata.name &&
        (x.metadata.namespace || "default") ===
          (r.metadata.namespace || "default"),
    );
    if (i >= 0) resources[i] = r;
    else resources.push(r);
  }
  return {
    cluster: { resources, revision: cluster.revision + 1 },
    output: result.resources
      .map(
        (r) =>
          `${r.kind.toLowerCase()}/${r.metadata.name} configured (simuliert)`,
      )
      .join("\n"),
    ok: true,
  };
}
export function command(
  cluster: Cluster,
  input: string,
  source: string,
): { cluster: Cluster; output: string; ok: boolean } {
  const a = input.trim().split(/\s+/);
  const done = (output: string, ok = true) => ({ cluster, output, ok });
  if (input.trim() === "help")
    return done(
      "Simulation · erlaubte Befehle:\n kubectl apply -f deployment.yaml\n kubectl get pods|deployments|services|nodes\n kubectl describe pod NAME\n kubectl scale deployment NAME --replicas=3\n kubectl delete deployment|pod|service NAME\n clear\nNur Namespace default. Kein Zugriff auf deinen Rechner.",
    );
  if (a[0] !== "kubectl")
    return done(
      "Befehl nicht unterstützt. Mit help siehst du alle simulierten Befehle.",
      false,
    );
  if (
    a.length === 4 &&
    a[1] === "apply" &&
    a[2] === "-f" &&
    a[3] === "deployment.yaml"
  )
    return apply(cluster, source);
  if (a[1] === "get" && a.length === 3) {
    if (["pods", "pod", "po"].includes(a[2]))
      return done(
        "NAME                         READY   STATUS\n" +
          (pods(cluster)
            .filter((p) => p.namespace === "default")
            .map((p) => `${p.name.padEnd(29)}1/1     Running`)
            .join("\n") || "Keine Pods in default."),
      );
    if (["nodes", "node", "no"].includes(a[2]))
      return done(
        "NAME           STATUS   ROLES\ncontrol-01     Ready    control-plane\nworker-01      Ready    worker\nworker-02      Ready    worker",
      );
    const kind = (
      {
        deployments: "Deployment",
        deployment: "Deployment",
        deploy: "Deployment",
        services: "Service",
        service: "Service",
        svc: "Service",
      } as Record<string, string>
    )[a[2]];
    if (kind)
      return done(
        "NAME                  KIND          DETAILS\n" +
          (cluster.resources
            .filter(
              (r) =>
                r.kind === kind &&
                (r.metadata.namespace || "default") === "default",
            )
            .map(
              (r) =>
                `${r.metadata.name.padEnd(22)}${r.kind.padEnd(14)}${r.kind === "Deployment" ? `${r.spec.replicas ?? 1} replicas` : `Port ${r.spec.ports.map((p: any) => p.port).join(", ")}`}`,
            )
            .join("\n") || "Keine Ressourcen in default."),
      );
  }
  if (a[1] === "describe" && a[2] === "pod" && a.length === 4) {
    const p = pods(cluster).find(
      (p) => p.name === a[3] && p.namespace === "default",
    );
    return p
      ? done(
          `Name: ${p.name}\nNamespace: default\nImage: ${p.image}\nStatus: Running (simuliert)\nOwner: ${p.owner}\nEvents: Scheduled → Pulled → Started`,
        )
      : done("Pod nicht gefunden.", false);
  }
  if (
    a[1] === "scale" &&
    a[2] === "deployment" &&
    a.length === 5 &&
    /^--replicas=\d+$/.test(a[4])
  ) {
    const count = Number(a[4].split("=")[1]);
    if (count > 20)
      return done("Simulationslimit: maximal 20 Replikate.", false);
    const r = cluster.resources.find(
      (r) =>
        r.kind === "Deployment" &&
        r.metadata.name === a[3] &&
        (r.metadata.namespace || "default") === "default",
    );
    if (!r) return done("Deployment nicht gefunden.", false);
    return {
      cluster: {
        resources: cluster.resources.map((x) =>
          x === r ? { ...x, spec: { ...x.spec, replicas: count } } : x,
        ),
        revision: cluster.revision + 1,
      },
      output: `deployment/${a[3]} scaled to ${count} (simuliert)`,
      ok: true,
    };
  }
  if (a[1] === "delete" && a.length === 4) {
    const index = cluster.resources.findIndex(
      (r) =>
        r.kind.toLowerCase() === a[2] &&
        r.metadata.name === a[3] &&
        (r.metadata.namespace || "default") === "default",
    );
    if (index < 0)
      return done(
        "Ressource nicht gefunden. Generierte Pods werden über ihr Deployment verwaltet.",
        false,
      );
    return {
      cluster: {
        resources: cluster.resources.filter((_, i) => i !== index),
        revision: cluster.revision + 1,
      },
      output: `${a[2]}/${a[3]} deleted (simuliert)`,
      ok: true,
    };
  }
  return done(
    "Syntax nicht unterstützt. Gib help ein. Flags, Shell-Pipes und echte Shell-Befehle sind nicht verfügbar.",
    false,
  );
}
