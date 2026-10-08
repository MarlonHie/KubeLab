# KubeLab MVP

Die Vite-SPA wird ausschließlich statisch gebaut. HashRouter und relative Asset-Pfade ermöglichen GitHub Pages sowohl unter einer Repository-Unterseite als auch auf einer eigenen Domain. Die Webseite verfügt über keinen Server, kein Tracking und keine Anmeldung.

- `apps/web`: React-Oberfläche, Layout, Seiten, Monaco, xterm.js und React Flow.
- `content/fundamentals`: drei MDX-Lektionen mit Konzept, Aufgabe und Troubleshooting. Quiz-Metadaten in `packages/lesson-engine`.
- `packages/cluster-model`: begrenztes Ressourcenmodell und Scheduler-Experiment.
- `packages/validation`: YAML-Parsing, AJV-Basisschema und semantische Prüfungen. Keine vollständige Kubernetes-OpenAPI-Validierung.
- `packages/simulation-engine`: atomare Apply-Operationen sowie streng begrenzte kubectl-Simulation. Kein eval, keine Shell, keine Netzwerkverbindung zu Clustern.
- `apps/web/src/stores`: Zustand und versionierter IndexedDB-Fortschritt. Fehler werden sichtbar angezeigt. Import validiert die Daten vor dem Ersetzen; Schreiboperationen werden serialisiert.
- `apps/web/src/pages/buildSteps.ts`: sieben Schritte für frische Ubuntu-24.04-VMs, Kubernetes 1.35.0 und Cilium 1.19.0. Manuelle Bestätigungen sind keine automatischen Clusterprüfungen.

## Bewusste Grenzen

Die Simulation akzeptiert Deployments, Pods und Services. Sie nimmt erfolgreiche Containerstarts an und bildet weder echte Scheduling-Regeln noch Netzwerk, Image-Pulls, Storage, Secrets, Admission oder Berechtigungen nach. Terminalabfragen sind auf Namespace default beschränkt. Andere Namespaces können in Manifesten modelliert werden. Generierte Pods lassen sich nur über ihr Deployment verwalten. Der Graph zeigt höchstens sechs Pods und zwei Services; die Ressourcenansicht zeigt sämtliche angewendeten Ressourcen.

Die Live-Validierung prüft einen Teil des Kubernetes-Schemas. Sie ersetzt weder serverseitigen Dry-Run noch die Validierung eines echten API Servers. Maximal 20 Replikate pro Deployment; Manifestgröße maximal 100 KB.

Diese Version verwendet ein projektspezifisches CSS-Designsystem; Tailwind/shadcn sind noch nicht eingebunden. Das MVP hat drei fertige Module; die übrigen Phasen sind als geplant gekennzeichnet. Der Agent, fortgeschrittene Operator-Labs, Mehrsprachigkeit, PWA-Caching und automatische Clusterprüfungen bleiben spätere Meilensteine. YAML und Simulationszustand sind sitzungsbezogen; nur Lernfortschritt und Theme werden gespeichert.

Der vollständige ursprüngliche Entwurf steht in `roadmap.md`.
