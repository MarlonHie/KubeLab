export const lessons = [
  {
    id: "linux",
    title: "Linux ist das Fundament",
    category: "LINUX & CONTAINER",
    duration: 12,
    description:
      "Prozesse, Namespaces und cgroups: verstehe, worauf Container aufbauen.",
    question:
      "Was begrenzt den CPU- und Speicherverbrauch einer Prozessgruppe?",
    answers: ["Namespaces", "cgroups", "Ein Container-Image"],
    correct: 1,
    explanation:
      "cgroups bündeln Prozesse und regeln ihren Ressourcenverbrauch. Namespaces isolieren ihre Sicht auf Systemressourcen.",
  },
  {
    id: "containers",
    title: "Vom Image zum Container",
    category: "LINUX & CONTAINER",
    duration: 15,
    description:
      "Entdecke das Zusammenspiel von Images, containerd, runc und CRI.",
    question: "Wie kommuniziert kubelet mit containerd?",
    answers: [
      "Über die CRI-Schnittstelle",
      "Direkt über etcd",
      "Über einen Ingress",
    ],
    correct: 0,
    explanation:
      "CRI ist die Schnittstelle zwischen kubelet und einer kompatiblen Container Runtime wie containerd.",
  },
  {
    id: "control-plane",
    title: "Das Gehirn deines Clusters",
    category: "CONTROL PLANE",
    duration: 20,
    description:
      "API Server, etcd, Scheduler und Controller Manager im Zusammenspiel.",
    question:
      "Welche Komponente wählt einen passenden Node für einen neuen Pod?",
    answers: ["etcd", "kube-scheduler", "CoreDNS"],
    correct: 1,
    explanation:
      "Der Scheduler bewertet noch nicht zugewiesene Pods und wählt geeignete Nodes. kubelet startet die Container auf dem gewählten Node.",
  },
];
export const phases = [
  ["Linux & Container", "Prozesse, Namespaces, containerd", "01"],
  ["Control Plane", "API Server, etcd, Scheduling", "02"],
  ["Worker Nodes", "kubelet, Registrierung, Scheduling", "03"],
  ["Networking", "Cilium, DNS, Services, Policies", "04"],
  ["External Traffic", "MetalLB, Gateway API, TLS", "05"],
  ["Storage", "PV, PVC, CSI und Longhorn", "06"],
  ["Operators", "CRDs, Reconciliation, PostgreSQL", "07"],
  ["Observability", "Prometheus, Grafana, Loki", "08"],
  ["GitOps", "Helm, Kustomize, Argo CD", "09"],
  ["Security", "RBAC, Secrets, Kyverno", "10"],
  ["Scaling & HA", "HPA, KEDA, etcd Quorum", "11"],
  ["Operations", "Backups, Upgrades, Troubleshooting", "12"],
];
