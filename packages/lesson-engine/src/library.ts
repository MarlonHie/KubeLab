import { lessonDocuments } from "../../../content/lessons/catalog";
import { parseCatalog } from "./schema";

export const categories = [
  "Orientierung & Grundlagen",
  "Architektur & Interna",
  "Anwendungen",
  "Netzwerk",
  "Daten & Operatoren",
  "Betrieb & Automatisierung",
] as const;
export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  synonyms: string[];
  lessonId?: string;
  moduleId?: string;
  recommended: string[];
  related: string[];
  deepDives: { title: string; section: string }[];
  kubeshop?: string;
  tools?: ("editor" | "visualizer" | "build")[];
}
// One metadata registry; paths and React views reference these identities.
const metadata: Record<string, Partial<Topic>> = {
  linux: {
    tags: ["Kernel", "Prozess", "VM"],
    related: ["containers", "linux-processes"],
  },
  "linux-processes": {
    tags: ["PID", "fork", "exec", "Signale"],
    recommended: ["linux"],
    related: ["container-lifecycle"],
  },
  "linux-namespaces": {
    tags: ["Isolation", "PID", "Mount", "User"],
    recommended: ["linux"],
    related: ["namespaces", "linux-networking"],
  },
  "linux-cgroups": {
    tags: ["CPU", "Speicher", "Limits"],
    recommended: ["linux"],
    related: ["scheduling"],
  },
  "linux-systemd": {
    tags: ["Units", "Dienste", "Journal"],
    recommended: ["linux-processes"],
    related: ["bootstrap"],
  },
  "linux-networking": {
    tags: ["DNS", "TCP", "Routing", "Sockets"],
    recommended: ["linux"],
    related: ["networking", "dns"],
  },
  containers: {
    tags: ["Image", "Runtime", "Docker", "OCI"],
    related: ["container-images", "container-runtime"],
  },
  "container-images": {
    tags: ["OCI", "Digest", "Registry", "Layer"],
    recommended: ["containers"],
    related: ["container-lifecycle"],
  },
  "container-runtime": {
    tags: ["containerd", "runc", "Shim"],
    recommended: ["containers"],
    related: ["container-cri", "bootstrap"],
  },
  "container-cri": {
    tags: ["CRI", "crictl", "Sandbox"],
    recommended: ["container-runtime"],
    related: ["kubelet-runtime"],
  },
  "container-lifecycle": {
    tags: ["OOM", "Restart", "Exit", "Readiness"],
    recommended: ["containers"],
    related: ["kubelet-runtime"],
  },
  "cluster-basics": {
    tags: ["kubectl", "YAML", "Ressourcen", "Cluster", "Namespace"],
    synonyms: ["Kubernetes CLI", "Orientierung"],
    related: ["pods", "namespaces", "control-plane"],
    tools: ["visualizer"],
  },
  "control-plane": {
    tags: ["Worker", "Node", "Static Pods", "API Server"],
    recommended: ["cluster-basics"],
    related: ["etcd", "bootstrap"],
    tools: ["visualizer"],
  },
  "api-lifecycle": {
    tags: [
      "API Server",
      "Admission",
      "Authentifizierung",
      "Autorisierung",
      "SSA",
    ],
    recommended: ["cluster-basics"],
    related: ["rbac", "operators", "gitops"],
  },
  etcd: {
    tags: ["Raft", "Quorum", "MVCC", "Datenbank"],
    synonyms: ["Konsens", "Leader Election"],
    recommended: ["control-plane"],
    related: ["ha", "backup"],
    deepDives: [{ title: "etcd, Raft und MVCC", section: "internals" }],
  },
  controllers: {
    tags: [
      "Controller",
      "Reconciliation",
      "Deployment",
      "ReplicaSet",
      "Informer",
    ],
    synonyms: ["Regelkreis"],
    related: ["deployments", "operators"],
    tools: ["editor"],
  },
  scheduling: {
    tags: ["Scheduler", "Requests", "Limits", "Affinity", "Taints", "Scoring"],
    synonyms: ["Pod-Platzierung", "Scheduling Framework"],
    related: ["resources", "storage"],
    deepDives: [
      { title: "Scheduler Framework und Binding", section: "internals" },
    ],
    tools: ["visualizer"],
  },
  "kubelet-runtime": {
    tags: ["kubelet", "CRI", "Probes", "Readiness", "Liveness", "PLEG"],
    related: ["probes", "container-cri"],
  },
  "apply-to-pod": {
    tags: ["kubectl", "YAML", "Rollout", "Events", "Status"],
    synonyms: ["Kubernetes CLI"],
    related: ["deployments", "troubleshooting"],
    tools: ["editor"],
  },
  "component-failures": {
    tags: ["Ausfall", "Node", "Recovery", "Diagnose"],
    related: ["ha", "backup", "troubleshooting"],
    tools: ["visualizer"],
  },
  networking: {
    title: "Services und Pod-Verbindungen",
    category: "Netzwerk",
    tags: ["Service", "ClusterIP", "EndpointSlice", "Labels", "Ports"],
    synonyms: ["Service-Routing"],
    related: ["dns", "ingress", "gateway", "cilium"],
    recommended: ["pods"],
    kubeshop: "Frontend und Backend trotz wechselnder Pod-Adressen verbinden.",
    tools: ["editor", "visualizer"],
  },
  cilium: {
    category: "Netzwerk",
    tags: ["CNI", "eBPF", "NetworkPolicy", "Hubble"],
    synonyms: ["NetworkPolicies", "Pod-Netzwerk"],
    related: ["network-policies", "networking"],
    recommended: ["linux-networking"],
  },
  "zalando-postgres": {
    category: "Daten & Operatoren",
    tags: ["Operator", "PostgreSQL", "Patroni", "StatefulSet", "CRD"],
    synonyms: [
      "Postgres",
      "Postgres Operator",
      "Zalando Operator",
      "Zalando Postgres Operator",
    ],
    recommended: ["operators", "storage", "networking"],
    related: ["statefulsets", "secrets", "backup"],
    deepDives: [
      { title: "PostgreSQL-Replikation und Patroni", section: "internals" },
    ],
    kubeshop:
      "Eine Bestelldatenbank über einen deklarativen Betriebsvertrag verwalten.",
  },
};
const planned: [string, string, string, string, string[]][] = [
  [
    "pods",
    "Pods",
    "Anwendungen",
    "Container gemeinsam ausführen und ihre Lebensdauer verstehen.",
    ["Pod"],
  ],
  [
    "deployments",
    "Deployments und ReplicaSets",
    "Anwendungen",
    "Replikate verwalten und Anwendungen schrittweise aktualisieren.",
    ["Deployment", "ReplicaSet", "Rollout"],
  ],
  [
    "configmaps",
    "ConfigMaps",
    "Anwendungen",
    "Anwendungskonfiguration vom Image trennen.",
    ["ConfigMap", "Konfiguration"],
  ],
  [
    "secrets",
    "Secrets",
    "Anwendungen",
    "Sensible Konfiguration und ihren Zugriff einordnen.",
    ["Secret", "Passwort"],
  ],
  [
    "namespaces",
    "Kubernetes Namespaces",
    "Orientierung & Grundlagen",
    "Ressourcen im Cluster ordnen und ihren Geltungsbereich verstehen.",
    ["Namespace", "Scope"],
  ],
  [
    "jobs",
    "Jobs und CronJobs",
    "Anwendungen",
    "Einmalige und zeitgesteuerte Arbeit ausführen.",
    ["Job", "CronJob", "Batch"],
  ],
  [
    "daemonsets",
    "DaemonSets",
    "Anwendungen",
    "Dienste auf geeigneten Nodes betreiben.",
    ["DaemonSet"],
  ],
  [
    "resources",
    "Requests, Limits und Skalierung",
    "Anwendungen",
    "Ressourcenbedarf, Begrenzung und HPA auseinanderhalten.",
    ["CPU", "Speicher", "QoS", "HPA", "Metrics Server"],
  ],
  [
    "probes",
    "Probes und Bereitschaft",
    "Anwendungen",
    "Startup, Readiness und Liveness gezielt einsetzen.",
    ["Probe", "Healthcheck"],
  ],
  [
    "dns",
    "DNS und CoreDNS",
    "Netzwerk",
    "Services über Namen finden und Auflösung getrennt diagnostizieren.",
    ["CoreDNS", "DNS"],
  ],
  [
    "ingress",
    "Ingress",
    "Netzwerk",
    "HTTP-Zugriff über Regeln und einen Ingress Controller verstehen.",
    ["HTTP-Zugriff", "HTTP Zugriff", "Ingress Controller"],
  ],
  [
    "gateway",
    "Gateway API",
    "Netzwerk",
    "Listener, HTTPRoute und Backend-Ziele miteinander verbinden.",
    ["Gateway", "HTTPRoute", "HTTP-Routing"],
  ],
  [
    "tls",
    "TLS und cert-manager",
    "Netzwerk",
    "Zertifikate, Vertrauen und Erneuerung verstehen.",
    ["HTTPS", "Issuer", "cert-manager"],
  ],
  [
    "network-policies",
    "NetworkPolicies",
    "Netzwerk",
    "Erlaubte Verbindungen gezielt beschreiben.",
    ["NetworkPolicy", "Firewall", "Hubble"],
  ],
  [
    "metallb",
    "MetalLB",
    "Netzwerk",
    "LoadBalancer-Adressen im lokalen Netz bereitstellen.",
    ["LoadBalancer", "Bare Metal"],
  ],
  [
    "storage",
    "PersistentVolumes und PVCs",
    "Daten & Operatoren",
    "Dauerhaften Speicher anfordern und seine Lebensdauer verstehen.",
    [
      "PV",
      "PVC",
      "PersistentVolume",
      "PersistentVolumeClaim",
      "CSI",
      "StorageClass",
    ],
  ],
  [
    "statefulsets",
    "StatefulSets",
    "Daten & Operatoren",
    "Identität und Storage zustandsbehafteter Anwendungen verstehen.",
    ["StatefulSet", "Headless Service"],
  ],
  [
    "longhorn",
    "Longhorn",
    "Daten & Operatoren",
    "Verteilten Storage von Datenbankreplikation und Backup unterscheiden.",
    ["CSI", "Volumes"],
  ],
  [
    "operators",
    "Custom Resources und Operatoren",
    "Daten & Operatoren",
    "Kubernetes um deklarative Betriebsverträge erweitern.",
    ["CRD", "Custom Resource", "Operator", "Reconciliation"],
  ],
  [
    "observability",
    "Prometheus und Monitoring",
    "Betrieb & Automatisierung",
    "Metriken, Dashboards und Alarmierung sinnvoll einsetzen.",
    ["Prometheus Operator", "Grafana", "Alertmanager", "SLI", "SLO"],
  ],
  [
    "logs",
    "Logs, Events und Troubleshooting",
    "Betrieb & Automatisierung",
    "Beobachtungen mit Ursachen verbinden.",
    ["Loki", "Grafana Alloy", "Logging", "Events"],
  ],
  [
    "helm",
    "Helm",
    "Betrieb & Automatisierung",
    "Charts, Values und resultierende Ressourcen verstehen.",
    ["Chart", "Packaging"],
  ],
  [
    "kustomize",
    "Kustomize",
    "Betrieb & Automatisierung",
    "Umgebungsspezifische Änderungen mit Basis und Overlays verwalten.",
    ["Overlay", "Patch"],
  ],
  [
    "gitops",
    "Argo CD und GitOps",
    "Betrieb & Automatisierung",
    "Git-Zielzustand, Sync und Health auseinanderhalten.",
    ["ArgoCD", "Argo CD", "ApplicationSets", "GitOps"],
  ],
  [
    "rbac",
    "RBAC und ServiceAccounts",
    "Betrieb & Automatisierung",
    "API-Zugriffe nach Rollen und Identitäten begrenzen.",
    ["Role", "ClusterRole", "ServiceAccount", "Security", "Sicherheit"],
  ],
  [
    "security",
    "Pod Security und Kyverno",
    "Betrieb & Automatisierung",
    "Ausführungsregeln und Admission Policies einordnen.",
    ["SecurityContext", "Kyverno", "Pod Security"],
  ],
  [
    "external-secrets",
    "External Secrets Operator",
    "Daten & Operatoren",
    "Secret-Quelle, Synchronisierung und Verbraucher unterscheiden.",
    ["ESO", "Rotation"],
  ],
  [
    "bootstrap",
    "Clusteraufbau mit kubeadm",
    "Betrieb & Automatisierung",
    "Bootstrap und Node-Konfiguration anhand erklärter Schritte nachvollziehen.",
    ["kubeadm", "Installation", "Ubuntu", "Node Join"],
  ],
  [
    "ha",
    "High Availability",
    "Betrieb & Automatisierung",
    "Fehlerdomänen, Quorum und Verfügbarkeit trennen.",
    ["HA", "Failover"],
  ],
  [
    "backup",
    "Backup und Recovery",
    "Betrieb & Automatisierung",
    "Daten- und Clustersicherungen durch Restore prüfen.",
    ["Velero", "Restore", "Wiederherstellung"],
  ],
  [
    "upgrades",
    "Upgrades und Wartung",
    "Betrieb & Automatisierung",
    "Node-Wartung, Zertifikate und Versionswechsel planen.",
    ["Drain", "PDB", "Upgrade"],
  ],
  [
    "troubleshooting",
    "Fehler systematisch eingrenzen",
    "Betrieb & Automatisierung",
    "Von Symptomen über Belege zur begründeten Korrektur gelangen.",
    ["CrashLoopBackOff", "Pending", "ImagePullBackOff"],
  ],
  [
    "keda",
    "KEDA",
    "Betrieb & Automatisierung",
    "Ereignisbezogene Skalierung vom CPU-HPA unterscheiden.",
    ["Autoscaling", "ScaledObject"],
  ],
  [
    "infrastructure",
    "OpenTofu, Terraform und Ansible",
    "Betrieb & Automatisierung",
    "Infrastrukturdefinition von Node-Konfiguration trennen.",
    ["IaC", "Terraform", "Ansible", "OpenTofu"],
  ],
];
const connections: Record<string, Partial<Topic>> = {
  pods: {
    related: ["cluster-basics", "deployments", "kubelet-runtime"],
    tools: ["editor"],
  },
  deployments: {
    related: ["controllers", "apply-to-pod", "pods"],
    tools: ["editor"],
  },
  ingress: { recommended: ["networking", "pods"], related: ["gateway", "tls"] },
  gateway: {
    recommended: ["networking"],
    related: ["ingress", "tls", "metallb"],
  },
  storage: { related: ["statefulsets", "zalando-postgres", "longhorn"] },
  statefulsets: { related: ["storage", "zalando-postgres"] },
  operators: {
    recommended: ["cluster-basics"],
    related: ["controllers", "zalando-postgres", "external-secrets"],
  },
  bootstrap: {
    related: ["control-plane", "container-runtime", "cilium"],
    tools: ["build"],
  },
  resources: { related: ["scheduling", "linux-cgroups", "keda"] },
  probes: { related: ["kubelet-runtime", "container-lifecycle"] },
  dns: { related: ["networking", "linux-networking"] },
  "network-policies": { related: ["cilium", "networking"] },
  troubleshooting: {
    related: ["component-failures", "apply-to-pod"],
    tools: ["editor"],
  },
  ha: { related: ["etcd", "component-failures", "control-plane"] },
  backup: { related: ["component-failures", "zalando-postgres", "etcd"] },
  rbac: { related: ["api-lifecycle", "namespaces", "security"] },
};
const documents = parseCatalog(lessonDocuments);
export const topics: Topic[] = [
  ...documents.map((l): Topic => ({
    id: l.id,
    lessonId: l.id,
    moduleId: l.moduleId,
    title: l.title,
    description: l.description,
    category: ["01", "02"].includes(l.moduleId) ? categories[0] : categories[1],
    tags: [],
    synonyms: [],
    recommended: [],
    related: [],
    deepDives: l.sections
      .filter((s) => s.collapsible)
      .map((s) => ({ title: s.title, section: s.id })),
    ...metadata[l.id],
  })),
  ...planned.map(([id, title, category, description, tags]): Topic => ({
    id,
    title,
    category,
    description,
    tags,
    synonyms: [],
    recommended: [],
    related: [],
    deepDives: [],
    ...connections[id],
  })),
];
export const topicById = (id: string) => topics.find((t) => t.id === id);
export interface LearningPath {
  id: string;
  title: string;
  audience: string;
  description: string;
  highlights: string[];
  steps: { title: string; topics: string[] }[];
}
const step = (title: string, ...topics: string[]) => ({ title, topics });
export const learningPaths: LearningPath[] = [
  {
    id: "alltag",
    title: "Kubernetes im Alltag",
    audience: "Für Entwickler auf bestehenden Clustern",
    description:
      "Anwendungen verstehen, konfigurieren und Fehler eingrenzen. Ohne vorherige Clusterinstallation.",
    highlights: ["Workloads", "Services", "PostgreSQL", "GitOps"],
    steps: [
      step(
        "Orientierung im Cluster",
        "cluster-basics",
        "namespaces",
        "apply-to-pod",
      ),
      step(
        "Pods und Workloads",
        "pods",
        "deployments",
        "controllers",
        "jobs",
        "daemonsets",
      ),
      step("Anwendungskonfiguration", "configmaps", "secrets"),
      step("Services und DNS", "networking", "dns"),
      step("HTTP-Zugriff", "ingress", "gateway", "tls"),
      step(
        "Ressourcen und Bereitschaft",
        "resources",
        "probes",
        "kubelet-runtime",
        "scheduling",
      ),
      step("Dauerhafte Daten", "storage", "statefulsets"),
      step("Erweiterungen", "operators"),
      step("PostgreSQL verwenden", "zalando-postgres"),
      step(
        "Beobachten und diagnostizieren",
        "observability",
        "logs",
        "troubleshooting",
        "component-failures",
      ),
      step("Packaging und GitOps", "helm", "kustomize", "gitops"),
      step("Grundlegende Sicherheit", "rbac", "security"),
    ],
  },
  {
    id: "verstehen",
    title: "Kubernetes verstehen",
    audience: "Für Einsteiger und neugierige Entwickler",
    description:
      "Von Prozessen und Containern zum Zusammenspiel eines Clusters. Du kannst jederzeit ein Thema überspringen.",
    highlights: ["Linux", "Container", "Architektur", "Regelkreise"],
    steps: [
      step(
        "Linux-Grundlagen",
        "linux",
        "linux-processes",
        "linux-namespaces",
        "linux-cgroups",
        "linux-systemd",
        "linux-networking",
      ),
      step(
        "Container und Laufzeit",
        "containers",
        "container-images",
        "container-runtime",
        "container-cri",
        "container-lifecycle",
      ),
      step("Warum Kubernetes?", "cluster-basics"),
      step("Cluster und Rollen", "control-plane"),
      step("API und gespeicherter Zustand", "api-lifecycle", "etcd"),
      step("Regelkreise", "controllers"),
      step(
        "Platzierung und Ausführung",
        "scheduling",
        "kubelet-runtime",
        "apply-to-pod",
      ),
      step("Networking", "networking", "cilium", "dns"),
      step("Storage", "storage", "statefulsets"),
      step("Erweiterbarkeit", "operators", "zalando-postgres"),
    ],
  },
  {
    id: "betreiben",
    title: "Kubernetes betreiben",
    audience: "Für alle, die Clusterbetrieb verstehen möchten",
    description:
      "Aufbau, Beobachtung und Wiederherstellung anhand von Modellen und Beispielen. Ein echter Cluster ist nicht erforderlich.",
    highlights: ["kubeadm", "Cilium", "Observability", "Recovery"],
    steps: [
      step("Clusteraufbau", "bootstrap", "control-plane"),
      step(
        "Runtime und Nodes",
        "container-runtime",
        "linux-systemd",
        "kubelet-runtime",
      ),
      step("CNI und Cilium", "cilium"),
      step(
        "Netzwerk und DNS",
        "networking",
        "dns",
        "network-policies",
        "metallb",
      ),
      step("Storage und CSI", "storage", "longhorn"),
      step("Observability", "observability", "logs"),
      step("Security", "rbac", "security", "external-secrets"),
      step("High Availability", "ha", "etcd", "scheduling", "keda"),
      step("Backup und Recovery", "backup", "zalando-postgres"),
      step(
        "Wartung und Fehlersuche",
        "upgrades",
        "component-failures",
        "troubleshooting",
        "infrastructure",
      ),
    ],
  },
];
export const pathTopics = (path: LearningPath) =>
  [...new Set(path.steps.flatMap((s) => s.topics))].map((id) => topicById(id)!);
export const topicPaths = (id: string) =>
  learningPaths.filter((p) => p.steps.some((s) => s.topics.includes(id)));
export function topicUrl(topic: Topic, path?: string, section?: string) {
  const query = new URLSearchParams();
  if (path && learningPaths.some((p) => p.id === path)) query.set("path", path);
  if (section && topic.deepDives.some((d) => d.section === section))
    query.set("section", section);
  return `${topic.lessonId ? "/academy/" + topic.lessonId : "/topics/" + topic.id}${query.size ? "?" + query : ""}`;
}
export const normalizeSearch = (s: string) =>
  s
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const aliases = [
  ["ingress", "http zugriff"],
  ["pvc", "persistentvolumeclaim", "pvcs"],
  ["postgres", "postgresql"],
  ["zalando operator", "postgres operator", "zalando postgres operator"],
  ["kubectl", "kubernetes cli"],
];
export function searchTopics(query: string, category = "", availability = "") {
  const normalized = normalizeSearch(query);
  const alternatives = new Set([normalized]);
  for (const group of aliases)
    for (const alias of group) {
      const pattern = new RegExp(`(^| )${alias}(?= |$)`);
      if (pattern.test(normalized))
        for (const other of group)
          alternatives.add(
            normalized.replace(pattern, (_, lead) => lead + other),
          );
    }
  return topics
    .filter(
      (t) =>
        (!category || t.category === category) &&
        (!availability ||
          (availability === "available" ? !!t.lessonId : !t.lessonId)),
    )
    .map((t) => {
      const title = normalizeSearch(t.title);
      const haystack = normalizeSearch(
        [
          t.title,
          t.description,
          ...t.tags,
          ...t.synonyms,
          ...t.deepDives.map((d) => d.title),
        ].join(" "),
      );
      const match =
        !normalized ||
        [...alternatives].some((a) =>
          a.split(" ").every((word) => haystack.includes(word)),
        );
      return {
        t,
        score: title === normalized ? 3 : title.includes(normalized) ? 2 : 1,
        match,
      };
    })
    .filter((x) => x.match)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(!!b.t.lessonId) - Number(!!a.t.lessonId) ||
        a.t.title.localeCompare(b.t.title, "de"),
    )
    .map((x) => x.t);
}
// Fail early on broken content references, never silently drop a path step.
const ids = new Set(topics.map((t) => t.id));
if (ids.size !== topics.length) throw new Error("Doppelte Themen-ID");
for (const t of topics) {
  if (!categories.some((c) => c === t.category))
    throw new Error(`Unbekannte Kategorie: ${t.id}`);
  for (const id of [...t.recommended, ...t.related])
    if (!ids.has(id)) throw new Error(`Unbekannter Themenverweis: ${id}`);
  for (const d of t.deepDives)
    if (
      !documents
        .find((l) => l.id === t.lessonId)
        ?.sections.some((s) => s.id === d.section)
    )
      throw new Error(`Unbekannter Deep Dive: ${t.id}`);
}
for (const p of learningPaths)
  for (const id of p.steps.flatMap((s) => s.topics))
    if (!ids.has(id)) throw new Error(`Unbekanntes Lernpfadthema: ${id}`);
