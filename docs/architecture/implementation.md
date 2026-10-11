# KubeLab 0.2 · Content First

Die React-/TypeScript-SPA wird mit Vite ausschließlich statisch gebaut. HashRouter und relative Assets unterstützen GitHub Pages unter einer Repository-Unterseite. Kein Server, Tracking, Konto oder Clusterzugriff.

## Aufbau

- `content/architecture/lessons.ts`: neun typisierte Referenzlektionen mit 27 Fragen, Lernzielen, Deep Dives, Experimentzuordnung, Praxis, Fehleranalyse, Herausforderungen, Lösungen und Primärquellen. Linux, Container und Networking bleiben MDX-Einführungen.
- `packages/lesson-engine`: verfügbare Lektionen und separater Lehrplan mit 16 Themenbereichen. Geplante Module gelten nicht als fertig.
- `apps/web/src/pages/ArchitectureLesson.tsx`: einheitliche Lernansicht, freie Navigation, Lösungen und Wissensprüfung. Erst drei richtige Antworten schließen eine Referenzlektion ab.
- `apps/web/src/components/ArchitectureExperiments.tsx`: Architektur, API, Quorum, Scheduling, Runtime, Request-Ablauf und Fehleranalyse. `Reconciliation.tsx` zeigt einen einfachen Regelkreis. Jedes Modell beschreibt seine Grenzen.
- `packages/simulation-engine`: reine Architekturmodelle, atomare Apply-Operationen, begrenzte kubectl-Simulation und drei Operations-Szenarien. Kein eval, keine Shell, keine Verbindung zu Clustern.
- `packages/cluster-model`: begrenztes Ressourcenmodell. `packages/validation`: YAML-Parsing, AJV-Basisschema und semantische Prüfung, keine vollständige Kubernetes-OpenAPI-Validierung.
- `packages/lab-state`: versioniertes Lab-Format mit Größen-, Ressourcen- und Identitätsprüfung. Ungültiges Entwurfs-YAML ist erlaubt; angewendete Clusterressourcen müssen gültig sein.
- `apps/web/src/stores`: Zustand/IndexedDB mit serialisierten Schreibvorgängen und sichtbaren Speicherfehlern. Lab-Änderungen werden um 200 ms verzögert gespeichert; beim Verbergen der Seite wird ausstehendes Schreiben angestoßen. Die UI zeigt ausstehende Speicherung an. Browser-Schließen und Speicherlöschung sind keine garantierte Sicherung; JSON-Export bleibt erforderlich.
- `apps/web/src/pages/Operations.tsx`: persistenter Editor, Simulation, Szenarien und gemeinsamer Cluster für den Visualizer. Lab-Import und Zurücksetzen erfordern ausdrückliche Bestätigung.
- `apps/web/src/pages/buildSteps.ts`: sieben Schritte für frische Ubuntu-VMs. Manuelle Checkpoints sind keine automatischen Clusterprüfungen. Vollständige VM-Verifikation bleibt ausstehend.

## Datenmigration

Der bestehende IndexedDB-Schlüssel `kubelab-progress` erhält Schema-Version 2. Version-1-Stände bleiben importierbar; die alte einzelne Control-Plane-Prüfung wird nicht als Abschluss der neu erarbeiteten Lektion übernommen. Andere Lektionen, Theme, Checkpoints und der alte Challenge-Erfolg bleiben erhalten. Das Lab verwendet separat `kubelab-lab-v1` mit YAML-Entwurf, angewendetem Cluster, letztem angewendetem YAML, Szenario und letzter Ausgabe. Ein Fortschrittsreset löscht kein Lab. Beide Formate haben getrennte Sicherungen.

## Modellgrenzen

Das Operations Lab akzeptiert Deployments, Pods und Services und nimmt erfolgreiche Containerstarts an. Es führt kein echtes Scheduling, Netzwerk, Image-Pull, Storage, Admission oder RBAC aus. Terminalabfragen gelten für Namespace default; Manifeste können andere Namespaces modellieren. Generierte Pods werden über ihr Deployment verwaltet. Der Graph zeigt höchstens sechs Pods und zwei Services; die Ressourcenansicht zeigt alle angewendeten Ressourcen. Höchstens 20 Replikate pro Deployment und 100 KB Manifesttext.

Die Architekturmodelle sind eigenständige didaktische Experimente. Der etcd-Simulator behält eine feste Mehrheit von zwei der drei Mitglieder, benötigt nach Leader-Ausfall eine explizite Wahl und bestätigt ohne Quorum keine Änderung. Er implementiert kein Raft. Der Scheduler filtert nur CPU-Requests, einen harten Node-Wunsch und einen NoSchedule-Taint. Der Request-Ablauf ist eine logische Lernfolge nebenläufiger Komponenten. Failure- und Runtime-Modelle geben keine Failover-Zeitgarantie. Sie simulieren keine produktionsfähige Kubernetes-Plattform.

## Qualität

Unit-Tests prüfen Zustandsübergänge, Importgrenzen, Migration, Szenariolösungen und Inhaltsstruktur. Playwright prüft die neun Lektionen, Quorum-Verhalten, Quizabschluss, Persistenz, Import/Export, Szenarioreparatur, responsive Darstellung und bestehende Kernabläufe. Fachreview und Beta-Tests mit Kollegen stehen als weitere Qualitätsschritte aus.

Der aktuelle Ausbauplan steht in [content-first.md](content-first.md). Der ursprüngliche Gesamtentwurf bleibt in [roadmap.md](roadmap.md) erhalten.
