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
- Referenzmodul **03 Kubernetes Architecture**: neun ausführliche Lektionen, 27 Verständnisfragen, Praxisaufgaben, Fehleranalyse und Expert-Challenges. Einheitlicher Aufbau mit Lernzielen, Deep Dive, Experiment und begründeten Lösungen.
- Academy mit 16 Themenbereichen, Niveau-/Themenfiltern und Suche. Insgesamt 13 verfügbare Lektionen: das Referenzmodul sowie Einführungen in Linux, Container, Services und Cilium. Weitere Inhalte sind ausdrücklich geplant.
- Interaktive Modelle für Architektur, API-Prüfung, etcd-Quorum, Reconciliation, Scheduling, Node-Runtime, Request-Ablauf und Komponentenausfälle; jedes nennt seine Vereinfachungen.
- React-Flow-Visualizer mit Komponentenerklärungen und Scheduler-Experiment.
- Lokal gebündelter Monaco-YAML-Editor, AJV-/YAML-Prüfung, xterm.js-Terminal und begrenzte kubectl-Simulation.
- Deployment, Pod und Service, Replikate, Ressourcenansicht und drei Fehlerszenarien (Selektor, Service, Replikate). Editor und Visualizer verwenden denselben gespeicherten Cluster.
- Sieben geführte kubeadm-Schritte mit kopierbaren Befehlen, Voraussetzungen, manuellen Checkpoints, Troubleshooting und Snapshot-Reset.
- Lernfortschritt und Lab in IndexedDB: auch ungültige YAML-Entwürfe bleiben unabhängig vom zuletzt angewendeten Cluster erhalten. Getrennte, geprüfte JSON-Sicherungen und bestätigte Lab-Resets.

Der Browser führt keine echten Shell-Befehle aus. Das Operations Lab prüft nur einen Teil des Kubernetes-Schemas und nimmt erfolgreiche Containerstarts an. Die separaten Architekturmodelle veranschaulichen ausgewählte Fehlerbedingungen. Simulation und externe echte Ausführung sind in der Oberfläche gekennzeichnet. Der kubeadm-Leitfaden ist weiterhin **nicht vollständig auf echten VMs verifiziert**; dieser Arbeitsschritt ist zugunsten von Content First zurückgestellt. Es gibt keinen lokalen Agenten, keine Benutzerverwaltung und keine kostenpflichtige Infrastruktur.

Browserdaten können gelöscht werden; JSON-Exporte dienen als Sicherung. Version-1-Fortschritt wird migriert: Die alte einzelne Control-Plane-Frage zählt nicht als Abschluss der neuen dreiteiligen Wissensprüfung. Andere Abschlüsse bleiben erhalten.

Siehe [aktuellen Content-Plan](docs/architecture/content-first.md), [Implementierung](docs/architecture/implementation.md), [Sicherheitsgrenzen](docs/security/README.md) und [ursprünglichen Gesamtentwurf](docs/architecture/roadmap.md).

## GitHub Pages

1. Dieses Projekt in ein eigenes GitHub-Repository mit Hauptbranch `main` übertragen.
2. Unter **Settings → Pages → Build and deployment** die Quelle **GitHub Actions** wählen.
3. Push auf `main` oder den Workflow **Validate and deploy KubeLab** manuell starten.

Der Workflow installiert Abhängigkeiten, führt Unit- und Browsertests aus und veröffentlicht `apps/web/dist`. Pull Requests werden geprüft, aber nicht veröffentlicht. Hash-Routing und relative Assets unterstützen `https://NAME.github.io/REPO/` ohne serverseitige Rewrite-Regeln. Es werden keine Secrets benötigt.

Zielrepository: https://github.com/MarlonHie/KubeLab. Die Veröffentlichung benötigt GitHub-Schreibzugriff und aktivierte GitHub Pages.

## Beiträge und Lizenz

Das Referenzformat liegt typisiert in `content/architecture/lessons.ts`; Ansicht und wiederverwendbare Experimente liegen unter `apps/web/src/pages/ArchitectureLesson.tsx` und `apps/web/src/components/ArchitectureExperiments.tsx`. Bestehende Einführungen verwenden MDX. Neue Inhalte müssen Lernziele, technische Erklärung, Modellgrenzen, Praxis, Lösungen und Primärquellen enthalten. Simulationsänderungen mit den Tests in `tests/` prüfen. Fachreview und Kollegen-Beta bleiben eigene Qualitätsschritte; automatisierte Tests ersetzen sie nicht.

MIT-Lizenz, siehe [LICENSE](LICENSE).
