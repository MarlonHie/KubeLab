import { architectureLessons } from "../../../content/architecture/lessons";
import { curriculum } from "./curriculum";
const existingLessons = [
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
    duration: 30,
    description:
      "API Server, etcd, Scheduler und Controller Manager im Zusammenspiel.",
    question:
      "Welche Komponente wählt einen passenden Node für einen neuen Pod?",
    answers: ["etcd", "kube-scheduler", "CoreDNS"],
    correct: 1,
    explanation:
      "Der Scheduler bewertet noch nicht zugewiesene Pods und wählt geeignete Nodes. kubelet startet die Container auf dem gewählten Node.",
  },
  {
    id: "networking",
    title: "Vom Pod zum Service",
    category: "NETWORKING",
    duration: 20,
    description:
      "Pod-Netz, Service-Selektoren, EndpointSlices und DNS gemeinsam verstehen.",
    question:
      "Warum kann ein gültiger Service trotzdem keine Pod-Endpunkte haben?",
    answers: [
      "Sein Selektor passt zu keinem Pod im gleichen Namespace",
      "Jeder Service benötigt einen Ingress",
      "CoreDNS muss für jeden Pod neu gestartet werden",
    ],
    correct: 0,
    explanation:
      "Ein Service wählt Pods über Labels im selben Namespace. Ein falscher Selektor bleibt gültiges YAML, liefert aber keine passenden Endpunkte.",
  },
  {
    id: "cilium",
    title: "Netzwerkregeln mit Cilium",
    category: "NETWORKING",
    duration: 30,
    description:
      "CNI, eBPF und eine gezielte NetworkPolicy-Übung auf deinem echten Lab-Cluster.",
    question:
      "Was macht eine Ingress-Policy mit leerer ingress-Liste für die ausgewählten Pods?",
    answers: [
      "Sie sperrt automatisch DNS-Egress aller Pods",
      "Sie isoliert eingehenden Verkehr; passende weitere Allow-Policies können ihn erlauben",
      "Sie löscht die Services der Pods",
    ],
    correct: 1,
    explanation:
      "Die Policy betrifft Ingress der ausgewählten Pods. Kubernetes-NetworkPolicies wirken additiv; Egress wird hier nicht isoliert.",
  },
];
export const lessons = [
  ...existingLessons
    .filter((l) => ["linux", "containers"].includes(l.id))
    .map((l) => ({
      ...l,
      moduleId: l.id === "linux" ? "01" : "02",
      level: "Fundamentals" as const,
    })),
  ...architectureLessons.map((l) => ({
    id: l.id,
    title: l.title,
    category: "KUBERNETES ARCHITECTURE",
    duration: l.duration,
    description: l.description,
    question: l.questions[0].prompt,
    answers: l.questions[0].answers,
    correct: l.questions[0].correct,
    explanation: l.questions[0].explanation,
    moduleId: "03",
    level: l.level,
  })),
  ...existingLessons
    .filter((l) => ["networking", "cilium"].includes(l.id))
    .map((l) => ({ ...l, moduleId: "07", level: "Deep Dive" as const })),
];
export const phases = curriculum.map((module) => [
  module.title,
  module.topics,
  module.id,
]);
export { curriculum };
