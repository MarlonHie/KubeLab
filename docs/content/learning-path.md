# Lernpfade und zentrale Inhaltsbibliothek

Stand: 29. Oktober 2026 · Lernplattform 2.0. KubeLab hilft Menschen, Kubernetes zu verstehen. Es ist weder eine verpflichtende Ausbildung zum Experten noch eine Prüfungslaufbahn. Themen können einzeln geöffnet, Lernpfade gewechselt und Internals direkt gelesen werden. Kein Konto, kein eigener Cluster und keine kostenpflichtige Backend-Infrastruktur sind notwendig.

## Informationsarchitektur – umgesetzt

- **Entdecken** (`/#/discover`): zentrale Themenbibliothek mit Kategorien, Titel-/Beschreibungs-/Tag-/Synonymsuche, Verfügbarkeitsfilter und direkten Deep-Dive-Links. Geplante Themen werden ausdrücklich von vorhandenen Lektionen unterschieden. Kategorien zeigen zunächst eine Auswahl statt alle Einträge gleichwertig auszubreiten.
- **Lernpfade** (`/#/paths`): drei freiwillige Empfehlungen aus denselben Inhalts-IDs. Kein Freischalten, keine Pflichtreihenfolge, kein separates Kopieren oder Zählen derselben Lektion.
- **Playground** (`/#/playground`): YAML-Editor, simuliertes Terminal, Visualizer und bestehender externer Build-Leitfaden als Werkzeugauswahl. Architekturmodelle bleiben in Lektionen direkt erreichbar. Der Build-Leitfaden ist ein optionales Dokument, kein vorausgesetzter echter Cluster.

Das Logo führt zur ruhigen Startseite: „Kubernetes verstehen. In deinem Tempo.“, prominente Suche, zwei Einstiege und drei Lernpfadkarten. Letzte Lektion und letzter verwendeter Pfad erscheinen dezent nach Nutzung. Einstellungen bleiben sekundär. Die frühere Aufteilung Lernpfad/Playground/Nachschlagewerk ist ersetzt; die Referenzfunktion gehört jetzt zu Entdecken.

## Deklarative Definition

Verbindliche Implementierungsquelle ist [library.ts](../../packages/lesson-engine/src/library.ts). `Topic` verknüpft Kategorie, Tags, Synonyme, empfohlenes Vorwissen, verwandte Themen, Deep-Dive-Abschnitte, optionale Werkzeuge und KubeShop-Bezug mit einer vorhandenen `lessonId`. Ohne `lessonId` ist das Thema geplant und führt zu einer transparenten Vorschau. Neue vollständige Lektionen ergänzen dieselbe Bibliothek.

`learningPaths` enthält Titel, Zielgruppe, Beschreibung, Schwerpunkte und geordnete Themengruppen. React-Komponenten besitzen keine eigenen fachlichen Empfehlungslisten. `topicPaths` leitet die Pfadzugehörigkeit ab, `pathTopics` liefert dieselben Themenobjekte. Suche und Links verwenden diese Metadaten. Die Nummerierung eines Lernpfads ist eine Orientierung, keine Voraussetzung.

| Lernpfad | Für wen? | Empfohlene Themengruppen |
| --- | --- | --- |
| A · Kubernetes im Alltag (`alltag`) | Entwickler auf bestehenden Clustern | Ressourcen/YAML/kubectl → Pods → Deployments/ReplicaSets → Services/DNS → Ingress/Gateway; Orientierung vertiefen; weitere Workloads; ConfigMaps/Secrets; Ressourcen/Probes/Skalierung; Storage/StatefulSets; CRDs/Operatoren; Zalando Postgres Operator; Monitoring/Logs/Fehlersuche; Helm/Kustomize/GitOps; RBAC/ServiceAccounts |
| B · Kubernetes verstehen (`verstehen`) | Einsteiger und neugierige Entwickler | Linux; Container/Runtime; Warum Kubernetes/Clusterbegriffe; Rollen/Control Plane/Worker; API/etcd; Controller; Scheduler/kubelet; Networking; Storage; Erweiterbarkeit |
| C · Kubernetes betreiben (`betreiben`) | Menschen mit Interesse am Clusterbetrieb | Bootstrap/kubeadm; Runtime/Nodes; CNI/Cilium; Netz/DNS; Storage/CSI; Observability; Security; HA; Backup/Recovery; Upgrades/Troubleshooting/IaC |

Vorhandene Architekturlektionen bilden besonders Pfad B. Pfad A verlangt keine vorherige Installation oder Raft-Kenntnis. Pfad C ist als Verständnisweg mit Beispielen/Modellen zugänglich; optionale externe Befehle werden nicht im Browser ausgeführt. Fehlende Kursstrecken werden als geplant sichtbar, nicht als bereits fertiger Kurs verkauft. „Weiterlernen“ sucht die nächste ungelesene **verfügbare** Lektion; innerhalb des Pfads bleiben geplante Themen ebenfalls sichtbar. Beim nächsten Thema in einer Lektion gilt die tatsächliche Metadatenreihenfolge, auch wenn dieses Thema noch geplant ist.

## Ausgelieferter Alltagseinstieg · Content-Phase 1

Die ersten fünf Themen von `alltag` sind jetzt vollständige, aufeinander aufbauende Lektionen: `resources-basics`, `pods`, `deployments`, `networking`, `ingress`. Alle sind auch einzeln über Entdecken erreichbar. Das vorhandene `networking` wurde erweitert, nicht durch eine neue ID ersetzt. Die zuvor geplanten Karten Pods, Deployments und Ingress werden automatisch durch ihre verfügbaren Lektionen ersetzt. Gateway-Details bleiben ein separates Ausbauziel, der Einstieg ist bereits in Ingress enthalten.

KubeShop verbindet die fünf Erklärungen; vertiefende Architektur ist keine Zugangsvoraussetzung. Zusätzliche `deepDiveLinks` verweisen direkt auf bestehende Internals anderer Lektionen und werden auf gültige Zielabschnitte geprüft. Ausführliche Zuordnung und Prüfbericht: [Content-Phase 1](everyday-phase-1.md).

## Lernen und Fortschritt

Eine Lektion besitzt einen freiwillig gesetzten Lesestatus. Ein Klick auf „Als gelesen markieren“ genügt; Wiederaufheben ist möglich. Derselbe Status gilt in jedem Pfad. Quiz, Praxisaufgabe, Challenge und Deep Dive sind optional und dürfen fehlen. Die bisherigen differenzierten Nachweise werden erhalten, aber in einer sekundären Ansicht angeboten. Sie sperren weder den Lesestatus noch verwandte Themen. Migration: [Roadmap](content-roadmap.md).

Lektionsseiten zeigen zusammenhängende Erklärung mit Abschnitten, passendem Beispiel und optionalen Werkzeugen. Vorhandene Aufgaben/Quiz sind aufklappbar; Internals bleiben eigenständig aufklappbar und über `?section=internals` direkt adressierbar. Der Fokus springt dann zum geöffneten Abschnitt. `?path=…` erhält freiwilligen Pfadkontext für Rückkehr und nächstes Thema. Normales Öffnen eines Themas erzeugt keine automatische Pfadpflicht.

Vorwissen wird als Empfehlung beschriftet. Alle Beziehungen kommen aus Metadaten. Quellen und technische Erklärungen werden weiterverwendet, nicht für jeden Pfad dupliziert. Historische Teamboard-Texte bleiben erhalten; KubeShop ist ein wiederkehrendes Beispiel, keine notwendige Metadatenbedingung für jede Lektion.

## Umfang, Dauer und spätere Inhalte

Es gibt keine Mindestzahl an Lektionen, keine Mindestlernzeit und keine Zielquote für Fragen oder Interaktionen. Zeitangaben sind unverbindliche Orientierung und im Schema optional. Neue Inhalte entstehen aus konkreten Verständnislücken; sie benötigen weder Quiz noch Aufgabe. Die kurze neue Zalando-Lektion stellt den direkten Alltagseinstieg her, ohne alle geplanten Operator-/Storage-Kurse auszuarbeiten.

Die folgende frühere Acht-Kapitel-Planung bleibt als **redaktioneller Themen- und Ideenfundus** erhalten. Ihre 56 K-IDs sind historische Planungskennungen, keine Sollzahl, keine aktuellen Lernpfad-IDs und kein verpflichtender Kursumfang. Tätigkeits-/Zeitvorschläge und die dort aufgeführten Wissensbezüge können bei Ausarbeitung angepasst oder weggelassen werden. Es gibt kein verbindliches Gesamtstundenbudget. E/I/P/R bezeichnet in den alten Schätzungen Erklärung, Interaktion, Praxis und Rückblick; keine dieser Tätigkeiten ist für jede neue Lektion vorgeschrieben. Die Fachdetails und Wiederverwendungszuordnungen bleiben nützlich, ohne alle Benutzer durch diese Reihenfolge zu führen.

## Ideenfundus aus der bisherigen Planung

## 1. Die Grundlagen

### K1.01 · Warum KubeShop eine Laufzeitumgebung braucht

- **Empfohlenes Vorwissen:** Keine; Dateien öffnen und Browser bedienen.
- **Lernziele:** Programm, Prozess, Container und VM unterscheiden; die drei Ausführungsarten erkennen.
- **Inhalte:** Shop-Anfrage vom Browser zum Server; gemeinsamer Kernel; Linux-Grundbegriffe, Shell/Dateipfad/Benutzer, Orientierung im Kurs.
- **Mögliche Interaktion:** Anfrageweg anklicken und Prozess/VM/Container zuordnen.
- **Mögliche freiwillige Praxis:** Eine fehlerhafte Architekturskizze korrigieren und begründen, wo ein Programm läuft.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 20 Min. (5/5/7/3 E/I/P/R).
- **Optionale Deep Dives:** Kernel-/Userspace-Grenze; linux-Interna.
- **Wiederverwendung:** linux.

### K1.02 · Der Shop-Prozess beendet sich nicht sauber

- **Empfohlenes Vorwissen:** K1.01.
- **Lernziele:** fork/exec unterscheiden; Signal, Exit und Reaping anhand eines Prozessbaums erklären.
- **Inhalte:** PID/PPID, Threads, SIGTERM/SIGKILL, Zombie, PID 1; kontrolliertes Beenden einer Anfrage.
- **Mögliche Interaktion:** Prozessbaum mit Vorher/Nachher-Befunden und Signalentscheidung.
- **Mögliche freiwillige Praxis:** Zombie-Fall diagnostizieren; passende Korrektur am Elternprozess auswählen statt wiederholt kill zu senden.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Subreaper und Namespace-Init aus linux-processes.
- **Wiederverwendung:** linux-processes.

### K1.03 · Zwei Shop-Instanzen brauchen getrennte Sichten

- **Empfohlenes Vorwissen:** K1.02.
- **Lernziele:** PID-, Mount-, Network- und User-Sicht trennen; Isolation von Ressourcenbegrenzung abgrenzen.
- **Inhalte:** /proc/PID/ns, Mounts, UID-Mapping, localhost; Linux-Namespace ist kein Kubernetes-Namespace.
- **Mögliche Interaktion:** Zwei Prozesssichten vergleichen, geteilte und getrennte Ressourcen markieren.
- **Mögliche freiwillige Praxis:** Einen scheinbar verschwundenen Prozess durch passende Sicht erklären und Gegenbeleg nennen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Mount-Propagation, Capabilities, veth; linux-namespaces.
- **Wiederverwendung:** linux-namespaces.

### K1.04 · Der Shop ist langsam, obwohl der Host frei wirkt

- **Empfohlenes Vorwissen:** K1.03.
- **Lernziele:** CPU-Quote und Gewicht unterscheiden; Speicher-/PID-Grenzen aus Befunden diagnostizieren.
- **Inhalte:** cgroup v2, cpu.max/weight, memory.high/max/events, pids.max; Anfrage-Latenz und Zeitfenster.
- **Mögliche Interaktion:** Beschriftete Messreihen für Nachfrage, Budget und Throttling vergleichen.
- **Mögliche freiwillige Praxis:** CPU-Drosselung von Host-Überlastung und OOM unterscheiden; Korrektur plus erwarteten Nachher-Befund angeben.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Delegation, Hierarchie, Speicherabrechnung; linux-cgroups.
- **Wiederverwendung:** linux-cgroups.

### K1.05 · KubeShop soll nach einem Neustart starten

- **Empfohlenes Vorwissen:** K1.02.
- **Lernziele:** Unit, enabled, active und ready unterscheiden; fehlerhafte Dienstkonfiguration eingrenzen.
- **Inhalte:** systemd-Unit/Drop-in, Benutzer und Pfade, ExecStart, After/Wants/Requires, daemon-reload, Restart-Grenzen.
- **Mögliche Interaktion:** Unit-Diff und Journal-Befundkarten gegenüberstellen.
- **Mögliche freiwillige Praxis:** Ungültigen Startpfad korrigieren und erklären, welche Aktion Konfiguration neu lädt und welche startet.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Type=notify, KillMode und Start-Limits; linux-systemd.
- **Wiederverwendung:** linux-systemd.

### K1.06 · Der Shop antwortet lokal, aber nicht über das Netz

- **Empfohlenes Vorwissen:** K1.03.
- **Lernziele:** Bind-Adresse, Routing, Namensauflösung und HTTP getrennt prüfen.
- **Inhalte:** Socket/Port, Interfaces, Route/Rückweg, Nachbarn, DNS/NSS, TCP, localhost, NAT/Filter als Grenzen.
- **Mögliche Interaktion:** Verbindungsweg mit einzelnen prüfbaren Grenzen; vorhandene DNS-Diagnose als Basis.
- **Mögliche freiwillige Praxis:** Aus Listener-, IP- und Namensbefunden die erste fehlerhafte Grenze bestimmen; kein globaler Netzwerkreset.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** veth/Bridge, IPv6, NAT; linux-networking.
- **Wiederverwendung:** linux-networking.

### K1.07 · Dasselbe Shop-Release soll überall dasselbe bedeuten

- **Empfohlenes Vorwissen:** K1.01, K1.04, K1.06.
- **Lernziele:** Image und Container trennen; Tag, Digest und Plattformmanifest korrekt auswählen.
- **Inhalte:** OCI-Index/Manifest/Config/Layer, Registry, Plattform, Writable Layer; einfacher vorbereiteter Containerfile-Build, keine Geheimnisse im Image.
- **Mögliche Interaktion:** Zwei Release-Artefakte und ihre Layer vergleichen; Plattformwahl variieren.
- **Mögliche freiwillige Praxis:** Passendes Image für vorgegebene Node-Architektur auswählen und veränderlichen Tag erklären.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Whiteouts, Snapshotter, Signaturen als eigener Vertrauensnachweis; container-images.
- **Wiederverwendung:** containers, container-images.

### K1.08 · Das Image ist da, aber der Shop läuft nicht

- **Empfohlenes Vorwissen:** K1.07, K1.05.
- **Lernziele:** containerd, Shim und runc zuordnen; Metadaten von Task/Prozess unterscheiden.
- **Inhalte:** OCI Bundle, vorbereitete rootfs, Runtime-v2-Grenzen, Verantwortlichkeit für Start und Betreuung.
- **Mögliche Interaktion:** Bestehende Runtime-Diagnose mit zeitlicher Spur Image → Metadaten → Task ergänzen.
- **Mögliche freiwillige Praxis:** Befund „Definition vorhanden, kein Task“ erklären und richtigen Diagnosepunkt wählen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** OCI Runtime Lifecycle, Runtime-v2; container-runtime.
- **Wiederverwendung:** container-runtime.

### K1.09 · Kubernetes muss mit der Runtime sprechen können

- **Empfohlenes Vorwissen:** K1.08.
- **Lernziele:** RuntimeService und ImageService trennen; ctr-Erfolg nicht als CRI-Nachweis werten.
- **Inhalte:** CRI-Endpunkt, Sandbox, Create/Start, crictl vs. ctr; Kubernetes-Verantwortung vorerst als Schnittstellenkunde.
- **Mögliche Interaktion:** Nachrichtenfolge und zwei widersprüchlich wirkende Client-Befunde vergleichen.
- **Mögliche freiwillige Praxis:** Erreichbaren Socket mit fehlendem CRI-Dienst diagnostizieren; Transport-/Dienstfehler unterscheiden.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 25 Min. (7/6/8/4 E/I/P/R).
- **Optionale Deep Dives:** CRI-Protokoll und Sandbox-Grenzen; container-cri.
- **Wiederverwendung:** container-cri.

### K1.10 · Ein Neustart darf nicht unbemerkt Daten verlieren

- **Empfohlenes Vorwissen:** K1.09.
- **Lernziele:** Created/Running/Stopped und Readiness trennen; Exit-Ursachen aus mehreren Befunden ableiten.
- **Inhalte:** Runtime-Lifecycle, Restart-Verantwortung, Signale/Grace, beschreibbare Schicht; Shop startet zunächst ohne dauerhafte Bestellungen.
- **Mögliche Interaktion:** Zustandsfolge mit derselben bzw. neuer Instanz und Datenverlust vergleichen.
- **Mögliche freiwillige Praxis:** Exit 137 mit/ohne Speicherereignis beurteilen; begründen, warum ein neuer Container kein Backup ist.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** OOM-Korrelation, Pod- vs. Containeridentität; container-lifecycle.
- **Wiederverwendung:** container-lifecycle.

## 2. Dein erster Kubernetes-Cluster

### K2.01 · Wer hält KubeShop am Laufen?

- **Empfohlenes Vorwissen:** K1.10.
- **Lernziele:** Cluster, Node, Pod und Container unterscheiden; Soll/Ist und Koordination/Ausführung erklären.
- **Inhalte:** Minimalcluster, API-Objekte, spec/status, Namespace/Labels/UID, Control Plane und Worker.
- **Mögliche Interaktion:** Vorhandenes Architekturdiagramm; verantwortliche Komponenten auswählen.
- **Mögliche freiwillige Praxis:** Einem ausgefallenen Shop-Prozess die beteiligten Zuständigkeiten zuordnen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 25 Min. (7/6/8/4 E/I/P/R).
- **Optionale Deep Dives:** Discovery, Scope, OwnerReferences; cluster-basics.
- **Wiederverwendung:** cluster-basics.

### K2.02 · Eine reproduzierbare Umgebung für den Shop vorbereiten

- **Empfohlenes Vorwissen:** K2.01, K1.05.
- **Lernziele:** Lab-Profil auswählen; Node-, Pod- und Service-Netz unterscheiden; Voraussetzungen prüfen.
- **Inhalte:** Browserprofil, optional kind-Schnellprofil und kubeadm-VM-Profil; Ubuntu, Hostnamen, Zeit, Netzwerk, Swap, containerd/cgroups; Paketstände erst nach Lab-Abnahme.
- **Mögliche Interaktion:** Vorbereitungscheck mit widersprüchlichem Ressourcen-/Netzplan; kein echter VM-Start im Browser.
- **Mögliche freiwillige Praxis:** Überlappende CIDRs und falschen Runtime-Zustand erkennen; extern optional drei VMs vorbereiten und Befunde protokollieren.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** VM-Isolation, CRI-Konfiguration; Build-Schritte 1–4.
- **Wiederverwendung:** buildSteps, labs/kubeadm.

### K2.03 · Die Control Plane startet vor dem ersten Shop-Pod

- **Empfohlenes Vorwissen:** K2.02.
- **Lernziele:** kubeadm init, kubeconfig und Static Pods erklären; Admin-Zugang von Anwendung trennen.
- **Inhalte:** API Server, etcd, Scheduler, Controller Manager, kubelet; Zertifikatsvertrauen, lokales Manifest, Mirror Pod; keine echte HA voraussetzen.
- **Mögliche Interaktion:** Vorhandenes Control-Plane-Diagramm mit geordneter Bootstrap-Spur.
- **Mögliche freiwillige Praxis:** NotReady vor CNI richtig einordnen; Static-Pod- und Mirror-Pod-Befund auseinanderhalten.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Getrennte Leader-Wahlen und HA-Topologien; control-plane.
- **Wiederverwendung:** control-plane, buildSteps.

### K2.04 · Worker und Pod-Netz für KubeShop verbinden

- **Empfohlenes Vorwissen:** K2.03.
- **Lernziele:** Node Join und CNI als getrennte Voraussetzungen prüfen; kubelet-Rückmeldung lesen.
- **Inhalte:** Join-Token/CA-Vertrauen, Registrierung, Node Ready, Cilium als vorbereitete CNI-Installation, CoreDNS-Start; Helm-Bedienung zunächst erklärt vorgeben.
- **Mögliche Interaktion:** Node-/CNI-Befunde vor und nach Verbindung vergleichen.
- **Mögliche freiwillige Praxis:** Einen registrierten, aber nicht bereiten Worker eingrenzen und passende Prüfgrenze wählen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** CNI-Paketweg in K4.03; Bootstrap-Vertrauen/Zertifikate.
- **Wiederverwendung:** buildSteps, cilium.

### K2.05 · Warum ein angenommenes Shop-Manifest noch nichts ausführt

- **Empfohlenes Vorwissen:** K2.03.
- **Lernziele:** Authentifizierung, Autorisierung und Admission trennen; Speicherung und Quorum erklären.
- **Inhalte:** API-Schreibpfad, Sollzustand in etcd, Mehrheitsquorum, anschließende Beobachtung; keine Gleichsetzung von API-Erfolg und Ready.
- **Mögliche Interaktion:** Bestehende api- und quorum-Modelle in zwei getrennten Lernschritten.
- **Mögliche freiwillige Praxis:** Ablehnung und Quorumverlust unterscheiden; erklären, ob Sollzustand verändert wurde.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Raft/MVCC/Watch aus etcd; SSA/Webhooks aus api-lifecycle.
- **Wiederverwendung:** api-lifecycle, etcd.

### K2.06 · Den ersten Clusterfehler eingrenzen

- **Empfohlenes Vorwissen:** K2.04, K2.05.
- **Lernziele:** Koordinations- von Ausführungsfehlern unterscheiden; Beobachtung gegen Hypothese prüfen.
- **Inhalte:** API-Erreichbarkeit, Node-Status, Runtime/CNI-Befunde; keine garantierten Wiederherstellungszeiten.
- **Mögliche Interaktion:** Vorhandenes failure-Modell und unabhängige Befundauswahl, ohne nächste-Aktion-Anzeige.
- **Mögliche freiwillige Praxis:** Fehlerfall mit weiterlaufendem Shop-Prozess diagnostizieren; erklären, was weiterhin möglich ist.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Node-Partition, Quorum-Recovery und Fencing in K8.03.
- **Wiederverwendung:** component-failures.

## 3. Die erste Anwendung

### K3.01 · Den ersten KubeShop-Pod beschreiben

- **Empfohlenes Vorwissen:** K2.06.
- **Lernziele:** Ein Pod-Manifest lesen und ändern; Labels/Namespace und Containerkonfiguration unterscheiden.
- **Inhalte:** YAML, apiVersion/kind/metadata/spec, Image/Port, kubectl apply/get/describe; vorbereiteter Shop-Katalog ohne Datenbank, Zugriff zunächst per externem Port-Forward.
- **Mögliche Interaktion:** Vorhandenen Editor und Graph auf einen Pod begrenzen; simulierte Ausgabe klar markieren.
- **Mögliche freiwillige Praxis:** Image-/Label-Fehler im Manifest korrigieren; angewendetes Objekt und Entwurf unterscheiden.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Init-Container, Sidecars und Pod-Lifecycle; cluster-basics.
- **Wiederverwendung:** Neu; bestehender Pod-Editor/Validator.

### K3.02 · Ein einzelner Pod reicht für den Shop nicht

- **Empfohlenes Vorwissen:** K3.01.
- **Lernziele:** Deployment, ReplicaSet und Pod zuordnen; deklarative Replikazahl herstellen.
- **Inhalte:** Reconciliation, Eigentümerschaft, gewünschte Replikate, Ersatz; kein eigenständiges Replikaset-YAML als Pflicht.
- **Mögliche Interaktion:** Bestehende Reconciliation plus Operations-Fälle selector/replicas eingebettet.
- **Mögliche freiwillige Praxis:** Defekten Selektor reparieren und genau drei Shop-Instanzen im Modell herstellen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Informer, Cache, Queue, idempotente Retries aus controllers.
- **Wiederverwendung:** controllers, Operations selector/replicas.

### K3.03 · Konfiguration ohne neues Shop-Image ändern

- **Empfohlenes Vorwissen:** K3.02.
- **Lernziele:** ConfigMap und Secret passend einsetzen; Konfigurationsänderung vom Rollout unterscheiden.
- **Inhalte:** Umgebung/Dateimount, sensible Werte, Platzhalter statt echter Zugangsdaten, ServiceAccount-Grundidee und unnötige Token vermeiden.
- **Mögliche Interaktion:** Manifest-Diff und verfasste Start-/Reload-Befunde; vorhandener Simulator unterstützt diese Arten noch nicht.
- **Mögliche freiwillige Praxis:** Falschen Konfigurationsschlüssel finden; geeignete Übergabe wählen und erforderlichen Neustart begründen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Secret-Verteilung in K7.07, Zugriffsrechte in K8.01.
- **Wiederverwendung:** Neu.

### K3.04 · Running ist noch kein benutzbarer Shop

- **Empfohlenes Vorwissen:** K3.03.
- **Lernziele:** Startup-, Readiness- und Liveness-Probe unterscheiden; sichere Beendigung planen.
- **Inhalte:** Startverzögerung, fehlerhafte Abhängigkeit, Health-Endpunkte, preStop/Grace, Restart vs. Verkehrsbereitschaft.
- **Mögliche Interaktion:** Vorhandenes runtime-Modell; zusätzliche Befundfolge zu Probes.
- **Mögliche freiwillige Praxis:** Probe wählen, die unbereiten Shop aus Verkehr nimmt, ohne Neustartschleife bei DB-Störung auszulösen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** PLEG/CRI und Termination aus kubelet-runtime.
- **Wiederverwendung:** kubelet-runtime, container-lifecycle.

### K3.05 · Für den Shop fehlt trotz freier CPU ein Platz

- **Empfohlenes Vorwissen:** K3.04, K1.04.
- **Lernziele:** Requests/Limits und QoS unterscheiden; harte Constraints vor Präferenzen prüfen.
- **Inhalte:** Allocatable, Requests, CPU/Memory-Limits, QoS/Eviction, nodeSelector/Affinity, Taints/Tolerations, Topology Spread.
- **Mögliche Interaktion:** Bestehender Scheduler; Kapazität und Taint variieren, Vertiefungsmodell separat.
- **Mögliche freiwillige Praxis:** Pending-Fall korrigieren, ohne Anforderungen blind zu senken; zulässigen Node und Kapazitätsreserve begründen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Scheduler-Framework mit Unreserve; PV-Topologie später K5.02.
- **Wiederverwendung:** scheduling, linux-cgroups.

### K3.06 · Ein Shop-Update soll verfügbar bleiben

- **Empfohlenes Vorwissen:** K3.02, K3.04, K3.05.
- **Lernziele:** Rollout-Fortschritt aus mehreren Statusfeldern lesen; Korrektur/Rollback begründen.
- **Inhalte:** Deployment-Revision, neues ReplicaSet, maxSurge/maxUnavailable, generation/observedGeneration, Conditions/Events; kein automatisches Rollback versprechen.
- **Mögliche Interaktion:** Vorhandene flow-Spur plus verfasste Rollout-Befunde.
- **Mögliche freiwillige Praxis:** Fehlerhaftes Shop-Release an der ersten blockierten Phase finden und Wiederherstellung prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Asynchrone Beobachtung, Event-Grenzen; apply-to-pod.
- **Wiederverwendung:** apply-to-pod.

### K3.07 · Katalogimporte sollen einmalig oder regelmäßig laufen

- **Empfohlenes Vorwissen:** K3.03, K3.06.
- **Lernziele:** Job/CronJob vom dauerhaften Deployment unterscheiden; Wiederholung sicher behandeln.
- **Inhalte:** Abschluss/Fehler, Wiederholungsgrenzen, Zeitplan/Zeitzone, Parallelität, idempotenter Import; zunächst statische Beispieldaten.
- **Mögliche Interaktion:** Zeitachse mit doppeltem Start und fehlgeschlagenem Import vergleichen.
- **Mögliche freiwillige Praxis:** Passenden Workload wählen und doppelten Import durch Aufgabenvertrag beherrschbar machen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** CronJob-Concurrency, Backoff, spätere DB-Migrationen.
- **Wiederverwendung:** Neu.

## 4. Anwendungen verbinden

### K4.01 · Der Shop braucht stabile interne Adressen

- **Empfohlenes Vorwissen:** K3.06.
- **Lernziele:** Service/Selektor/EndpointSlice erklären; port und targetPort unterscheiden.
- **Inhalte:** Frontend und API als zwei Deployments; ClusterIP, Labels, Readiness und Endpunkte; statische API-Daten.
- **Mögliche Interaktion:** Bestehender Graph, Editor und Operations-service-Szenario; Portfehler zusätzlich als Befundaufgabe.
- **Mögliche freiwillige Praxis:** Frontend-Service-Verbindung reparieren und benennen, was das Modell über echte HTTP-Erreichbarkeit nicht beweist.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Headless Service und direkte Endpunkte in K5.03.
- **Wiederverwendung:** networking, Operations service.

### K4.02 · Die API soll über einen Namen erreichbar sein

- **Empfohlenes Vorwissen:** K4.01, K1.06.
- **Lernziele:** Service-DNS vom Transport trennen; namespacebezogene Namen auflösen.
- **Inhalte:** CoreDNS, Suchpfade/FQDN, Pod-Resolver, DNS-Zugriff und Port; Browser-URL und serverinterne URL unterscheiden.
- **Mögliche Interaktion:** DNS-/IP-/HTTP-Befunde unabhängig öffnen und vergleichen.
- **Mögliche freiwillige Praxis:** IP funktioniert, Name nicht: Resolverproblem finden statt Service-Replikate zu erhöhen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** CoreDNS-Weiterleitung, Cache und negative Antworten.
- **Wiederverwendung:** networking, linux-networking.

### K4.03 · Shop-Pods auf verschiedenen Nodes verbinden

- **Empfohlenes Vorwissen:** K4.02.
- **Lernziele:** CNI-Verantwortung erklären; Paketweg und Routinggrenzen verfolgen.
- **Inhalte:** Cilium, Pod-IP, Node-Netz, Encapsulation/Native Routing als Profile, kube-proxy/Service-Datenpfad als gewählte Variante, eBPF-Grundidee.
- **Mögliche Interaktion:** Geplanter Packet Explorer mit verfassten Paketstationen; keine vorgetäuschte Paketmessung.
- **Mögliche freiwillige Praxis:** Fehlende Pod-Verbindung anhand Route/CNI-Befunden lokalisieren.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** eBPF-Verarbeitung, MTU und Rückweg; cilium.
- **Wiederverwendung:** cilium.

### K4.04 · Nur erlaubte Dienste dürfen die Shop-API erreichen

- **Empfohlenes Vorwissen:** K4.03.
- **Lernziele:** Default-Deny und gezielte Freigaben erklären; DNS-Egress berücksichtigen.
- **Inhalte:** NetworkPolicy, Namespace-/Pod-Selektoren, ingress/egress, erlaubte Verbindungen, Cilium/Hubble-Beobachtung.
- **Mögliche Interaktion:** Verbindungsmatrix plus vorgegebene Hubble-Befunde; externe Cilium-Übung wiederverwenden.
- **Mögliche freiwillige Praxis:** Frontend→API und DNS erlauben, fremden Client sperren; positive und negative Tests planen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Cilium-spezifische Policy/L7 bewusst vom Standard abgrenzen.
- **Wiederverwendung:** cilium.

### K4.05 · KubeShop soll im lokalen Netz erreichbar werden

- **Empfohlenes Vorwissen:** K4.01, K4.04.
- **Lernziele:** ClusterIP/NodePort/LoadBalancer unterscheiden; IP-Vergabe von Erreichbarkeit trennen.
- **Inhalte:** MetalLB, lokaler Adresspool, Layer-2-Ankündigung als Lab-Profil; keine öffentliche Cloud-IP voraussetzen.
- **Mögliche Interaktion:** Adressplan und Verbindungskette vom Laptop bis zum Service.
- **Mögliche freiwillige Praxis:** Konfliktfreien Pool wählen und nicht erreichbare zugewiesene IP diagnostizieren.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** BGP als optionaler Vergleich, source-IP-Verhalten.
- **Wiederverwendung:** Neu.

### K4.06 · Frontend und API unter einer Shop-Adresse routen

- **Empfohlenes Vorwissen:** K4.05.
- **Lernziele:** Gateway/HTTPRoute und Controller unterscheiden; Ingress einordnen.
- **Inhalte:** GatewayClass, Listener, Host/Pfad, Backend-Referenzen, Status/Conditions; explizit ausgewählter kompatibler Controller; keine automatische Installation durch API-Objekte.
- **Mögliche Interaktion:** Geplanter Routing-Explorer mit Request und Route-Matching.
- **Mögliche freiwillige Praxis:** Falschen Host/Pfad oder Backend-Port korrigieren und erlaubte/nicht erlaubte Anfrage prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Ingress-Migration, ReferenceGrant und Route-Bindung.
- **Wiederverwendung:** Neu.

### K4.07 · Der Shop braucht nachvollziehbares TLS-Vertrauen

- **Empfohlenes Vorwissen:** K4.06.
- **Lernziele:** Zertifikat, Schlüssel, Issuer und Vertrauen trennen; Erneuerungsfehler erkennen.
- **Inhalte:** cert-manager, Certificate/Issuer, TLS-Secret und Listener; lokale Test-CA statt gekaufter Domain; Operator als betreuender Controller kurz erklären.
- **Mögliche Interaktion:** Zertifikatskette und Renewal-Befunde, keine echten Schlüssel im Browser.
- **Mögliche freiwillige Praxis:** Falschen Hostnamen oder fehlende Vertrauenskette diagnostizieren; HTTPS-Test und Ablauf prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** ACME/DNS-Challenge als optionale Theorie; Operator-Muster K7.03.
- **Wiederverwendung:** Neu.

## 5. Daten dauerhaft speichern

### K5.01 · Ein ersetzter Shop-Pod verliert Bestellungen

- **Empfohlenes Vorwissen:** K4.07, K1.10.
- **Lernziele:** Container-Schicht, emptyDir und dauerhaftes Volume unterscheiden.
- **Inhalte:** Erste echte Bestelldaten als Lernmodell, Lebensdauer von Container/Pod/Volume, Mount-Pfade; App-Code für Persistenz bleibt vorbereitet.
- **Mögliche Interaktion:** Geplanter Storage Explorer: Containerneustart vs. Pod-Ersatz mit Testbestellung.
- **Mögliche freiwillige Praxis:** Für drei Ausfälle Datenbestand vorhersagen und geeigneten Speicherbedarf begründen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Ephemerer Speicher, Quotas und I/O.
- **Wiederverwendung:** Neu.

### K5.02 · Speicher bestellen, ohne die Disk selbst zu verwalten

- **Empfohlenes Vorwissen:** K5.01, K3.05.
- **Lernziele:** PV/PVC/StorageClass/CSI zuordnen; Binding und Scheduling gemeinsam diagnostizieren.
- **Inhalte:** Provisionierung, Access Modes, Reclaim Policy, Binding Mode, Topologie, Attach/Mount; Beispieltreiber vorgegeben.
- **Mögliche Interaktion:** PVC-Zustandsfolge und Scheduler/PV-Zonenbefunde vergleichen.
- **Mögliche freiwillige Praxis:** Pending-PVC anhand Klasse/Topologie reparieren; Datenfolgen beim Löschen benennen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** CSI Controller/Node-Grenze; scheduling-PV-Deep-Dive.
- **Wiederverwendung:** Neu; scheduling-Transfer.

### K5.03 · PostgreSQL bekommt eine dauerhafte Identität

- **Empfohlenes Vorwissen:** K5.02, K4.02.
- **Lernziele:** StatefulSet und Deployment unterscheiden; persistente DB von HA trennen.
- **Inhalte:** Ein PostgreSQL-Pod, PVC, Headless/Client-Service, stabile Identität, Konfiguration; Shop-API speichert Testbestellungen.
- **Mögliche Interaktion:** Pod-/PVC-Zuordnung und Wiederanlauf-Befunde, initial eine DB-Instanz.
- **Mögliche freiwillige Praxis:** Testbestellung schreiben, Pod ersetzen und Erhalt anhand bereitgestellter Befunde prüfen; externe Variante später validieren.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** StatefulSet-Ordnung, Migrationen und Datenbankkonsistenz.
- **Wiederverwendung:** Neu.

### K5.04 · Eine Node-Disk soll kein unbemerkter Einzelpunkt bleiben

- **Empfohlenes Vorwissen:** K5.03.
- **Lernziele:** Verteilten Storage von DB-Replikation unterscheiden; Degraded-Zustand erklären.
- **Inhalte:** Longhorn als CSI-Implementierung, Datenreplikate, Platzbedarf, Fehlerdomänen und Wiederaufbau; Ressourcenprofil getrennt.
- **Mögliche Interaktion:** Verfasste Replica-/Node-Ausfallspur im Storage Explorer.
- **Mögliche freiwillige Praxis:** Zu wenige verfügbare Replikate erkennen und Wiederherstellung ohne falsche Backup-Zusage planen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Attach/Detach, Fencing, rebuild und Performance.
- **Wiederverwendung:** Neu.

### K5.05 · Eine gelöschte Bestellung braucht ein echtes Restore

- **Empfohlenes Vorwissen:** K5.03, K5.04.
- **Lernziele:** Persistenz, Replikation und Backup unterscheiden; RPO/RTO am Fall erklären.
- **Inhalte:** Vorbereiteter PostgreSQL-Backup-/Restore-Ablauf, unabhängiges Ziel, Testdatenprüfung; Restore in getrennte Zielumgebung.
- **Mögliche Interaktion:** Zeitlinie Backup → Änderung → Fehler → Restore mit Bestell-IDs.
- **Mögliche freiwillige Praxis:** Passenden Wiederherstellungspunkt wählen und fehlende/erhaltene Bestellungen prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** WAL/PITR und operatorgestützte Sicherung K7.04; Velero K8.05.
- **Wiederverwendung:** Neu.

## 6. Kubernetes überwachen und betreiben

### K6.01 · Der Shop meldet Fehler: zuerst Beobachtungen sammeln

- **Empfohlenes Vorwissen:** K5.05, K3.06.
- **Lernziele:** Events, Conditions, Logs und Anwendungsantwort korrelieren; Hypothesen widerlegen.
- **Inhalte:** kubectl get/describe/logs als externe Werkzeuge, CrashLoopBackOff/ImagePull/Pending, Zeitfenster/UID; Grenzen des Browserterminals.
- **Mögliche Interaktion:** Vorhandene Diagnosen plus neue anonymisierte Befundkarten.
- **Mögliche freiwillige Praxis:** Incident mit zwei unabhängigen Signalen eingrenzen und gezielte Korrektur begründen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Event-Aufbewahrung und Status aus apply-to-pod/component-failures.
- **Wiederverwendung:** Bestehende Diagnosen, neue Shop-Fälle.

### K6.02 · Shop-Logs müssen einen Pod-Ersatz überleben

- **Empfohlenes Vorwissen:** K6.01.
- **Lernziele:** DaemonSet-Aufgabe erklären; Logquelle, Sammler, Speicher und Abfrage unterscheiden.
- **Inhalte:** Grafana Alloy als Node-Collector, Loki, Labels, Zeitfenster, strukturierte Logs, Geheimnisse ausschließen.
- **Mögliche Interaktion:** Logweg und verlorene/auffindbare Logeinträge vergleichen.
- **Mögliche freiwillige Praxis:** Fehlerhaften Collector-Selektor oder Zeitfilter reparieren und Bestellung über Request-ID verfolgen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Label-Kardinalität, Retention und alternative Collector-Topologien.
- **Wiederverwendung:** Neu.

### K6.03 · Wir brauchen Messwerte zur Shop-Gesundheit

- **Empfohlenes Vorwissen:** K6.02, K4.01.
- **Lernziele:** Counter/Gauge und Abfragerate unterscheiden; Scrape-Ziel von Anwendungsgesundheit trennen.
- **Inhalte:** Prometheus Operator, vorgegebener ServiceMonitor, Prometheus, /metrics, Grafana-Dashboard, Fehlerrate/Latenz.
- **Mögliche Interaktion:** Geplante Metrik-Zeitreihen und Scrape-Konfiguration vergleichen; Operator zunächst als vorbereitetes Werkzeug.
- **Mögliche freiwillige Praxis:** Fehlendes Scrape-Ziel korrigieren und ein passendes Signal für langsame Bestellungen auswählen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** PromQL, Histogramme, Kardinalität; CRD-Vertrag K7.03.
- **Wiederverwendung:** Neu.

### K6.04 · Alarmieren, wenn Bestellungen betroffen sind

- **Empfohlenes Vorwissen:** K6.03.
- **Lernziele:** SLI/SLO und Alert von Ursache unterscheiden; Alarmrauschen reduzieren.
- **Inhalte:** Verfügbarkeit/Latenz, Fenster, PrometheusRule, Alertmanager Routing/Gruppierung/Silence; lokale Benachrichtigungsansicht.
- **Mögliche Interaktion:** Zeitreihe mit Alarmzuständen, keine echte Nachricht an Dritte.
- **Mögliche freiwillige Praxis:** Zu empfindlichen Alarm verbessern und bei Störung passenden Runbook-Schritt begründen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Error Budget und Burn Rate.
- **Wiederverwendung:** Neu.

### K6.05 · Mehr Besucher brauchen mehr Shop-Instanzen

- **Empfohlenes Vorwissen:** K6.03, K3.05.
- **Lernziele:** HPA und Node-Kapazität trennen; Metrikquelle und Requests berücksichtigen.
- **Inhalte:** Metrics Server, resource-basierter HPA, Zielauslastung, Grenzen, Stabilisierung; zunächst stateless Frontend/API.
- **Mögliche Interaktion:** Geplanter Skalierungsverlauf mit Last, Metrik und Pending-Pods.
- **Mögliche freiwillige Praxis:** HPA-Konfiguration mit fehlenden Requests korrigieren und Kapazitätsgrenze nachweisen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Custom/External Metrics, KEDA in K8.04.
- **Wiederverwendung:** Neu; scheduling-Kapazitätsmodell.

### K6.06 · Den Shop während Node-Wartung betreiben

- **Empfohlenes Vorwissen:** K6.05, K2.06.
- **Lernziele:** Cordon/Drain/PDB unterscheiden; Upgrade- und Zertifikatsschritte begründen.
- **Inhalte:** Wartungsbudget, Eviction, DaemonSets/Volumes, kubeadm-Upgrade und Versionsabgleich, Zertifikatsprüfung; Kompatibilität vor Ausführung prüfen.
- **Mögliche Interaktion:** Wartungsplan mit verfügbaren Replikaten und blockiertem Drain.
- **Mögliche freiwillige Praxis:** Reihenfolge für einen Worker-Upgrade erstellen und PDB-/Kapazitätskonflikt lösen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Version Skew, Control-Plane-Upgrade, Zertifikatsrotation.
- **Wiederverwendung:** Neu; Build Lab und component-failures als Basis.

### K6.07 · Den ausgefallenen Checkout systematisch reparieren

- **Empfohlenes Vorwissen:** K6.04, K6.06.
- **Lernziele:** DNS-, Policy-, Runtime- und Storage-Ursachen unterscheiden; Reparatur durch Nutzersicht bestätigen.
- **Inhalte:** Mehrdeutiger Incident mit falscher Service-Zuordnung oder nicht bereiter DB; kontrollierter Reset und Nachher-Prüfung.
- **Mögliche Interaktion:** Unabhängige Befundauswahl; alternative Prüfwege, keine vorgegebene Aktionsliste.
- **Mögliche freiwillige Praxis:** Ursache und Gegenbeleg dokumentieren, minimale Änderung wählen, Testbestellung erfolgreich nachweisen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 45 Min. (10/10/20/5 E/I/P/R).
- **Optionale Deep Dives:** Zeitliche Korrelation und mehrere gleichzeitige Fehler.
- **Wiederverwendung:** Operations service/replicas, component-failures; erweitern.

## 7. Automatisierung und Operatoren

### K7.01 · KubeShop reproduzierbar paketieren

- **Empfohlenes Vorwissen:** K6.07.
- **Lernziele:** Helm-Templates, Values und gerenderte Ressourcen unterscheiden; Release-Änderungen prüfen.
- **Inhalte:** Chart-Struktur, Rendern, Abhängigkeiten, Versionsbindung, Upgrade/Rollback-Grenzen bei Daten; vorbereitete Controller-Installationen aus K4/K6 auflösen.
- **Mögliche Interaktion:** Values ändern und Ressourcen-Diff prüfen; kein Helm im heutigen Browserterminal.
- **Mögliche freiwillige Praxis:** Falschen Value reparieren und vollständige resultierende Service-/Deployment-Konfiguration beurteilen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Hooks und Chart-Tests; Datenmigrationen nicht durch Rollback rückgängig garantieren.
- **Wiederverwendung:** Neu.

### K7.02 · Test und Produktion sollen kontrolliert abweichen

- **Empfohlenes Vorwissen:** K7.01.
- **Lernziele:** Kustomize-Basis/Overlay von Template-Rendering unterscheiden; Drift begrenzen.
- **Inhalte:** Ressourcen, Patches, Image-/Konfigurationsvarianten; pro Ressource eine klare Render-/Besitzkette.
- **Mögliche Interaktion:** Zwei Overlays gegen dieselbe Basis vergleichen.
- **Mögliche freiwillige Praxis:** Staging-Replikazahl ändern, ohne Produktionsroute oder Secret-Werte zu überschreiben.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 30 Min. (8/7/10/5 E/I/P/R).
- **Optionale Deep Dives:** Generatoren, Hashes und verantwortete Helm/Kustomize-Kombination.
- **Wiederverwendung:** Neu.

### K7.03 · Kubernetes um einen Shop-Betriebsvertrag erweitern

- **Empfohlenes Vorwissen:** K7.02, K2.05.
- **Lernziele:** CRD, Custom Resource und Controller unterscheiden; Reconciliation/Status/Finalizer begründen.
- **Inhalte:** API-Schema, Conditions, beobachtete Generation, OwnerReferences, idempotente Wiederholung, Rechte; vorhandene cert-manager/Prometheus-Ressourcen einordnen.
- **Mögliche Interaktion:** Bestehendes Reconciliation-Modell auf CR und abhängige Ressourcen übertragen.
- **Mögliche freiwillige Praxis:** Fehlenden Controller von ungültiger CR unterscheiden; Retry ohne doppelte Nebenwirkung entwerfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Informer/Workqueue aus controllers, Conversion/SSA aus api-lifecycle.
- **Wiederverwendung:** controllers, api-lifecycle; CRD-Material neu.

### K7.04 · PostgreSQL-Betrieb braucht einen zuständigen Operator

- **Empfohlenes Vorwissen:** K7.03, K5.05.
- **Lernziele:** Zalando Postgres Operator und DB-Laufzeit trennen; Replikation/Failover/Backup prüfen.
- **Inhalte:** postgresql-CR, betreute Instanzen, Primary/Replica, Patroni-Verantwortung, Services/PVCs; kontrollierter Datenumzug vom Einzel-DB-Lab.
- **Mögliche Interaktion:** Operator-/DB-Zustände und geplante Umschaltung mit Bestellbestand vergleichen.
- **Mögliche freiwillige Praxis:** Fehlgeschlagenen Failover anhand Befunden diagnostizieren; Integrität nach Umschaltung/Restore prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 45 Min. (10/10/20/5 E/I/P/R).
- **Optionale Deep Dives:** Fencing, WAL/PITR, Rollout/Upgrade-Vertrag des Operators.
- **Wiederverwendung:** Neu.

### K7.05 · Git soll die gewünschte Shop-Version festhalten

- **Empfohlenes Vorwissen:** K7.01, K7.02, K7.03.
- **Lernziele:** Argo-CD-Sync und Health unterscheiden; Git-Revert von Datenrollback abgrenzen.
- **Inhalte:** Repository-Zielzustand, Application, Rendern, Diff, Sync, Drift, Prune, Self-Heal, Feldverantwortung.
- **Mögliche Interaktion:** Git/API-Diff und Statusspur; vorgegebene Repository-Snapshots im Browser.
- **Mögliche freiwillige Praxis:** Manuellen Drift erkennen und bewusst durch Git-Änderung beheben; Prune-Auswirkung prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** SSA-Konflikte aus api-lifecycle, Sync Waves/Hooks.
- **Wiederverwendung:** Neu; api-lifecycle-Transfer.

### K7.06 · Mehrere Shop-Umgebungen konsistent ausrollen

- **Empfohlenes Vorwissen:** K7.05.
- **Lernziele:** ApplicationSet von Application unterscheiden; Blast Radius und Zielauswahl begrenzen.
- **Inhalte:** Generator, Template, Cluster-/Umgebungsparameter, Promotion, gestaffelter Rollout; zwei logische Umgebungen genügen.
- **Mögliche Interaktion:** Generierte Applications und Änderungen an Zielauswahl vergleichen.
- **Mögliche freiwillige Praxis:** Fehlenden Staging-Filter korrigieren und nachweisen, dass Produktion unverändert bleibt.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Multi-Cluster, ApplicationSet-Löschverhalten und Rollback.
- **Wiederverwendung:** Neu.

### K7.07 · Shop-Zugangsdaten sollen getrennt von Git wechseln

- **Empfohlenes Vorwissen:** K7.03, K7.05, K3.03.
- **Lernziele:** External Secrets Operator als Synchronisierung erklären; Quelle, Secret und Verbraucher trennen.
- **Inhalte:** SecretStore/ExternalSecret, Refresh, Rechte/Status, Verbraucher-Rotation; lokaler Testprovider oder Modellbefunde, kein Cloud-Konto.
- **Mögliche Interaktion:** Quelle/Secret/Pod-Version gegenüberstellen; ausschließlich Dummydaten.
- **Mögliche freiwillige Praxis:** Veraltetes DB-Passwort entlang der Kette diagnostizieren und sicheren Wiederanlauf planen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 35 Min. (9/8/13/5 E/I/P/R).
- **Optionale Deep Dives:** Backend-Vertrauen, kurze Tokens und RBAC in K8.01.
- **Wiederverwendung:** Neu.

## 8. Enterprise Kubernetes

### K8.01 · Mehrere Teams teilen die Shop-Plattform

- **Empfohlenes Vorwissen:** K7.07, K3.05.
- **Lernziele:** API-Rechte, Pod-Sicherheit, Netzwerk und Ressourcenbudgets getrennt begrenzen.
- **Inhalte:** ServiceAccounts, Role/ClusterRole, Bindings, Namespaces, ResourceQuota/LimitRange, SecurityContext, Pod Security Admission; Isolation nicht durch Namespace allein.
- **Mögliche Interaktion:** Berechtigungsmatrix und Admission-Befunde; vorhandenen API-Simulator wiederverwenden.
- **Mögliche freiwillige Praxis:** Zu breite Shop-ServiceAccount-Rechte einschränken; erlaubte und verbotene Aktionen sowie Pod-Sicherheitsanforderung prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Token-Projektion, RBAC-Eskalationswege, Least Privilege.
- **Wiederverwendung:** api-lifecycle/cluster-basics; Fachmaterial neu.

### K8.02 · Unsichere Shop-Releases vor dem Start abweisen

- **Empfohlenes Vorwissen:** K8.01, K7.03.
- **Lernziele:** Kyverno-Policy und RBAC unterscheiden; Audit/Enforce sowie Ausfallwirkung erklären.
- **Inhalte:** Admission, validierende/mutierende Regeln, Image-/SecurityContext-Vorgaben, PolicyReport, Ausnahme-Lebensdauer; enger Geltungsbereich.
- **Mögliche Interaktion:** Vorhandener API-Pfad plus erlaubte/abgewiesene Manifestvarianten.
- **Mögliche freiwillige Praxis:** Gezielte Policy für Shop-Workloads entwerfen und Fehlalarm sowie gefährliche Ausnahme prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Webhook failurePolicy/Timeouts aus api-lifecycle; Policy-Tests.
- **Wiederverwendung:** Neu; API-Modell wiederverwenden.

### K8.03 · Ein Control-Plane-Ausfall darf nicht alles stoppen

- **Empfohlenes Vorwissen:** K8.02, K6.06, K5.05.
- **Lernziele:** API-HA, etcd-Quorum und Workload-Verfügbarkeit trennen; Wiederherstellung begrenzen.
- **Inhalte:** API-Load-Balancer, mehrere Control-Plane-Nodes, Stacked/externes etcd, Leases, Fehlerdomänen, Topology Spread, PDB, Kapazitätsreserve; Node-Skalierung als getrennte Infrastrukturentscheidung.
- **Mögliche Interaktion:** Bestehende Quorum-/Failure-Modelle; Raft-Internals optional, neue HA-Befundtopologie.
- **Mögliche freiwillige Praxis:** Partition von permanentem Mehrheitsverlust unterscheiden; zulässigen Wiederherstellungspfad und verlorene Zeitspanne benennen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 45 Min. (10/10/20/5 E/I/P/R).
- **Optionale Deep Dives:** Raft/MVCC/Watch und etcd-Restore aus etcd/component-failures/control-plane.
- **Wiederverwendung:** etcd, control-plane, component-failures.

### K8.04 · Der Versand-Worker soll nach offener Arbeit skalieren

- **Empfohlenes Vorwissen:** K8.03, K6.05, K7.04.
- **Lernziele:** KEDA-Ereignisskalierung von CPU-HPA unterscheiden; Metrik/Worker/DB-Kapazität gemeinsam betrachten.
- **Inhalte:** Vorbereiteter idempotenter Worker, offene Bestelljobs in PostgreSQL, Prometheus-Rückstandsmetrik, ScaledObject, Aktivierung/Abkühlung, Grenzen; kein zusätzlicher Broker nötig.
- **Mögliche Interaktion:** Rückstand und Workerzahl in verfassten Zeitreihen, Ausfall der Metrikquelle.
- **Mögliche freiwillige Praxis:** Passenden Trigger wählen und doppelten HPA-Besitz am Worker vermeiden; Verarbeitung/Restbestand prüfen.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** Scale-to-zero, Retries, Fehlerbehandlung und externe Metriken.
- **Wiederverwendung:** Neu.

### K8.05 · KubeShop nach Verlust der Umgebung wiederherstellen

- **Empfohlenes Vorwissen:** K8.04, K5.05, K7.05.
- **Lernziele:** Git-, etcd-, Ressourcen-, Volume- und DB-Sicherung unterscheiden; Restore als Test nachweisen.
- **Inhalte:** Velero, Kubernetes-Objekte, unterstützte Volume-Sicherung, lokales Backup-Ziel; DB-konsistente Sicherung separat, Restore-Reihenfolge und RPO/RTO.
- **Mögliche Interaktion:** Backup-Abdeckungsmatrix und Wiederherstellungsbefunde mit fehlenden Komponenten.
- **Mögliche freiwillige Praxis:** Aus vorgegebenen Sicherungen eine neue Shop-Umgebung herstellen und bekannte Bestellung prüfen; keine Pauschalzusage für Snapshots.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 45 Min. (10/10/20/5 E/I/P/R).
- **Optionale Deep Dives:** CSI-Snapshots vs. Dateisicherung, getrennte Fehlerdomänen, etcd-Restore.
- **Wiederverwendung:** Neu; component-failures-Recovery wiederverwenden.

### K8.06 · Die Shop-Lab-Infrastruktur reproduzierbar aufbauen

- **Empfohlenes Vorwissen:** K8.05, K2.02.
- **Lernziele:** Infrastrukturzustand von Node-Konfiguration unterscheiden; Plan und Idempotenz beurteilen.
- **Inhalte:** OpenTofu als lokaler Lehrpfad, Terraform-Begriffsvergleich, Ansible-Inventar/Rollen, VM-Provisionierung, Zustandsdatei, Versionsbindung; kein lokaler KubeLab-Agent.
- **Mögliche Interaktion:** Plan/Diff und wiederholten Konfigurationslauf anhand vorbereiteter Befunde vergleichen.
- **Mögliche freiwillige Praxis:** Falschen VM-/Netzparameter korrigieren und beweisen, dass erneuter Lauf keine zusätzlichen Nodes erzeugt.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 40 Min. (10/10/15/5 E/I/P/R).
- **Optionale Deep Dives:** State/Locking, Secrets im State, Drift und Recovery.
- **Wiederverwendung:** Neu.

### K8.07 · KubeShop als zusammenhängendes System betreiben

- **Empfohlenes Vorwissen:** K8.06, K7.06, K6.07.
- **Lernziele:** Architekturentscheidungen begründen; einen unbekannten Incident eingrenzen und Wiederherstellung nachweisen.
- **Inhalte:** Release, Last, Netzwerk, Daten, Policy, GitOps und Restore in zwei getrennten Incident-Varianten; Verantwortlichkeiten und Restgrenzen dokumentieren.
- **Mögliche Interaktion:** Kapitelübergreifende unabhängige Challenge mit verzweigten Befunden, mehreren zulässigen Diagnosewegen.
- **Mögliche freiwillige Praxis:** Service-Ausfall oder verlorene Daten beheben; Testbestellung, negative Sicherheitsprüfung und RPO/RTO-Auswertung liefern.
- **Frühere Aktivitätsschätzung (nicht verbindlich):** 60 Min. (10/15/30/5 E/I/P/R).
- **Optionale Deep Dives:** Offener Architekturvergleich und alternative Lösungen; sämtliche bestehenden Internals optional.
- **Wiederverwendung:** Neu; bestehende Diagnosen/Modelle kombinieren.

