# KubeLab – Gesamtarchitektur und Entwicklungsroadmap

Ich würde KubeLab als kostenlose, interaktive Open-Source-Lernplattform für Kubernetes Engineering entwickeln. Der Schwerpunkt liegt nicht nur auf dem Deployment von Anwendungen, sondern auf dem vollständigen Aufbau, der Konfiguration, dem Betrieb und dem Troubleshooting realitätsnaher Kubernetes-Cluster.

Dabei verfolgen wir drei Ziele:

1. Kubernetes von Grund auf verstehen: Linux, Container Runtime, Control Plane, Networking, Storage und Clusterverwaltung.
2. Enterprise-Kubernetes aufbauen: Ein Cluster mit Operatoren, Monitoring, GitOps, Security, Datenbanken und High Availability.
3. Wissen praktisch anwenden: Fertige Cluster untersuchen, konfigurieren, Fehler finden und Aufgaben lösen.

Die Plattform selbst bleibt kostenlos gehostet. Echte Cluster laufen auf den Rechnern der Lernenden.

# 1. Die vollständige Kubernetes-Landschaft

Unser Zielcluster soll möglichst viele Komponenten enthalten, die man auch in professionellen Unternehmensumgebungen findet.

External Access

DNS · TLS · Gateway API · Ingress

Kubernetes Cluster

Target Architecture

Control Plane

API · etcd · Scheduler · Controllers

Worker 01

kubelet · containerd · Pods

Worker 02

kubelet · containerd · Pods

Networking

Cilium · Hubble · MetalLB

Storage

CSI · Longhorn · PVC

Observability

Prometheus · Grafana · Loki

GitOps

Argo CD · Helm · Kustomize

Security

Kyverno · cert-manager · RBAC

Databases

Zalando Postgres Operator

## 1.1 Komponenten und Operatoren im Detail

| Bereich             | Komponente                | Lernziel                           |
| ------------------- | ------------------------- | ---------------------------------- |
| Betriebssystem      | Ubuntu Server             | Linux, Prozesse, Netzwerk, systemd |
| Virtualisierung     | Linux-VMs                 | Nodes und Netzwerkisolation        |
| Container Runtime   | containerd, runc          | Container ausführen                |
| Container Interface | CRI                       | kubelet ↔ Runtime                  |
| Cluster Bootstrap   | kubeadm                   | Kubernetes installieren            |
| Node Agent          | kubelet                   | Pods auf Nodes verwalten           |
| Control Plane       | kube-apiserver            | Kubernetes API                     |
| Control Plane       | etcd                      | Clusterzustand speichern           |
| Control Plane       | kube-scheduler            | Pod-Platzierung                    |
| Control Plane       | kube-controller-manager   | Reconciliation                     |
| Networking          | Cilium                    | CNI, eBPF, NetworkPolicies         |
| Networking          | Hubble                    | Netzwerkverkehr beobachten         |
| Networking          | CoreDNS                   | DNS-Auflösung                      |
| Networking          | MetalLB                   | Bare-Metal LoadBalancer            |
| Networking          | Gateway API + Controller  | HTTP-Routing                       |
| Zertifikate         | cert-manager              | TLS-Zertifikate                    |
| Storage             | CSI                       | Storage-Schnittstellen             |
| Storage             | Longhorn                  | Persistenter, verteilter Storage   |
| Datenbanken         | Zalando Postgres Operator | PostgreSQL, Replikation, Failover  |
| Monitoring          | Prometheus Operator       | Monitoring-Konfiguration           |
| Monitoring          | Prometheus                | Metriken                           |
| Monitoring          | Grafana                   | Dashboards                         |
| Monitoring          | Alertmanager              | Benachrichtigungen                 |
| Logging             | Loki + Grafana Alloy      | Logs sammeln und analysieren       |
| GitOps              | Argo CD                   | Git-basierte Deployments           |
| Packaging           | Helm                      | Kubernetes-Anwendungen paketieren  |
| Konfiguration       | Kustomize                 | Umgebungsspezifische Anpassungen   |
| Secrets             | External Secrets Operator | Externe Secrets synchronisieren    |
| Security            | Kyverno                   | Admission Policies                 |
| Security            | RBAC                      | Zugriffsberechtigungen             |
| Autoscaling         | Metrics Server + HPA      | Pod-Skalierung                     |
| Autoscaling         | KEDA                      | Ereignisbasierte Skalierung        |
| Backup              | Velero                    | Kubernetes-Backups                 |
| Infrastruktur       | Terraform / OpenTofu      | Infrastruktur deklarativ verwalten |
| Automatisierung     | Ansible                   | Node-Konfiguration                 |

Wir würden außerdem bewusst die Kubernetes-eigenen Ressourcen behandeln: Pods, Deployments, ReplicaSets, DaemonSets, StatefulSets, Jobs, CronJobs, Services, ConfigMaps, Secrets, PVCs, CRDs, ServiceAccounts, Roles, ClusterRoles, NetworkPolicies und viele weitere.

Nicht alle Komponenten müssen dauerhaft gleichzeitig laufen. Insbesondere Longhorn, Monitoring und mehrere Datenbankinstanzen benötigen zusätzliche Ressourcen.

# 2. Lernkonzept der Webseite

Ich würde KubeLab in vier Hauptbereiche unterteilen.

Academy – Theorie verstehen

Strukturierte Lernmodule mit interaktiven Architekturdiagrammen, animierten Kubernetes-Prozessen, Erklärungen und Wissensfragen.

Build Lab – Cluster aufbauen

Schrittweise Installation eines echten Kubernetes-Clusters. Vom Linux-System bis zu HA, Networking, Storage und Operators.

Operations Lab – Cluster verwalten

Vorgefertigte Szenarien mit Aufgaben: Deployments reparieren, Datenbanken konfigurieren, Monitoring einrichten und Fehler analysieren.

Visualizer – Kubernetes beobachten

Interaktive Darstellung von Nodes, Pods, Services, Netzwerken, Controllern und deren Beziehungen. Anfangs mit Beispieldaten, später optional mit echten Clusterinformationen.

## 2.1 Beispiel eines vollständigen Lernmoduls

Nehmen wir das Modul „Kubernetes Scheduler“.

MODUL 03 · CONTROL PLANE

## Wie funktioniert der Scheduler?

Interaktiv

Du erstellst einen Pod. Kubernetes muss entscheiden, auf welchem Node dieser ausgeführt wird. Untersuche, wie Ressourcen und Scheduling Constraints diese Entscheidung beeinflussen.

CPU-Anforderung des Pods

1 vCPU

Node-Auswahl

Automatisch auswählen

worker-01 erzwingen

worker-02 erzwingen

worker-01

2 vCPU verfügbar

Pod platziert

worker-02

4 vCPU verfügbar

Unverändert

Der Pod könnte auf worker-01 eingeplant werden.

Vereinfachte Scheduling-Simulation. Ein echter Scheduler berücksichtigt unter anderem Requests, Affinity, Taints, Topologie und weitere Filter- und Scoring-Regeln.

Solche Übungen würden wir für viele Kubernetes-Konzepte entwickeln.

# 3. Technische Architektur der Webseite

Die Plattform soll ohne zentrale kostenpflichtige Infrastruktur funktionieren.

GitHub Pages

Statisches Hosting der React-Anwendung

Browser des Benutzers

React UI

Monaco Editor

React Flow

xterm.js

Lern-Engine

IndexedDB

Lokaler Rechner / VM / WSL

Optionaler KubeLab Agent

Lokale Autorisierung · API · Lab-Verwaltung

Linux VMs

Kubernetes

## 3.1 Technologie-Stack

| Schicht                   | Technologie               | Begründung                                  |
| ------------------------- | ------------------------- | ------------------------------------------- |
| Frontend                  | React + TypeScript + Vite | Moderne, statisch deploybare SPA            |
| Styling                   | Tailwind CSS + shadcn/ui  | Einheitliche Komponenten                    |
| Routing                   | React Router              | Academy, Labs, Visualizer                   |
| Architekturvisualisierung | React Flow                | Interaktive Graphen                         |
| YAML-Editor               | Monaco Editor             | IDE-ähnliche Bearbeitung                    |
| Terminaloberfläche        | xterm.js                  | Browserterminal                             |
| Lerninhalte               | MDX                       | Markdown mit interaktiven React-Komponenten |
| Zustandsverwaltung        | Zustand                   | UI- und Lab-Zustände                        |
| Fortschritt               | IndexedDB                 | Offline und ohne Benutzerkonto              |
| YAML-Validierung          | YAML Parser + JSON Schema | Sofortige Fehlermeldungen                   |
| Lokaler Agent (später)    | Go                        | Portabel, Kubernetes-Integration            |
| Echte Cluster             | kubeadm, kind, Linux-VMs  | Unterschiedliche Lernniveaus                |
| Tests                     | Vitest, Playwright        | Komponenten- und End-to-End-Tests           |
| CI/CD                     | GitHub Actions            | Automatischer Build und Deployment          |

Ein wichtiger Unterschied: `xterm.js` stellt lediglich die Terminaloberfläche dar. Ohne Agent oder andere Backend-Verbindung kann es keine echten Shell-Befehle ausführen.

## 3.2 Projektstruktur

So würde ich das Repository organisieren:

```
kubelab/
│
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── pages/
│       │   │   ├── Dashboard/
│       │   │   ├── Academy/
│       │   │   ├── BuildLab/
│       │   │   ├── OperationsLab/
│       │   │   └── Visualizer/
│       │   │
│       │   ├── components/
│       │   │   ├── Editor/
│       │   │   ├── Terminal/
│       │   │   ├── ClusterGraph/
│       │   │   ├── LessonViewer/
│       │   │   └── TaskValidator/
│       │   │
│       │   ├── hooks/
│       │   ├── stores/
│       │   └── services/
│       │
│       └── package.json
│
├── packages/
│   ├── lesson-engine/
│   ├── simulation-engine/
│   ├── cluster-model/
│   ├── validation/
│   └── ui/
│
├── content/
│   ├── fundamentals/
│   ├── cluster-bootstrap/
│   ├── networking/
│   ├── storage/
│   ├── operators/
│   ├── observability/
│   ├── gitops/
│   └── security/
│
├── labs/
│   ├── kubeadm/
│   ├── kind/
│   ├── operations/
│   └── troubleshooting/
│
├── agent/
│   └── (spätere Go-Anwendung)
│
├── docs/
│   ├── architecture/
│   └── security/
│
└── .github/workflows/
```

Die Lerninhalte, die Benutzeroberfläche und die eigentliche Lab-Logik bleiben damit voneinander getrennt.

# 4. Roadmap für die Kubernetes-Lerninhalte

Ich würde die Academy in zwölf große Phasen unterteilen.

| Phase                | Inhalte                                              | Praktisches Ergebnis                            |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| 1. Linux & Container | Prozesse, Namespaces, cgroups, containerd, runc, CRI | Container manuell starten                       |
| 2. Control Plane     | API Server, etcd, Scheduler, Controller Manager      | Ersten Control-Plane-Node mit kubeadm erstellen |
| 3. Worker Nodes      | kubelet, Node Registration, Scheduling               | Zwei Worker hinzufügen                          |
| 4. Networking        | CNI, Cilium, CoreDNS, Services, NetworkPolicies      | Funktionierendes Pod-Netzwerk                   |
| 5. External Traffic  | MetalLB, Gateway API, Ingress, TLS                   | Anwendungen extern erreichbar machen            |
| 6. Storage           | PV, PVC, CSI, StorageClasses, Longhorn               | Persistente Anwendungen betreiben               |
| 7. Operators         | CRDs, Reconciliation, Zalando Operator               | PostgreSQL-Cluster aufbauen                     |
| 8. Observability     | Prometheus, Grafana, Loki, Alertmanager              | Cluster überwachen                              |
| 9. GitOps            | Helm, Kustomize, Argo CD                             | Deployments aus Git verwalten                   |
| 10. Security         | RBAC, Secrets, Kyverno, Pod Security                 | Cluster absichern                               |
| 11. Scaling & HA     | HPA, KEDA, etcd Quorum, HA Control Plane             | Ausfallsichere Architektur                      |
| 12. Operations       | Upgrades, Backups, Velero, Troubleshooting           | Fehler beheben und Cluster wiederherstellen     |

Jede Phase soll dieselbe Lernstruktur erhalten: Konzept → Visualisierung → geführtes Lab → eigenständige Aufgabe → Validierung → Troubleshooting.

Einige fortgeschrittene Übungen, insbesondere HA und verteilter Storage, werden ein größeres lokales Ressourcenprofil benötigen. Wir sollten daher verschiedene Lab-Größen anbieten, statt alle Komponenten auf jedem Rechner zu erzwingen.

# 5. Roadmap für die Entwicklung der Webseite

Hier würde ich deutlich kleinere, testbare Meilensteine wählen.

M1 – Grundgerüst und Designsystem

React-Projekt, Navigation, Dashboard, Dark/Light Mode, responsive Layouts, Routing und GitHub-Pages-Deployment.

Ergebnis: Eine öffentlich erreichbare Webseite mit funktionsfähiger Navigation.

M2 – Academy und Content Engine

MDX-Lektionen, Lernpfade, Fortschrittsspeicherung, Quizfragen, Aufgaben und Navigation zwischen Modulen.

Ergebnis: Erste vollständige Lernmodule ohne Backend.

M3 – Interaktiver Visualizer

React-Flow-Diagramme für Control Plane, Nodes, Pods, Services und Networking. Komponenten sind anklickbar und erklären ihre Funktionen.

Ergebnis: Interaktive Clusterarchitektur mit Beispielzuständen.

M4 – Editor und Simulation

Monaco Editor, YAML-Prüfung, simuliertes Terminal und ein begrenztes Kubernetes-Ressourcenmodell.

Ergebnis: Deployments, Pods und Services im Browser erstellen und ihre Auswirkungen sehen.

M5 – Geführte Build Labs

Vollständige kubeadm-Anleitungen, Befehle zum Kopieren, Aufgaben, manuelle Checkpoints und plattformspezifische Hinweise für Linux, WSL und VMs.

Ergebnis: Lernende bauen ihr erstes echtes Cluster auf.

M6 – Optionaler lokaler Agent

Sicherheitskonzept, Pairing, eingeschränkte API, lokale Terminal-Sessions, Dateiverwaltung und Kubernetes-Integration.

Ergebnis: Echte Clusterinformationen in der Webseite und automatische Aufgabenvalidierung.

M7 – Operations und Troubleshooting Labs

Vorbereitete Cluster, reproduzierbare Fehler, automatische Prüfungen, Zurücksetzen von Übungen und erweiterte Szenarien.

Ergebnis: Eine vollständige praktische Kubernetes-Trainingsumgebung.

M8 – Veröffentlichung für Kollegen

Dokumentation, Setup-Assistent, Barrierefreiheit, Browser-Tests, Sicherheitsüberprüfung, Versionierung und Release-Prozess.

Ergebnis: Eine wartbare Open-Source-Plattform für mehrere Lernende.

Die Meilensteine sind bewusst nicht an feste Wochen gebunden. Gerade die Qualität der Lerninhalte und die Sicherheit des Agenten sollten wir nicht unter Zeitdruck entwickeln.

# 6. Wie die Webseite konkret aussehen soll

Ich würde ein modernes Developer-Tool-Design wählen, ähnlich einer Mischung aus VS Code, Kubernetes Dashboard und einer interaktiven Academy.

KubeLab

Academy

Learn

Konzepte, Lernpfade und interaktive Erklärungen

Practice

YAML-Editor, Terminal und Challenges

Explore

Interaktive Cluster- und Netzwerkdiagramme

Troubleshoot

Fehler analysieren und Cluster reparieren

Die wichtigsten Ansichten wären:

- Dashboard: Aktueller Lernfortschritt, zuletzt bearbeitete Module, nächste Aufgaben.
- Academy: Theorie und interaktive Visualisierungen.
- Lab Workspace: Dreigeteilte Oberfläche mit Aufgabenbeschreibung, Editor/Terminal und Clusterdiagramm.
- Cluster Explorer: Nodes, Namespaces, Workloads, Services, Events und Ressourcenbeziehungen.
- Challenge Center: Eigenständige Übungen mit Hinweisen, Prüfungen und Lösungen.
- Settings: Sprache, Theme, lokaler Speicher, Import/Export des Lernstands und Agent-Verbindung.

Für den Lab Workspace würde ich ein frei anpassbares Layout mit verschiebbaren Panels vorsehen, damit auch auf kleineren Laptopbildschirmen sinnvoll gearbeitet werden kann.

# 7. Sicherheits- und Kostenkonzept

Das sind für mich feste Architekturvorgaben.

Kosten: Die öffentliche React-Anwendung wird statisch gehostet. Es gibt keine zentrale Datenbank, keinen kostenpflichtigen Kubernetes-Server und keine Pflicht zur Registrierung. Lernstände werden lokal gespeichert und können exportiert werden. GitHub Pages und GitHub Actions können innerhalb ihrer kostenlosen Nutzungsbedingungen verwendet werden; deren Limits müssen wir berücksichtigen.

Sicherheit: Die öffentliche Webseite erhält keinen direkten administrativen Zugriff auf lokale Rechner. Der spätere Agent wird optional, ausdrücklich autorisiert und auf dedizierte Lab-Umgebungen begrenzt. Privilegierte Aktionen müssen in isolierten VMs erfolgen. Ein vollständig sicherer Betrieb kann erst nach Implementierung und Prüfung bewertet werden.

Reproduzierbarkeit: Jedes Lab bekommt eine definierte Kubernetes-Version, Voraussetzungen, Startzustand, Prüfregeln und eine Reset-Anleitung. So können mehrere Kollegen dieselbe Aufgabe unter vergleichbaren Bedingungen lösen.

Offline-Fähigkeit: Die statische Academy könnte später als PWA verfügbar gemacht werden. Echte Labs benötigen weiterhin ihre lokale Laufzeitumgebung und gegebenenfalls Downloads von Images und Paketen.

# 8. Was ich als erste Version tatsächlich bauen würde

Ich würde bewusst nicht sofort alle zwölf Kubernetes-Phasen implementieren.

Unser erstes vollständiges Produktinkrement wäre:

KubeLab MVP 1.0

Zielumfang

- Funktionierende React-Webseite
- Academy mit Linux-, Container- und Kubernetes-Grundlagen
- Interaktiver Control-Plane-Visualizer
- Monaco YAML-Editor
- Simulierte Kubernetes-Befehle für grundlegende Ressourcen
- Geführtes kubeadm-Lab mit externem Terminal
- Lokale Speicherung des Lernfortschritts
- Deployment auf GitHub Pages

Danach würde ich als erste größere Erweiterung die echten Worker-Nodes und Cilium integrieren. Erst wenn diese Grundlagen stabil sind, würde ich die Enterprise-Komponenten wie Zalando Postgres Operator, Prometheus, Argo CD und Longhorn ergänzen.

Damit hätten wir einen klaren roten Faden: Wir bauen erst Kubernetes, verstehen jede Schicht und erweitern es anschließend Schritt für Schritt zu einer professionellen Plattform.

Und gleichzeitig entsteht eine Webseite, die du schon relativ früh deinen Kollegen zeigen kannst, ohne dass du dafür laufende Infrastrukturkosten übernehmen musst.