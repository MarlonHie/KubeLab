import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { pods, type Cluster } from "../../../../packages/cluster-model/src";
const details: Record<string, { title: string; text: string }> = {
  api: {
    title: "kube-apiserver",
    text: "Der zentrale Zugang zum Cluster: validiert API-Anfragen und stellt den gespeicherten Zustand den anderen Komponenten zur Verfügung.",
  },
  etcd: {
    title: "etcd",
    text: "Der konsistente Key-Value-Store für den Clusterzustand. Nur der API Server greift direkt darauf zu.",
  },
  scheduler: {
    title: "kube-scheduler",
    text: "Beobachtet noch nicht zugewiesene Pods und wählt anhand von Anforderungen und Regeln einen passenden Node.",
  },
  controller: {
    title: "Controller Manager",
    text: "Führt Regelkreise aus und gleicht den tatsächlichen Zustand an den gewünschten Zustand an, zum Beispiel die Anzahl der Replikate.",
  },
  w1: {
    title: "worker-01 · kubelet",
    text: "kubelet beobachtet zugewiesene Pods, steuert containerd über CRI und meldet den Zustand an den API Server zurück.",
  },
  w2: {
    title: "worker-02 · kubelet",
    text: "Ein weiterer Worker führt Pods aus. Die Aufteilung im Diagramm dient der Erklärung und bildet kein echtes Scheduling ab.",
  },
};
export function ClusterGraph({
  cluster,
  compact = false,
}: {
  cluster?: Cluster;
  compact?: boolean;
}) {
  const [selected, select] = useState<string>("api");
  const [step, setStep] = useState(0);
  const { nodes, edges } = useMemo(() => {
    const base: Node[] = [
      {
        id: "api",
        position: { x: 210, y: 25 },
        data: { label: "◈  kube-apiserver" },
        className: "node-api",
      },
      { id: "etcd", position: { x: 0, y: 145 }, data: { label: "etcd" } },
      {
        id: "scheduler",
        position: { x: 210, y: 145 },
        data: { label: "Scheduler" },
      },
      {
        id: "controller",
        position: { x: 420, y: 145 },
        data: { label: "Controller Manager" },
      },
      {
        id: "w1",
        position: { x: 100, y: 295 },
        data: { label: "▦  worker-01 · kubelet" },
      },
      {
        id: "w2",
        position: { x: 330, y: 295 },
        data: { label: "▦  worker-02 · kubelet" },
      },
    ];
    const links: Edge[] = [
      ["api", "etcd"],
      ["api", "controller"],
      ["api", "scheduler"],
      ["api", "w1"],
      ["api", "w2"],
    ].map(([source, target], i) => ({
      id: `${source}-${target}`,
      source,
      target,
      animated: step > 0 && (i === step - 1 || step === 5),
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: step > 0 ? "#4f7af2" : "#acbada", strokeWidth: 1.5 },
    }));
    if (cluster) {
      pods(cluster)
        .slice(0, 6)
        .forEach((p, i) => {
          const id = `pod-${p.namespace}-${p.name}`;
          base.push({
            id,
            position: { x: i * 112 - 25, y: 430 },
            data: { label: p.name },
            className: "node-pod",
          });
          links.push({
            id: `pod-edge-${i}`,
            source: i % 2 ? "w2" : "w1",
            target: id,
            animated: true,
          });
        });
      cluster.resources
        .filter((r) => r.kind === "Service")
        .slice(0, 2)
        .forEach((r, i) => {
          const id = `svc-${r.metadata.namespace || "default"}-${r.metadata.name}`;
          base.push({
            id,
            position: { x: 100 + i * 240, y: 555 },
            data: { label: `Service · ${r.metadata.name}` },
            className: "node-service",
          });
          pods(cluster)
            .slice(0, 6)
            .filter(
              (p) =>
                p.namespace === (r.metadata.namespace || "default") &&
                Object.entries(r.spec.selector).every(
                  ([k, v]) => p.labels[k] === v,
                ),
            )
            .forEach((p) =>
              links.push({
                id: `${id}-${p.name}`,
                source: id,
                target: `pod-${p.namespace}-${p.name}`,
                animated: true,
              }),
            );
        });
    }
    return { nodes: base, edges: links };
  }, [cluster, step]);
  const selectedNode = details[selected] || {
    title:
      (nodes.find((n) => n.id === selected)?.data.label as string) ||
      "Ressource",
    text: selected.startsWith("svc-")
      ? "Ein Service verbindet über seinen Label-Selektor passende Pods. Die Linien zeigen die passenden Endpunkte."
      : "Dieser Pod wurde aus deinem Manifest simuliert. Für echte Zustände und Events benötigst du einen lokalen Cluster.",
  };
  const steps = [
    "Wähle eine Komponente, um ihre Aufgabe zu verstehen.",
    "1 · Der API Server nimmt den gewünschten Zustand entgegen und speichert ihn in etcd.",
    "2 · Controller erzeugen ReplicaSets und Pods über die API.",
    "3 · Der Scheduler weist jedem geeigneten Pod einen Node zu.",
    "4 · kubelet lässt die Runtime Container starten.",
    "5 · Statusmeldungen fließen zurück. Controller gleichen Abweichungen fortlaufend aus.",
  ];
  return (
    <div className={`graph-wrap ${compact ? "compact" : ""}`}>
      <div className="graph-canvas">
        <ReactFlow
          key={compact ? "small" : "large"}
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.25}
          maxZoom={1.6}
          nodesDraggable={!compact}
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_, n) => select(n.id)}
          onNodeDragStop={(_, n) => select(n.id)}
          proOptions={{ hideAttribution: false }}
        >
          <Background gap={20} color="var(--graph-dot)" />
          {!compact && <Controls showInteractive={false} />}
        </ReactFlow>
      </div>
      {!compact && (
        <>
          <div className="graph-inspector">
            <span className="eyebrow">KOMPONENTE IM FOKUS</span>
            <strong>{selectedNode.title}</strong>
            <p>{selectedNode.text}</p>
          </div>
          <div className="graph-walk">
            <p aria-live="polite">{steps[step]}</p>
            <button
              className="button secondary small"
              onClick={() => setStep((step + 1) % 6)}
            >
              {step === 5 ? "Ablauf zurücksetzen" : "Nächster Schritt"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
