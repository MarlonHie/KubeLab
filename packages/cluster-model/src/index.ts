export interface Resource {
  apiVersion: string;
  kind: "Deployment" | "Pod" | "Service";
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
  };
  spec: any;
}
export interface Cluster {
  resources: Resource[];
  revision: number;
}
export const emptyCluster: Cluster = { resources: [], revision: 0 };
export function pods(cluster: Cluster) {
  return cluster.resources.flatMap((r) =>
    r.kind === "Pod"
      ? [
          {
            name: r.metadata.name,
            owner: r.metadata.name,
            labels: r.metadata.labels || {},
            namespace: r.metadata.namespace || "default",
            image: r.spec.containers[0].image,
          },
        ]
      : r.kind === "Deployment"
        ? Array.from({ length: r.spec.replicas ?? 1 }, (_, i) => ({
            name: `${r.metadata.name}-sim-${i + 1}`,
            owner: r.metadata.name,
            labels: r.spec.template.metadata.labels,
            namespace: r.metadata.namespace || "default",
            image: r.spec.template.spec.containers[0].image,
          }))
        : [],
  );
}
export function schedule(cpu: number, forced = "auto") {
  const nodes = [
    { name: "worker-01", cpu: 2 },
    { name: "worker-02", cpu: 4 },
  ];
  return (
    nodes.find((n) => (forced === "auto" || n.name === forced) && n.cpu >= cpu)
      ?.name ?? null
  );
}
