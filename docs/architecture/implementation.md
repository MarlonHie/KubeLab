# KubeLab 0.3.0 · Lernstufen und Fundamentals

Die React-/TypeScript-SPA wird mit Vite ausschließlich statisch gebaut. HashRouter und relative Assets unterstützen GitHub Pages unter einer Repository-Unterseite. Kein Server, Tracking, Konto oder Clusterzugriff.

## Aufbau

- `content/lessons/*.json`: 22 deklarative Lektionen: 6 Linux, 5 Container, 9 Architektur, 2 Networking-Einführungen.
- `packages/lesson-engine`: JSON Schema, Blocktypen, semantische Inhaltsprüfung, Aufgaben-/Quizprüfung, Katalog und Lehrplan mit 16 Themenbereichen. Geplante Module gelten nicht als fertig.
- `apps/web/src/pages/LessonPage.tsx`: eine gemeinsame Lernansicht für alle Module. Eine nach Lektions-ID erneuerte Sitzung setzt Antworten, Feedback, Zuordnungen und Modelle zurück. `LessonBlocks.tsx` stellt die geprüften Inhalte dar.
- `apps/web/src/components/ArchitectureExperiments.tsx`: Architektur, API, Quorum, Scheduling, Runtime, Request-Ablauf und Fehleranalyse. `Reconciliation.tsx` zeigt einen einfachen Regelkreis. Jedes Modell beschreibt seine Grenzen.
- `packages/simulation-engine`: reine Architekturmodelle, atomare Apply-Operationen, begrenzte kubectl-Simulation und drei Operations-Szenarien. Kein eval, keine Shell, keine Verbindung zu Clustern.
- `packages/cluster-model`: begrenztes Ressourcenmodell. `packages/validation`: YAML-Parsing, AJV-Basisschema und semantische Prüfung, keine vollständige Kubernetes-OpenAPI-Validierung.
- `packages/lab-state`: versioniertes Lab-Format mit Größen-, Ressourcen- und Identitätsprüfung. Ungültiges Entwurfs-YAML ist erlaubt; angewendete Clusterressourcen müssen gültig sein.
- `apps/web/src/stores`: Zustand/IndexedDB mit serialisierten Schreibvorgängen und sichtbaren Speicherfehlern. Lab-Änderungen werden um 200 ms verzögert gespeichert; beim Verbergen der Seite wird ausstehendes Schreiben angestoßen. Die UI zeigt ausstehende Speicherung an. Browser-Schließen und Speicherlöschung sind keine garantierte Sicherung; JSON-Export bleibt erforderlich.
- `apps/web/src/pages/Operations.tsx`: persistenter Editor, Simulation, Szenarien und gemeinsamer Cluster für den Visualizer. Lab-Import und Zurücksetzen erfordern ausdrückliche Bestätigung.
- `apps/web/src/pages/buildSteps.ts`: sieben Schritte für frische Ubuntu-VMs. Manuelle Checkpoints sind keine automatischen Clusterprüfungen. Vollständige VM-Verifikation bleibt ausstehend.

## Datenmigration

Der bestehende IndexedDB-Schlüssel `kubelab-progress` verwendet Schema-Version 4. Version-1-, Version-2- und Version-3-Stände bleiben importierbar. Alte `completed`-Einträge werden zu `theoryCompleted`; Praxis beginnt ohne unbelegte Erfolge. Die frühere Version-1-Ausnahme für den neu erarbeiteten Control-Plane-Wissenscheck bleibt bestehen. Andere Lektionen, Theme, Checkpoints und Challenge-Erfolge bleiben erhalten. `practiceCompleted` speichert geprüfte Aufgaben als `Lektions-ID/Aufgaben-ID`. Reflexionsfragen erhalten keinen automatischen Abschluss. `independentCompleted` enthält nur ungestützte Deep-Dive-Nachweise aus dem Challenge-Modus. Alte Nachweise werden nicht zu unabhängigen Prüfungen aufgewertet. Die Oberfläche zeigt Grundlagen, grundlegende Praxis und optionalen Deep Dive.

Das Lab verwendet weiterhin separat `kubelab-lab-v1` mit YAML-Entwurf, angewendetem Cluster, letztem angewendetem YAML, Szenario und letzter Ausgabe. Ein Fortschrittsreset löscht kein Lab. Beide Formate haben getrennte Sicherungen. Details und Autorenregeln stehen in [lesson-authoring.md](lesson-authoring.md).

## Modellgrenzen

Das Operations Lab akzeptiert Deployments, Pods und Services und nimmt erfolgreiche Containerstarts an. Es führt kein echtes Scheduling, Netzwerk, Image-Pull, Storage, Admission oder RBAC aus. Terminalabfragen gelten für Namespace default; Manifeste können andere Namespaces modellieren. Generierte Pods werden über ihr Deployment verwaltet. Der Graph zeigt höchstens sechs Pods und zwei Services; die Ressourcenansicht zeigt alle angewendeten Ressourcen. Höchstens 20 Replikate pro Deployment und 100 KB Manifesttext.

Die Architekturmodelle sind eigenständige didaktische Experimente. Der etcd-Simulator behält eine feste Mehrheit von zwei der drei Mitglieder, benötigt nach Leader-Ausfall eine explizite Wahl und bestätigt ohne Quorum keine Änderung. Er implementiert kein Raft. Der Scheduler filtert nur CPU-Requests, einen harten Node-Wunsch und einen NoSchedule-Taint. Der Request-Ablauf ist eine logische Lernfolge nebenläufiger Komponenten. Failure- und Runtime-Modelle geben keine Failover-Zeitgarantie. Sie simulieren keine produktionsfähige Kubernetes-Plattform.

## Qualität

Unit-Tests prüfen Zustandsübergänge, Importgrenzen, Migration, Szenariolösungen und Inhaltsstruktur. Playwright prüft die neun Lektionen, Quorum-Verhalten, Quizabschluss, Persistenz, Import/Export, Szenarioreparatur, responsive Darstellung und bestehende Kernabläufe. Fachreview und Beta-Tests mit Kollegen stehen als weitere Qualitätsschritte aus.

Der aktuelle Ausbauplan steht in [content-first.md](content-first.md). Der ursprüngliche Gesamtentwurf bleibt in [roadmap.md](roadmap.md) erhalten.

## Zustandsbasierte Vertiefung

`deep-labs.ts` enthält reine Raft- und Scheduler-Lehrmodelle. `challenges.ts` rekonstruiert Zustände aus einer vollständigen Aktionshistorie und prüft geordnete Vor-/Nachbedingungen. Die UI benutzt dasselbe Replay; beliebige Ereignismengen reichen für die neuen Challenges nicht aus. Native Details-Abschnitte behalten beim Einklappen ihre Antworten und Modellhistorie. Neue Nachweise verwenden eigene Aufgaben-IDs; Fortschrittsformat 3 wird verlustfrei auf Format 4 migriert. Ein Rücksprung auf alte App-Versionen kann deren Validator an unbekannten neuen Aufgaben-IDs scheitern lassen; Exporte daher mit der aktuellen Version importieren.

Die Tests sichern alle Abschnitte aus 0.2.1 unverändert, prüfen Log-/Commit-Invarianten und Fehlerpfade sowie alte und neue Fortschrittsnachweise. Fachumfang und Quellenprüfung: [Modul-03-Gap-Analyse](../content/module-03-gap-analysis.md).

## Eigenständige Diagnose

`diagnosis.ts` enthält 18 fest verfasste Fälle und einen reinen Prüfer für Belege, Ursache und Korrektur. Es gibt keine vorgeschriebene Untersuchungsreihenfolge. Die geführten Raft-/Scheduler-Übungen zählen als optionale Exploration; der Challenge-Modus verwendet eigenständige Diagnosen statt einer versteckten festen Aktionsfolge. Hinweise oder Lösungen markieren den laufenden Versuch als unterstützt. Neue Stufen werden überall aus den gleichen Funktionen `basicPracticeTasks`, `practiceMastered`, `deepDiveTasks` und `deepDiveMastered` abgeleitet.
