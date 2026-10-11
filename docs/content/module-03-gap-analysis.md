# Modul 03: Gap-Analyse und fachliche Erweiterung

Historischer Review für 0.2.2. Seit 0.3.0 zählen Internals separat zum optionalen Deep Dive; aktuelle Regeln stehen in `foundations-and-learning-review.md`.

Stand: 2026-10-11. Ausgangspunkt: 0.2.1 (4c36dc6). Umfang: neun vorhandene Architekturlektionen und ihre acht Modellarten. Keine neuen Hauptmodule, kein lokaler Agent. Die Grundlage wird als Daten-Snapshot in `tests/fixtures/architecture-v021.json` gesichert.

| Lektion            | Vorhanden / Concept Simulator                                        | Lücke bzw. zu präzisierende Modellgrenze                                 | Ergänzte Interna und Beispiele                                                                                                     | Nachweis                                                                                  |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Cluster Basics     | Deklaration, Rollen, Objektfelder; Architekturgraph                  | API-Identität nicht allein Name; Scope nicht Isolation; Discovery fehlte | UID und OwnerReference, REST-Scope, Discovery/explain, Namespace/ConfigMap-YAML                                                    | Zwei kausale Zuordnungen                                                                  |
| Control Plane      | Zuständigkeiten und API-Kommunikation; Architekturmodell             | Control Plane ist nicht ein einzelner HA-Mechanismus                     | Static-/Mirror-Pods, kubeadm-Manifestpfad, Leases, stacked/externes etcd, Fehlerdomänen                                            | Drei Ausfallvorhersagen                                                                   |
| API Lifecycle      | Identität, RBAC, Admission; vier grobe Request-Zustände              | Kein vollständiger interner Call-Stack; 409 nicht immer SSA-Konflikt     | Admission-Verantwortungsfolge, Reinvocation, failurePolicy, SSA-Feldmanager, Version/Storage-Conversion, Server-Dry-Run            | Drei Konflikt-/Fehlerdiagnosen                                                            |
| etcd               | Mehrheit, Wahl, Zählrevision; drei an/aus schaltbare Mitglieder      | Kein getrenntes Log/Commit/Apply; keine zwei Netzgruppen                 | Terms, aktueller Term beim Commit, No-op, MVCC, Compaction/Defrag, Watch-Recovery; offizieller etcdctl-Kopfausschnitt              | Dreifach-Partition und Log-Abgleich als geordnete Zustands-Challenge; drei Transferfälle  |
| Controllers        | Reconcile, ReplicaSet-Zuständigkeit; schrittweiser Soll/Ist-Abgleich | Events nicht genau-einmal-Befehle; kein Cache-/Queue-Modell              | List/Watch, Cache-Sync, Resync, Immutable Cache, Done/Forget/Retry, Idempotenz und Konflikte; originale Controller-Logtexte        | Drei Cache-/Retry-Szenarien                                                               |
| Scheduling         | CPU, Node-Wunsch, Taint; Kandidatenliste                             | Konzeptmodell ist kein Scheduling Framework; Toleration nicht Kapazität  | Filter/Score/Reserve/Permit/PreBind/Bind, Unreserve, Preemption-Grenzen, Topology Spread/PV; belegter Event-Ausschnitt             | Zweiter Simulator mit gescheitertem und erfolgreichem Binding-Versuch; drei Transferfälle |
| kubelet & Runtime  | Netzwerk, Volume, Image, Readiness; vier Schalter                    | Kein tatsächlicher CRI-Trace; Laufend nicht bereit                       | Sandbox und CRI-Dienste, containerd/OCI, Generic/Evented PLEG, Startup-Gating, Lifecycle/Termination; Probe-YAML, crictl-Diagnose  | Drei lokale Fehleranalysen                                                                |
| Apply to Pod       | Logischer asynchroner Ressourcenfluss                                | Apply-Erfolg nicht Verfügbarkeit; Events keine vollständige Zeitleiste   | generation/observedGeneration, Replica-Zähler/Conditions, Eigentümer, Events, ProgressDeadlineExceeded ohne automatisches Rollback | Drei Rollout-Vorhersagen                                                                  |
| Component Failures | Fähigkeiten bei Komponentenausfall; Fallauswahl                      | Kein garantierter Zeitpunkt; Partition nicht Stromausfall                | Node-Lease/Erkennung/Taints/Toleration/Ersatz, API-HA, Quorum-Rückkehr vs Restore, Revision Bump, Fencing                          | Drei zeit-/datenbezogene Recovery-Szenarien                                               |

## Redaktionelle Prüfliste pro Lektion

Für jede Zeile gilt (redaktioneller Abgleich, keine Behauptung einer automatischen fachlichen Prüfung):

- [x] Vorhandene Lernziele bleiben den unveränderten Grundlagenaufgaben und Fragen q1–q3 zugeordnet.
- [x] Das jeweils neu angehängte Lernziel wird im Abschnitt `internals` erklärt.
- [x] `internals-transfer` prüft Vorhersage **mit Ursache**; die Lösung begründet die Zuordnung. Freie Begründungen werden nicht automatisch bewertet.
- [x] Für etcd und Scheduling prüft zusätzlich `internals-practice` Reihenfolge und abgeleitete Modellzustände.
- [x] Grundlagentext und ursprünglicher Wissenscheck bleiben vollständig erhalten. Der Quiz-Nachweis wird nicht stillschweigend zu einem Internals-Nachweis aufgewertet.
- [x] Fachquellen sind inline zugeordnet und im Quellenverzeichnis verlinkt; Modellgrenzen stehen direkt am Experiment.
- [x] YAML/Pseudocode sind Eingaben bzw. Lehrbeispiele, keine behaupteten Clusteroutputs.
- [x] Neue Ausgaben sind kurze belegte Auszüge, keine erfundenen Zeitstempel, IDs oder Messwerte.

Die automatische Prüfung schützt IDs, Schema, Querverweise, Originalinhalt und Modellinvarianten. Sie kann nicht beweisen, dass eine Lektion fachlich vollständig ist. Eine unabhängige redaktionelle Zweitprüfung ist damit nicht behauptet.

## Quellen und Versionsgrenzen

Verwendet werden offizielle Kubernetes-Konzept-/API-Dokumentation, etcd 3.6 und offizielle Implementierungen. Kubernetes-Online-Dokumentation kann sich ändern; Implementierungsbeispiele sind soweit nötig auf CRI v0.35.0, kubelet v1.35.0 und etcdctl v3.6.0 festgelegt. Das ist **keine** Änderung der Versionen des separaten kubeadm-VM-Labs. Die containerd-Architektur wird anhand der Dokumentation 2.4 erläutert. Sample Controller und Raft dienen als referenzierte Implementierungsbeispiele; deren verlinkte Hauptzweige sind beweglich und werden nicht als versionsfester API-Vertrag behandelt.

Belegstellen für neue Ausgabeausschnitte:

- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/): historisches `kubectl describe`-Beispiel, ausgewählte Reason-/CPU-Fehlerfelder. Keine aktuelle Live-Ausgabe behauptet.
- [sample-controller/controller.go](https://github.com/kubernetes/sample-controller/blob/master/controller.go): originale Nachrichtentexte der Cache-Synchronisierung und Worker-Logs; ausdrücklich Quelltext-Auszüge, kein aufgezeichneter Clusterlauf.
- [etcdctl v3.6.0 README](https://github.com/etcd-io/etcd/blob/v3.6.0/etcdctl/README.md#endpoint-status): ausgewählte Original-Spaltennamen, ohne erfundene Zahlen.

Besonders geprüft: Admission nach Autorisierung und Mutation vor Validierung; fehlende Garantie mutierender Webhook-Reihenfolge; Feldbesitz vs resourceVersion-Konflikt; Revision vs Raft-Index; Cache-Sync vs Aktualität; harte Filter vor Score; Preemption kann falsche PV-Zonen nicht reparieren; Startup-Gating; Readiness ohne automatischen Neustart; generation ohne Readiness-Garantie; 300-s-Toleration ohne feste RTO; Restore als neuer logischer Cluster mit Cache-Recovery.

## Änderungen in getrennten Schritten

1. Analyse und additive Content-/Renderer-Erweiterung: optionaler Abschnitt, Erhalt der Grundlagen und bestehender Nachweis-IDs.
2. Reine Modellfunktionen und zustandsbasierte Prüfung: nachvollziehbare Action-Replays, zwei geführte Fehlerpfade, eigene Nachweise.
3. Inhaltserhalt, Modellinvarianten, Negativfälle, Browser-Interaktionen und mobile Darstellung prüfen; Version und Veröffentlichungsnachweis aktualisieren.

Bestehende einfache Experimente behalten ihre Ereignisprüfungen für den ursprünglichen Lernumfang. Für die komplexen neuen Prüfpfade werden diese nicht verwendet. Bereits erfasste Grundlagen-Praxis bleibt gültig; die Gesamtanzeige „Praxis gemeistert“ verlangt nun auch die neu hinzugefügten Aufgaben. Nicht abgeschlossene Modell-Zwischenstände sind weiterhin besuchsbezogen. Abgeschlossene Aufgaben werden wie bisher lokal gespeichert und exportiert.

## Validierung dieser Überarbeitung

- Alle 40 inline verlinkten Quellen der neuen Internals-Abschnitte waren am 2026-10-11 per HTTP erreichbar (einschließlich offizieller Weiterleitungen). Erreichbarkeit ersetzt keine Inhaltsprüfung.
- 107 Unit-Tests: ursprüngliche Abschnitte unverändert, kompatible Nachweise, strenge Reihenfolge und Reset, Raft-Commit-Präfix, getrennte Revisionen, Filter-/Binding-Voraussetzungen und Unreserve.
- 26 Chromium-E2E-Tests: bestehende Abläufe, beide kompletten neuen Challenges einschließlich falscher Reihenfolge, Persistenz, Transfer-Mastery, Einklappen und neun mobile Internals-Ansichten.
- Produktionsbuild und TypeScript-Prüfung erfolgreich. Desktop-/Mobilansicht visuell geprüft. Die bestehende Warnung zur Größe des Monaco-Editor-Bundles bleibt bestehen.
- Keine echten VMs, kubeadm-, etcd- oder Runtime-Prozesse wurden durch diese Prüfung gestartet. Die hier gezeigten Modellzustände sind keine Cluster-Testprotokolle.
