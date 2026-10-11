# KubeLab

[Website](https://marlonhie.github.io/KubeLab/) · [Repository](https://github.com/MarlonHie/KubeLab)

Kostenlose, deutschsprachige Kubernetes-Lernplattform mit lokalen Lernständen. Statische React-/TypeScript-Anwendung ohne Konto oder Backend.

## Lokal starten

Voraussetzung: Node.js 22.12+ (auch Node 20.19+ unterstützt) und npm 11.6.2+.

```bash
npm ci
npm run dev
```

Öffne die von Vite angezeigte lokale URL. Produktionsbuild und Prüfungen:

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

## Enthalten

- Dashboard, responsive Navigation, Hell-/Dunkelmodus.
- Einheitliches Content-System: deklarative JSON-Lektionen, schema-geprüfte Text-, Code-, YAML-, Tabellen-, Hinweis-, Experiment-, Aufgaben- und Quizblöcke.
- Referenzmodul **03 Kubernetes Architecture**: neun ausführliche Lektionen, 27 Verständnisfragen, Praxisaufgaben, Fehleranalyse und Expert-Challenges. Einheitlicher Aufbau mit Lernzielen, Deep Dive, Experiment und begründeten Lösungen.
- Academy mit 16 Themenbereichen, Niveau-/Themenfiltern und Suche. Insgesamt 22 verfügbare Lektionen: sechs zu Linux, fünf zu Containern, neun zur Architektur sowie Einführungen in Services und Cilium. Weitere Inhalte sind ausdrücklich geplant.
- Interaktive Modelle für Architektur, API-Prüfung, etcd-Quorum, Reconciliation, Scheduling, Node-Runtime, Request-Ablauf und Komponentenausfälle; jedes nennt seine Vereinfachungen.
- React-Flow-Visualizer mit Komponentenerklärungen und Scheduler-Experiment.
- Lokal gebündelter Monaco-YAML-Editor, AJV-/YAML-Prüfung, xterm.js-Terminal und begrenzte kubectl-Simulation.
- Deployment, Pod und Service, Replikate, Ressourcenansicht und drei Fehlerszenarien (Selektor, Service, Replikate). Editor und Visualizer verwenden denselben gespeicherten Cluster.
- Sieben geführte kubeadm-Schritte mit kopierbaren Befehlen, Voraussetzungen, manuellen Checkpoints, Troubleshooting und Snapshot-Reset.
- Lernfortschritt und Lab in IndexedDB: auch ungültige YAML-Entwürfe bleiben unabhängig vom zuletzt angewendeten Cluster erhalten. Getrennte, geprüfte JSON-Sicherungen und bestätigte Lab-Resets.

Der Browser führt keine echten Shell-Befehle aus. Das Operations Lab prüft nur einen Teil des Kubernetes-Schemas und nimmt erfolgreiche Containerstarts an. Die separaten Architekturmodelle veranschaulichen ausgewählte Fehlerbedingungen. Simulation und externe echte Ausführung sind in der Oberfläche gekennzeichnet. Der kubeadm-Leitfaden ist weiterhin **nicht vollständig auf echten VMs verifiziert**; dieser Arbeitsschritt ist zugunsten von Content First zurückgestellt. Es gibt keinen lokalen Agenten, keine Benutzerverwaltung und keine kostenpflichtige Infrastruktur.

Browserdaten können gelöscht werden; JSON-Exporte dienen als Sicherung. Fortschrittsformat 4 trennt **Grundlagen abgeschlossen**, **Praxis abgeschlossen** und **Deep Dive gemeistert**. Versionen 1–3 bleiben importierbar; vorhandene Abschlüsse bleiben erhalten, unabhängige Nachweise werden nicht rückwirkend vergeben. Optionale Internals blockieren den grundlegenden Praxisabschluss nicht. Die bisherige Ausnahme für den alten Version-1-Control-Plane-Wissenscheck bleibt erhalten. Reflexionsfragen und externe Übungen werden nicht automatisch als Praxis abgeschlossen.

Siehe [aktuellen Content-Plan](docs/architecture/content-first.md), [Implementierung](docs/architecture/implementation.md), [Sicherheitsgrenzen](docs/security/README.md) und [ursprünglichen Gesamtentwurf](docs/architecture/roadmap.md).

## GitHub Pages

1. Dieses Projekt in ein eigenes GitHub-Repository mit Hauptbranch `main` übertragen.
2. Unter **Settings → Pages → Build and deployment** die Quelle **GitHub Actions** wählen.
3. Push auf `main` oder den Workflow **Validate and deploy KubeLab** manuell starten.

Der Workflow installiert Abhängigkeiten, führt Unit- und Browsertests aus und veröffentlicht `apps/web/dist`. Pull Requests werden geprüft, aber nicht veröffentlicht. Hash-Routing und relative Assets unterstützen `https://NAME.github.io/REPO/` ohne serverseitige Rewrite-Regeln. Es werden keine Secrets benötigt.

Zielrepository: https://github.com/MarlonHie/KubeLab. Die Veröffentlichung benötigt GitHub-Schreibzugriff und aktivierte GitHub Pages.

## Beiträge und Lizenz

Alle 22 Lektionen liegen einzeln in `content/lessons/` und werden über `catalog.ts` registriert. Die gemeinsame Ansicht heißt `LessonPage.tsx`; neue Lektionen benötigen keine eigene React-Seite. Das [Autorenhandbuch](docs/architecture/lesson-authoring.md) beschreibt Blöcke, Prüfungen, IDs und Datenmigration. Neue Inhalte müssen technische Erklärung, Modellgrenzen, Praxis, Lösungen und Primärquellen enthalten. Fachreview und Kollegen-Beta bleiben eigene Qualitätsschritte; automatisierte Tests ersetzen sie nicht.

MIT-Lizenz, siehe [LICENSE](LICENSE).

### Lernpfad und Abschlüsse (0.3.0)

Linux: Prozesse/Signale/PID 1, Namespaces, cgroups v2, systemd und Netzwerk. Container: OCI-Images, containerd/Shims/runc, CRI/Sandbox und Lifecycle. Jede neue Fachlektion enthält Lernziele, technische Erklärungen, Tabellen, externe Diagnosebefehle, geführte Praxis, einen Wissenscheck und einen optionalen Diagnosefall. Modul 03 bleibt fachliche Referenz.

Im geführten Modus bleiben die Raft-/Scheduler-Prüfpfade sichtbar. Im Challenge-Modus werden diese durch eigenständige Transfer- und Diagnoseaufgaben ersetzt. Alle 18 Diagnosefälle erlauben selbst gewählte Untersuchungsreihenfolgen und prüfen Belege, Ursache und Korrektur. Hinweise und Lösungen sind bewusst aufdeckbar; danach zählt der Versuch nur als Übung. Ein neuer Versuch setzt Antworten und Hilfe zurück, erhält aber gespeicherte Abschlüsse. Diese lokale Lernprüfung ist keine beaufsichtigte Zertifizierung.

[Inhaltsreview 01/02 und Lernlogik](docs/content/foundations-and-learning-review.md) · [Historische Gap-Analyse Modul 03](docs/content/module-03-gap-analysis.md).

Validierung von 0.3.0: 138 Unit-Tests, 30 Chromium-E2E-Tests und Produktionsbuild erfolgreich. Der separate kubeadm-VM-Test bleibt ausstehend; Browsernachweise bestätigen ausschließlich die gekennzeichneten Modellaufgaben.
