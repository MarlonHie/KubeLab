# Content-Audit · KubeLab

Stand: 28. Oktober 2026. Untersucht wird der vorhandene Repository-Stand 0.3.0, nicht ausschließlich die im Gespräch besprochene ZIP-Version 0.2.2. Die Bestandsabschnitte dokumentieren den Ausgangspunkt; der folgende Änderungsstand beschreibt die implementierte Lernplattform 2.0. Die detaillierten Inventare bleiben als überprüfbare Herkunftsnachweise erhalten.

## Methode und Prüfumfang

Inventar aller 22 JSON-Lektionen einschließlich Blöcken, Quellen, Aufgaben und Fragen; statische Prüfung von Content-Engine, Modellen, Prüfregeln, React-Seiten, Speicherung, Lab-Anleitungen, Tests und Architekturplanung. Ausgangspunkte: [Katalog](../../content/lessons/catalog.ts), [bisheriger Lehrplan](../../packages/lesson-engine/src/curriculum.ts), [ursprüngliche Gesamtroadmap](../architecture/roadmap.md), [Content-First-Stand](../architecture/content-first.md), [Review 0.3.0](foundations-and-learning-review.md). Historische Fixtures unter `tests/fixtures` sind Erhaltungsnachweise, keine zusätzlichen ausgelieferten Lektionen. Assets, Build-Konfiguration und CI enthalten keine weiteren Kursinhalte.

Für die ursprüngliche Bestandsaufnahme erfolgte keine neue Ausführung von Browser-, Unit- oder VM-Tests; kein vollständiges aktuelles Fach- oder Linkreview aller Quellen. Die 138 Unit- und 30 E2E-Tests im bisherigen Review sind ein historischer Bericht. Eine positive Schema- oder Modellprüfung belegt weder Lernwirksamkeit noch echte Clusterfunktion. Zeitspannen unten sind redaktionelle Schätzungen anhand vorhandener Aktivitäten, keine gemessenen Lernerzeiten.


## Implementierter Änderungsstand · Lernplattform 2.0

Die 22 ursprünglichen JSON-Lektionen bleiben unverändert. Eine gezielte neue Lektion `zalando-postgres` ergänzt den direkten Einstieg in Manifest, Verbindung, Diagnose und Patroni. Damit 23 verfügbare Lektionen, weiterhin 58 ursprüngliche Aufgabenblöcke und 58 Quizfragen. Die neue Lektion benötigt weder Quiz noch Aufgabe. Die zuvor erfassten Zeitangaben sind historische Orientierungen, keine Mindestanforderung; Dauer ist im Schema jetzt optional.

Die gemeinsame [Themenbibliothek](../../packages/lesson-engine/src/library.ts) enthält verfügbare und klar geplante Themen, sechs Kategorien, Tags, Synonyme, Vorwissen, Beziehungen und direkte Internals-Links. Drei deklarative freiwillige Pfade greifen auf dieselben IDs zu. Suche berücksichtigt unter anderem HTTP-Zugriff/Ingress, PVC/PersistentVolumeClaim, Postgres/PostgreSQL, Zalando Operator/Postgres Operator und kubectl/Kubernetes CLI. Neue Inhalte werden nicht allein aus einer Katalogkarte als vorhanden behauptet.

Die Hauptnavigation lautet Entdecken, Lernpfade, Playground. Logo → Startseite, Einstellungen sekundär. Bisherige Lektions-URLs bleiben bestehen; `/academy` zeigt die Themenübersicht, `/operations`, `/visualizer` und `/build` bleiben funktionierende Werkzeuge. Die Startseite bietet Suche, zwei Einstiege, drei Pfadkarten und eine dezente Fortsetzung. Details zur UI: [Lernpfade](learning-path.md).

Ein freiwilliger Lesestatus ersetzt die drei verpflichtend wirkenden Abschlussanzeigen als primäre Orientierung. Format 5 erhält alle bisherigen Theorie-/Praxis-/Independent-Daten, ergänzt `readCompleted`, `recentLesson`, `lastPath` und sichert alte IndexedDB-Datensätze vor automatischer Migration. Bestehende Theorieabschlüsse werden als gelesen übernommen, ohne unabhängige Nachweise zu erfinden. Aufgaben und Quiz sind aufklappbar; alte Detailnachweise bleiben separat sichtbar. Keine Anmeldung und keine Clusteranbindung.

Für Szenario „Zalando Operator direkt finden“ wurde bewusst eine einzelne fachliche Einstiegslektion ergänzt. Für „Scheduler intern verstehen“ führt ein Suchtreffer direkt zu vorhandenen Internals, öffnet den Abschnitt und setzt den Fokus. Der Anfängerpfad startet bei Linux, ohne eine abgeschlossene Lektion als Zugangssperre zu verwenden.

Die folgenden Inventare beziehen sich, sofern nicht anders benannt, auf den erhaltenen Ausgangsbestand 0.3.0. Fehlende Fachstrecken bleiben Ausbauideen; die alten K-IDs und Zeitspannen sind keine verbindlichen Vorgaben. Aktuelle Test- und Einschränkungsnachweise stehen in [content-roadmap.md](content-roadmap.md).

### Neue Lektion: zalando-postgres

Quelle: [Zalando Postgres Operator verstehen und verwenden](../../content/lessons/zalando-postgres.json). Fünf Abschnitte: Einstieg, eigenes illustratives CR-Manifest, Service/Secret-Verbindung, Diagnosebeispiel, optionale PostgreSQL-/Patroni-Interna. Quellen aus dem offiziellen Projekt. Keine installierte DB, kein bestätigtes externes Lab. Fachliche Einstiegssubstanz verfügbar; vollständige Backup-, Upgrade- und Recovery-Labs bleiben geplant. Kein Quiz oder Praxisnachweis als Zugangsvoraussetzung.

## Befund des Ausgangsbestands

- 22 Lektionen in vier belegten Modulen; zwölf der 16 Themenbereiche haben keine eigenen JSON-Lektionen. Der externe Bootstrap-Leitfaden ist separat vorhanden.
- 22 Wissenschecks mit zusammen 58 Fragen; alle Fragen eines Checks müssen richtig sein.
- 58 Aufgabenblöcke: 20 grundlegende Praxisaufgaben (16 Zuordnungen, vier Ereignisprüfungen), 27 optionale Deep-Dive-Aufgaben (neun Zuordnungen, 18 Diagnosen), zwei geführte Zustandsprüfungen und neun unbewertete Reflexionen. Damit 49 automatisch prüfbare Aufgaben, nicht 58 unabhängige Challenges.
- Elf eingebettete Experimente verwenden zehn registrierte Modellarten. Architekturdiagramm und weitere Komponenten werden an mehreren Stellen wiederverwendet.
- Zusätzlich drei Operations-Szenarien und sieben manuelle Build-Checkpoints. Diese zählen nicht zu den 58 Aufgabenblöcken.
- Deklarierte Gesamtzeit: **607 Minuten**. Keine Aufteilung in Pflichtkern, optionale Vertiefung, externe Vorbereitung oder Wartezeit. Insbesondere neun neue Linux-/Container-Fachlektionen tragen pauschal je 30 Minuten.
- Der Konflikt „optional, aber für Praxis erforderlich“ ist im aktuellen Code bereits behoben. Geführter Modus, unabhängige Challenges und bewusstes Aufdecken von Hilfe existieren ebenfalls. Der neue Plan darf diese Verbesserungen nicht erneut als fehlend verkaufen.

## Bewertung jeder vorhandenen Lektion

**V** = für den benannten Konzeptumfang weitgehend vollständiger wiederverwendbarer Baustein; keine Abnahme als vollständige KubeShop-Kurslektion. **E** = inhaltlich/didaktisch erweitern. **F** = als Kursinhalt fehlend (separate Lückenmatrix). Selbst V braucht Kontext, Übergänge und Kursaufgaben. Zeit: bisher / geschätzter Browserkern + optionale Vertiefung in Minuten; externe Einrichtung ausgeschlossen. Die K-IDs verweisen auf den optional erhaltenen Ideenfundus in [learning-path.md](learning-path.md), nicht auf verpflichtende Kursplätze.

| Bestehende ID / Themen | Status und Tiefe | Didaktischer Ausbau / Wiederholung | Zeit bisher → Kern + Vertiefung | Primäres Kursziel |
| --- | --- | --- | --- | --- |
| `linux` · Kernel, VM/Container, Isolation | E · knapper Einstieg | Konkreten KubeShop-Prozess zeigen; Begriffe nur orientieren, Details in Fachlektionen | 12 → 8–12 + 0 | K1.01 |
| `linux-processes` · fork/exec, Signale, Zombie, PID 1 | E · differenziert, kompakt | Vorher/Nachher-Prozessbaum und Signalexperiment; Diagnose vorhanden | 30 → 12–18 + 5–10 | K1.02 |
| `linux-namespaces` · PID/Mount/Net/User | E · gute Abgrenzungen | Sichten vergleichbar machen; Linux- vs. Kubernetes-Namespace ausdrücklich trennen | 30 → 12–18 + 5–10 | K1.03 |
| `linux-cgroups` · v2, CPU, memory, pids | E · präzise Begriffe | Messreihe statt nur lesender Befehle; später Requests/QoS darauf aufbauen | 30 → 12–18 + 5–10 | K1.04 |
| `linux-systemd` · Unit, Aktivierung, Bereitschaft | E · Unit-Beispiel vorhanden | Fehlende Datei/Dienstbenutzer als Startzustand erklären; Unit reparieren | 30 → 12–18 + 5–10 | K1.05 |
| `linux-networking` · Socket, Route, DNS/NSS | E · mehrere Fehlergrenzen | Ein Paket/Verbindungsversuch als roter Faden; Wiederholung in DNS/CNI gezielt abrufen | 30 → 12–18 + 5–10 | K1.06 |
| `containers` · Image, Runtime, CRI | E · Orientierung | „Container ist laufende Instanz“ um gestoppte Zustände präzisieren; keine Vorgriffe auf Build Lab als Pflicht | 15 → 8–12 + 0 | K1.07 |
| `container-images` · OCI, Manifest/Index, Layer, Digest | E · gute technische Substanz | Image-Inhalt mit konkretem Shop-Release vergleichen; Layer/Tag-Aufgabe | 30 → 12–18 + 5–10 | K1.07 |
| `container-runtime` · containerd, Shim, runc | E · Grenzen sauber erklärt | Zeitfolge Metadaten/Task als Modell; Namespace-Grundlagen verlinken | 30 → 12–18 + 5–10 | K1.08 |
| `container-cri` · Dienste, Sandbox, Clients | E · klare Diagnosegrenzen | Vergleich ctr/crictl konkret auswerten; später kubelet-Lektion nur Integration | 30 → 12–18 + 5–10 | K1.09 |
| `container-lifecycle` · Zustände, Exit, Restart | E · differenzierter OOM-Hinweis | Neustart/Datenverlust beobachten; Probes später als Kubernetes-Anwendung | 30 → 12–18 + 5–10 | K1.10 |
| `cluster-basics` · Objekte, Identität, Soll/Ist | V · Konzept + Transfer + Diagnose | Einstieg entlasten; API-Discovery/UID als Deep Dive behalten | 20 → 10–15 + 8–12 | K2.01 |
| `control-plane` · Rollen, Static Pods, HA | V · Grundlagen und Interna | Grundrollen in Kapitel 2, HA-Topologie erst Kapitel 8; Diagramm nicht doppelt erklären | 25 → 12–18 + 10–15 | K2.03 |
| `api-lifecycle` · Authn/Authz/Admission, SSA | V · belastbarer Konzeptbaustein | Schreibpfad kurz einführen; Feldbesitz bei GitOps, Webhooks bei Policies vertiefen | 30 → 12–18 + 10–15 | K2.05 |
| `etcd` · Quorum, Raft, MVCC, Watch | V · tiefster Zustandsbaustein | Grundquorum behalten; Raft-/Recovery-Pfad freiwillig und später bei HA wiederverwenden | 35 → 12–18 + 15–25 | K2.05 |
| `controllers` · Deployment/RS, Informer/Queue | V · gutes Regelkreismodell | An konkreter Replikareparatur nutzen; Queue/Retry bei Operatoren abrufen | 30 → 12–18 + 10–15 | K3.02 |
| `scheduling` · Filter, Requests, Taints, Bind | V · zwei Modellniveaus | Anfänger brauchen zuerst Pod/Requests; PV-Topologie später; Score bleibt Lehrregel | 30 → 12–18 + 15–25 | K3.05 |
| `kubelet-runtime` · CRI, Sandbox, PLEG, Probes | V · gute Verantwortungsgrenzen | CRI-Definition nicht nochmals lehren; Probes am Shop anwenden | 25 → 12–18 + 10–15 | K3.04 |
| `apply-to-pod` · asynchrone Kette, Generation/Status | V · geeignetes Synthesethema | Nicht vor jedem Einzelkonzept wiederholen; Rollout-Diagnose als Kapitelabschluss | 30 → 12–18 + 10–15 | K3.06 |
| `component-failures` · API/Node/Quorum, Recovery | V · fachlich weit entwickelt | Grunddiagnose von HA/Restore trennen; Gegenbeweise und Restunsicherheit bewerten | 35 → 12–18 + 12–20 | K2.06 |
| `networking` · Service, Labels, DNS, CNI | E · brauchbarer Service-Einstieg | Leere Lernziele, nur eine Quizfrage; Operations-Aufgabe wird nur per Link erreicht | 20 → 10–15 + 0 | K4.01 |
| `cilium` · CNI, Policy, Verbindungsprüfung | E · externe Übung, keine Browserpraxisprüfung | Leere Lernziele; reproduzierbarer Startzustand und Ergebnisbelege fehlen als Kursvertrag | 30 → 8–12 + externe Übung separat | K4.03 / K4.04 |

Die neun Architekturbausteine haben jeweils Einführung, Erklärung, Experiment, Projektbezug, Reflexion, Internals, Transfer/Diagnose und drei Fragen. Diese Vollständigkeit des Formats bedeutet noch keinen zusammenhängenden Kurs. Linux/Container erklären anspruchsvolle Sachverhalte auf wenigen Absätzen; Tabellen und feste Auswahlantworten ersetzen das beobachtbare Experiment noch nicht. Die vier Einstiegs-/Netzwerklektionen haben jeweils nur eine Quizfrage, die übrigen 18 jeweils drei.

## Modelle, Visualisierungen und Grenzen

Quellen: [Experimenttypen](../../packages/lesson-engine/src/types.ts), [Architekturmodelle](../../packages/simulation-engine/src/architecture.ts), [Deep Labs](../../packages/simulation-engine/src/deep-labs.ts), [UI-Modelle](../../apps/web/src/components/ArchitectureExperiments.tsx), [Graph](../../apps/web/src/components/ClusterGraph.tsx).

| Bestand / Ort | Eingriff und sichtbare Rückmeldung | Grenze / Weiterverwendung |
| --- | --- | --- |
| `architecture` · cluster-basics/control-plane | Anklickbare Control Plane/Worker-Komponenten | Verantwortungsdiagramm; keine ausgeführten Prozesse; K2.01/K2.03 |
| `api` · api-lifecycle | Identität, Berechtigung, Admission verändern | Vereinfachter Schreibpfad, vier Ereignisnachweise; K2.05/K8.02 |
| `quorum` · etcd | Drei Mitglieder, Ausfall, manuelle Wahl, Write | Keine echte Replikation/Timer; K2.05 |
| `reconciliation` · controllers | Gewünschte/tatsächliche Replikate schrittweise abgleichen | Lehranimation, kein kompletter Deployment-Controller; K3.02/K7.03 |
| `scheduler` · scheduling | CPU, Node-Wunsch, Taint/Toleration | Deterministische vereinfachte Auswahl; K3.05 |
| `runtime` · kubelet-runtime | Netzwerk, Volume, Image, Readiness variieren | Logische Gates statt Containerstart; K3.04 |
| `flow` · apply-to-pod | Vom Apply durch Koordination zur Ausführung | Logische Folge, keine echte asynchrone Zeitmessung; K3.06 |
| `failure` · component-failures | Scheduler, API, Controller, Worker oder Quorum als Fehlerfall | Fünf vorgegebene Wirkungserklärungen; K2.06/K6.07 |
| `raft-internals` · etcd | Log, Term, Commit/Apply, Partition, Wahl, Heilung | Drei feste Mitglieder, manuelle Schritte; kein vollständiger Raft; K8.03 optional |
| `scheduler-internals` · scheduling | Vier Nodes, Filter/Score/Reserve/Permit/PreBind/Bind, Unreserve | Feste Constraints und Lehrscore; K3.05 optional, K5.02 Transfer |
| Separater Scheduler auf Visualizer-Seite | CPU-Schieberegler/erzwungener Node | Überlappt Architektur-Scheduler; als einfacher Einstieg erhalten, gemeinsam referenzieren |
| ClusterGraph · Visualizer/Operations | Beispielarchitektur oder gespeicherter Cluster, Service-Pod-Beziehungen | Keine Pakete/DNS/Probes; K4.01 und Playground |
| YAML-Editor + Terminal · Operations | Apply, Get, Describe Pod, Scale, Delete, help/clear | Nur Pod/Deployment/Service; kein Linux-Terminal, keine Helm-/CSI-/Operatorausführung |
| 18 Diagnosefälle | Zwei Befundkarten, Ursache und Korrektur wählen, beliebige Untersuchungsfolge | Verfasste Modellbefunde, jeweils feste richtige Auswahl; keine offene Diagnosebewertung |

Das Cluster-Modell erzeugt Pods aus Deployment-Replikazahlen; das Terminal beschränkt Aktionen auf `default`. Apply unterstützt Objektidentität einschließlich Namespace, aber kein vollständiges Kubernetes-Schema. Limits: 100 Ressourcen, 20 Deployment-Replikate, 100 KB Manifest. `get nodes` ist eine feste Beispieldarstellung; Service-Endpunkte werden aus Labels berechnet. Ein grüner Zustand belegt keine realen HTTP-Verbindungen. Neue Kursaufgaben für andere Ressourcen brauchen zunächst Befund-/Manifestaufgaben oder eine ausdrücklich begrenzte neue Simulation, nicht stillschweigend zusätzliche Fähigkeiten des vorhandenen Terminals.

### Zusätzliche Praxis außerhalb der Lektionen

[Operations-Szenarien](../../packages/simulation-engine/src/scenarios.ts): `selector` prüft passenden Deployment-Selektor und genau drei Pods; `service` prüft zwei zum Deployment gehörende Service-Ziele; `replicas` prüft Wiederherstellung von null auf zwei Pods. Das sind echte Zustandsprüfungen des Browsermodells. Kein Nachweis für Netzwerkverkehr oder reale Container.

[Build Lab](../../apps/web/src/pages/buildSteps.ts), sieben Schritte: (1) Lab-Umgebung vorbereiten, (2) Linux konfigurieren, (3) containerd einrichten, (4) kubeadm/kubelet/kubectl installieren, (5) Control Plane initialisieren, (6) Pod-Netzwerk und Worker verbinden, (7) ersten Workload prüfen. Manuelle Checkpoints sind Selbstauskünfte. [Lab-Vertrag](../../labs/kubeadm/README.md): drei Ubuntu-24.04-VMs, insgesamt mindestens 6 vCPU/8 GB/60 GB, festgelegte historische Paketstände, Snapshot-Reset. `export-steps.mjs` und `verify-vms.py` sind vorbereitet; kein erfolgreich bestätigter vollständiger VM-Lauf. Diese Versionsangaben sind Inventar, keine neue Installations- oder Kompatibilitätsempfehlung.

## Navigation und kognitive Belastung vor dem Redesign

[App](../../apps/web/src/App.tsx): fünf Hauptpunkte `/#/`, `/#/academy`, `/#/build`, `/#/operations`, `/#/visualizer`; Einstellungen `/#/settings`, GitHub extern. Lektionen: `/#/academy/:id`, Modulfilter `?module=03`. Dashboard und Academy starten bevorzugt bei Architektur/Modul 03, obwohl der beworbene Pfad bei Linux beginnt. 16 Themenkacheln und mehrere Werkzeuge konkurrieren um den nächsten Schritt.

[LessonPage](../../apps/web/src/pages/LessonPage.tsx) zeigt Lernziele, Inhaltsverzeichnis, viele Abschnitte, Modell, Aufgabe, Internals, Quiz und Modulnavigation auf einer Seite. Optionales Einklappen reduziert nur einen Teil der Dichte. Editor/Terminal liegen außerhalb der Lektion; Beispielprojekt und aktueller Lab-Zustand sind nicht als gemeinsame Lektionseinheit verbunden. [Neues Konzept](learning-path.md) ersetzt die Werkzeugnavigation durch Entdecken, Lernpfade und Playground sowie eine zusammenhängende Lektionsansicht mit optionalen Vertiefungen.

## Content-Schema und Bewertung vor dem Redesign

[Schema](../../packages/lesson-engine/lesson.schema.json), [Validierung](../../packages/lesson-engine/src/schema.ts), [Bewertung](../../packages/lesson-engine/src/assessment.ts): Schema-Version 1, stabile IDs, Modul, Kategorie, Niveau, eine undifferenzierte Dauer, Ziele, Abschnitte/Blöcke, Quellen und reviewedOn. Blocktypen: text, heading, list, code, table, callout, experiment, task, quiz (neun Typnamen; Experimentarten sind davon getrennt). Code unterscheidet external/simulation/example/output. Kein ausführbarer Content-Code.

Validiert werden u. a. eindeutige IDs, genau ein Quiz, passende Antwortindizes, rechteckige Tabellen, registrierte Diagnosen und zuvor deklarierte passende Experimente. Kein modelliertes Voraussetzungennetz, keine Schritte, keine KubeShop-Version, keine Zeitaufteilung, keine versionierten Lernzielnachweise. `goals: []` ist praktisch möglich. Quellenfelder und Reviewdatum belegen keine fachliche Abnahme.

`matching` prüft exakte Auswahl; `experiment` sammelt Ereignisse ohne Reihenfolgevertrag; `state-machine` prüft Verlauf und berechneten Zustand; `diagnosis` verlangt Befunde und passende Ursache/Korrektur; `reflection` vergibt keinen Nachweis. Die strengen Raft-/Scheduler-Pfade sind tier `exploration`, nicht unabhängige Kompetenzprüfung.

## Fortschritt und Bestandsschutz vor dem Redesign

[Store](../../apps/web/src/stores/progress.ts), [Abschlussfunktionen](../../packages/lesson-engine/src/index.ts): IndexedDB `kubelab-progress`, Format 4. Theorie in `theoryCompleted`; geprüfte Aufgaben in `practiceCompleted` als `lessonId/taskId`; eigenständige optionale Nachweise zusätzlich in `independentCompleted`. Dazu sieben Checkpoints, Operations-IDs, alter challenge-Schalter, lastLesson, Theme. Versionen 1/2 (`completed`) und 3 werden eingelesen; Version 1 hat eine besondere historische Regel für control-plane. Alte Praxis wird nie automatisch zu unabhängigem Nachweis.

Grundlagen = Wissenscheck; Praxis = alle grundlegenden Aufgaben; Deep Dive = Grundlagen + Praxis + alle unabhängigen Vertiefungsaufgaben. Kein Anspruch auf manipulationssichere Zertifizierung. Challenge-Modus blendet geführte Internals-Modelle aus; Hilfe markiert den aktuellen Versuch als unterstützt. Modus-/Lektionswechsel setzt temporäre Antworten/Belege zurück, nicht erworbene Nachweise. Fehlende IDs können einen Import ungültig machen: bloßes Umbenennen der Lektionen wäre eine Datenregression.

Separat gespeichert: [LabState](../../packages/lab-state/src/index.ts) / [Lab-Store](../../apps/web/src/stores/lab.ts), Schlüssel `kubelab-lab-v1`, Version 1 mit YAML-Entwurf, angewendetem YAML, Cluster, Szenario, Ausgabe. Ein ungültiger Entwurf darf neben einem gültigen angewendeten Cluster existieren. Lernstand und Lab haben Export/Import; Kurswechsel darf keines überschreiben. Konkreter Migrationsvertrag: [Roadmap](content-roadmap.md).

## Fehlende Kursstrecken und Priorisierung

| Bestandsthema | Status | Fehlender Lernnachweis / Ziel |
| --- | --- | --- |
| Bootstrap (04) | E · sieben externe Schritte, keine Kurslektionen | Voraussetzungen, Ursachen von NotReady, reproduzierbarer VM-Nachweis; K2 |
| Workloads (05) | F als systematischer Kurs; Deployment im Modell vorhanden | Pods/YAML, Konfiguration, Rollout, Jobs/CronJobs, StatefulSet/DaemonSet; K3/K5/K6 |
| Ressourcen (06) | E · Teil von scheduling | Requests/Limits/QoS, Eviction, Affinity/Spread, Kapazität; K3.05/K8.03 |
| Netzwerk (07) | E · zwei Einführungen | DNS/CNI/Policy als überprüfbare Verbindungskette, Hubble; K4 |
| Ingress/Gateway (08) | F | MetalLB, Routing/Controller, TLS/cert-manager; K4.05–K4.07 |
| Storage (09) | F | PV/PVC/CSI/StorageClasses, Longhorn, Datenverlust/Restore; K5 |
| Packaging (10), Operators (11), GitOps (13) | F | Helm/Kustomize, CRDs/Controller, Zalando, Argo/ApplicationSets; K7 |
| Observability (12) | F | Prometheus Operator, Prometheus/Grafana, Loki/Alloy, Alertmanager, Diagnose; K6 |
| Security (14) | F als Kurs; API-Auth erklärt | RBAC/ServiceAccounts, Secrets/ESO, Pod Security, Kyverno; K3.03/K7.07/K8 |
| HA (15), Troubleshooting (16) | E · Architekturdiagnosen, drei einfache Fehler | HPA/Metrics Server, KEDA, HA, Upgrades, Velero/DB-Recovery, End-to-End-Incident; K6/K8 |
| Infrastruktur aus Gesamtroadmap | F | Terraform/OpenTofu, Ansible, lokale reproduzierbare Nodes; K8.06 |

### Wiederholungen gezielt nutzen

Linux → Runtime → kubelet erklärt heute mehrfach Kernel, CRI und Laufzeitgrenzen. Zukünftig: ein Grundmodell in K1, kurze Abruffrage in K2/K3, neue Kubernetes-Verantwortung statt desselben Texts. Soll/Ist und Reconciliation zuerst beim Deployment, später neuer Transfer auf Operatoren/GitOps. API/etcd/HA wird gestuft statt dreimal vollständig gelehrt. Service-Selektor in Operations und networking wird dieselbe eingebettete Aufgabe mit stabiler Nachweis-ID. Architekturdiagramme sind gemeinsame Ressourcen, keine zusätzlichen Lektionen. Teamboard bleibt bis zur geplanten Migration im Bestand erhalten; KubeShop erhält eine explizite Zuordnung, keine globale Text-Ersetzung.

## Vollständiger Aufgaben- und Quizindex

Die folgenden Einträge werden aus den gelieferten JSON-Dateien erfasst. Aufgaben-IDs sind innerhalb der Lektion qualifiziert; Texte/Antwortoptionen und Lösungen bleiben in der verlinkten Quelle. Die Fragen sind vollständig aufgeführt; Modellfälle verwenden die gleichnamige Lektions-ID, soweit `diagnosis` angegeben ist.

### `api-lifecycle`

Quelle: [kube-apiserver: der Lebenszyklus einer Anfrage](../../content/lessons/api-lifecycle.json).

- Aufgabe `practice`: Deine Aufgabe · practice / experiment.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `api-lifecycle`.
- Quiz `theory/q1`: Was prüft Autorisierung?
- Quiz `theory/q2`: Eine Admission-Regel lehnt ein Pod-Objekt ab. Was darfst du daraus folgern?
- Quiz `theory/q3`: Warum kann ein Controller nach erfolgreichem Deployment-Apply trotzdem keine Pods erzeugen?

### `apply-to-pod`

Quelle: [Von kubectl apply zum bereiten Pod](../../content/lessons/apply-to-pod.json).

- Aufgabe `practice`: Deine Aufgabe · practice / matching.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `apply-to-pod`.
- Quiz `theory/q1`: Welche logische Reihenfolge passt?
- Quiz `theory/q2`: Welche Information zeigt der gespeicherte Cluster-Visualizer?
- Quiz `theory/q3`: Nach Apply-Erfolg gibt es noch keine Pod-Objekte. Was untersuchst du zuerst?

### `cilium`

Quelle: [Netzwerkregeln mit Cilium](../../content/lessons/cilium.json).

- Keine strukturierten Aufgabenblöcke; Arbeitsaufträge stehen nur im Fließtext.
- Quiz `theory/q1`: Was macht eine Ingress-Policy mit leerer ingress-Liste für die ausgewählten Pods?

### `cluster-basics`

Quelle: [Was ist Kubernetes – und was ist ein Cluster?](../../content/lessons/cluster-basics.json).

- Aufgabe `practice`: Deine Aufgabe · practice / matching.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `cluster-basics`.
- Quiz `theory/q1`: Welche Einheit plant der Scheduler auf einen Node?
- Quiz `theory/q2`: Was bestätigt ein erfolgreich angenommenes Deployment zunächst?
- Quiz `theory/q3`: Welche Planung fehlt, wenn alle Replikate auf einer Maschine laufen?

### `component-failures`

Quelle: [Was passiert bei einem Komponenten- oder Node-Ausfall?](../../content/lessons/component-failures.json).

- Aufgabe `practice`: Deine Aufgabe · practice / matching.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `component-failures`.
- Quiz `theory/q1`: Was blockiert ein alleiniger Scheduler-Ausfall typischerweise zuerst?
- Quiz `theory/q2`: Was braucht Ersatz nach einem Worker-Ausfall zusätzlich zu einem Deployment?
- Quiz `theory/q3`: Welche Aussage ist eine belastbare Enterprise-Planung?

### `container-cri`

Quelle: [CRI: Vertrag und Pod Sandbox](../../content/lessons/container-cri.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `container-cri`.
- Quiz `theory/q1`: CRI ist …
- Quiz `theory/q2`: Wer spricht CRI?
- Quiz `theory/q3`: RunPodSandbox betrifft …

### `container-images`

Quelle: [OCI Images: Index, Manifest und Layer](../../content/lessons/container-images.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `container-images`.
- Quiz `theory/q1`: Ein Manifest verweist auf …
- Quiz `theory/q2`: Ein Index hilft bei …
- Quiz `theory/q3`: Pull-Erfolg bedeutet …

### `container-lifecycle`

Quelle: [Container-Lifecycle und Fehleranalyse](../../content/lessons/container-lifecycle.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `container-lifecycle`.
- Quiz `theory/q1`: Created bedeutet …
- Quiz `theory/q2`: Wer garantiert laut OCI einen automatischen Restart?
- Quiz `theory/q3`: Was stützt die OOM-Diagnose?

### `container-runtime`

Quelle: [containerd, Shims und runc](../../content/lessons/container-runtime.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `container-runtime`.
- Quiz `theory/q1`: runc verarbeitet primär …
- Quiz `theory/q2`: Was beweist ein Container-Metadateneintrag nicht?
- Quiz `theory/q3`: Der Shim gehört zur …

### `containers`

Quelle: [Vom Image zum Container](../../content/lessons/containers.json).

- Aufgabe `practice`: Begriffe zuordnen · practice / matching.
- Quiz `theory/q1`: Wie kommuniziert kubelet mit containerd?

### `control-plane`

Quelle: [Control Plane und Worker Nodes](../../content/lessons/control-plane.json).

- Aufgabe `practice`: Deine Aufgabe · practice / matching.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `control-plane`.
- Quiz `theory/q1`: Wer startet Container über die Runtime-Schnittstelle?
- Quiz `theory/q2`: Wie kommuniziert der Scheduler seinen Platzierungsentscheid?
- Quiz `theory/q3`: Drei Worker und eine Control Plane: Was bleibt ein Ausfallrisiko?

### `controllers`

Quelle: [Controller Manager und Reconciliation](../../content/lessons/controllers.json).

- Aufgabe `practice`: Deine Aufgabe · practice / matching.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `controllers`.
- Quiz `theory/q1`: Wer erzeugt normalerweise die Pod-Objekte eines ReplicaSets?
- Quiz `theory/q2`: Ein Deployment hat replicas: 0. Was sollte der Controller erreichen?
- Quiz `theory/q3`: Was garantiert Reconciliation nicht?

### `etcd`

Quelle: [etcd, Desired State und Quorum](../../content/lessons/etcd.json).

- Aufgabe `practice`: Deine Aufgabe · practice / experiment.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-practice`: Zustands-Challenge · Partition und Wiedervereinigung · exploration / state-machine / `raft-partition-v1`.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `etcd`.
- Quiz `theory/q1`: Wie viele Stimmen braucht ein Cluster mit drei abstimmenden Mitgliedern?
- Quiz `theory/q2`: Was ist nach einem Leader-Ausfall bei zwei verbleibenden Mitgliedern möglich?
- Quiz `theory/q3`: Welche Aussage über etcd-Ausfall ist korrekt?

### `kubelet-runtime`

Quelle: [kubelet, CRI und Container Runtime](../../content/lessons/kubelet-runtime.json).

- Aufgabe `practice`: Deine Aufgabe · practice / experiment.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `kubelet-runtime`.
- Quiz `theory/q1`: Was ist CRI?
- Quiz `theory/q2`: Ein Container läuft, die Readiness-Probe scheitert. Was ist möglich?
- Quiz `theory/q3`: Wer führt die Platzierungsentscheidung aus?

### `linux-cgroups`

Quelle: [cgroups v2 und Ressourcenengpässe](../../content/lessons/linux-cgroups.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `linux-cgroups`.
- Quiz `theory/q1`: cpu.max 50000 100000 entspricht langfristig …
- Quiz `theory/q2`: Was ist kein fester CPU-Deckel?
- Quiz `theory/q3`: Welcher Befund stützt cgroup-OOM?

### `linux-namespaces`

Quelle: [Namespaces und sichtbare Ressourcen](../../content/lessons/linux-namespaces.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `linux-namespaces`.
- Quiz `theory/q1`: Welcher Mechanismus begrenzt CPU?
- Quiz `theory/q2`: Gleicher Network-Namespace bedeutet …
- Quiz `theory/q3`: Was zeigt uid_map?

### `linux-networking`

Quelle: [Linux-Netzwerk: vom Socket zur Route](../../content/lessons/linux-networking.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `linux-networking`.
- Quiz `theory/q1`: localhost zeigt auf …
- Quiz `theory/q2`: Eine erfolgreiche Route-Abfrage beweist …
- Quiz `theory/q3`: Welcher Test prüft einen lokalen TCP-Listener?

### `linux-processes`

Quelle: [Prozesse, Signale und PID 1](../../content/lessons/linux-processes.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `linux-processes`.
- Quiz `theory/q1`: Was tut exec?
- Quiz `theory/q2`: Ein Zombie verschwindet typischerweise durch …
- Quiz `theory/q3`: Warum ist PID 1 relevant?

### `linux-systemd`

Quelle: [systemd: Start, Abhängigkeiten und Diagnose](../../content/lessons/linux-systemd.json).

- Aufgabe `practice`: Geführte Zuordnung · practice / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `linux-systemd`.
- Quiz `theory/q1`: Was bewirkt daemon-reload?
- Quiz `theory/q2`: After allein …
- Quiz `theory/q3`: Type=notify benötigt …

### `linux`

Quelle: [Linux ist das Fundament](../../content/lessons/linux.json).

- Aufgabe `practice`: Begriffe zuordnen · practice / matching.
- Quiz `theory/q1`: Was begrenzt den CPU- und Speicherverbrauch einer Prozessgruppe?

### `networking`

Quelle: [Vom Pod zum Service](../../content/lessons/networking.json).

- Keine strukturierten Aufgabenblöcke; Arbeitsaufträge stehen nur im Fließtext.
- Quiz `theory/q1`: Warum kann ein gültiger Service trotzdem keine Pod-Endpunkte haben?

### `scheduling`

Quelle: [Scheduler und Pod-Platzierung](../../content/lessons/scheduling.json).

- Aufgabe `practice`: Deine Aufgabe · practice / experiment.
- Aufgabe `expert`: Expert-Challenge · Transfer auf die Architektur · practice / reflection.
- Aufgabe `internals-practice`: Zustands-Challenge · Fehlgeschlagenes Binding reparieren · exploration / state-machine / `scheduler-pipeline-v1`.
- Aufgabe `internals-transfer`: Transfer · Verhalten vorhersagen und begründen · deep-dive / matching.
- Aufgabe `diagnosis`: Eigenständige Fehleranalyse · deep-dive / diagnosis / `scheduling`.
- Quiz `theory/q1`: Welche Größe ist für den grundlegenden CPU-Ressourcenfilter relevant?
- Quiz `theory/q2`: Was garantiert eine Toleration?
- Quiz `theory/q3`: Was folgt aus einer Scheduler-Bindung?

