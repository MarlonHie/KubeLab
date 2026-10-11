# KubeLab 0.3.0: Lernstufen und Fundamentals

Stand 2026-10-11. Ausgangspunkt 0.2.2 (`ded8945`). Modul 03 bleibt die fachliche Referenz. Diese Überarbeitung ergänzt eigenständige Diagnose, behebt die widersprüchliche Abschlusslogik und baut bestehende Module 01/02 aus. Workloads werden noch nicht als verfügbar angekündigt.

## Abschlussvertrag

| Stufe                    | Bedingung                                                          | Wirkung von optionalen Inhalten             |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------- |
| Grundlagen abgeschlossen | Wissenscheck der Lektion bestanden                                 | Keine zusätzliche Pflicht                   |
| Praxis abgeschlossen     | Alle grundlegenden Praxisaufgaben bestanden                        | Internals blockieren diesen Abschluss nicht |
| Deep Dive gemeistert     | Grundlagen und Praxis sowie alle unabhängigen Vertiefungsnachweise | Eigener optionaler Abschluss                |

Praxisaufgaben tragen eine additive `tier`-Kennung: `practice` (auch Standard für alte Aufgaben), `deep-dive` oder `exploration`. Die vorhandenen strengen Raft-/Scheduler-Pfade bleiben als Exploration erhalten. Ihre Ausführung belegt nicht allein eine unabhängige Fehleranalyse.

Im geführten Modus stehen Hilfen und Pfadvorschläge zur Verfügung. Im Challenge-Modus werden geführte Pfadmodelle ausgeblendet; Transfer- und Diagnoseaufgaben bleiben. Der Prüfer verlangt Belege, Ursache und passende Korrektur, aber keine bestimmte Reihenfolge der Diagnoseaktionen. Hinweise und Lösungen benötigen einen bewussten Klick; Hilfe markiert den Versuch als unterstützt. Ein neuer Versuch leert Antworten und Hilfestatus. Er löscht keine zuvor erworbenen Abschlüsse. Diese Regeln sind didaktische Selbstprüfung, keine manipulationssichere Zertifizierung.

Fortschrittsformat 4 bewahrt alle Nachweise aus Version 3. `independentCompleted` beginnt bei Migration leer. Die Version-1/2-Regeln bleiben erhalten. Ungültige unabhängige Nachweise (unbekannt, falsche Aufgabenstufe oder fehlender Praxisnachweis) werden vor Import abgewiesen. YAML-/Cluster-Speicherung bleibt getrennt und unverändert.

## Gap-Analyse und redaktionelle Zuordnung

| Lektion            | Bisherige Lücke                     | Fachlicher Ausbau                                                                         | Grundlagen-/Praxisprüfung                 | Unabhängige Fehleranalyse                              |
| ------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------ |
| Linux-Einstieg     | Begriffe ohne geprüfte Zuordnung    | Bestehender Text und Wissenscheck erhalten, Zuordnung ergänzt                             | Namespaces / cgroups / gemeinsamer Kernel | Erst in folgenden Fachlektionen                        |
| Prozesse           | Kein Lifecycle / PID-1-Modell       | fork/exec, Signale, Prozesszustände, Reaping, Namespace-Init                              | q1–q3 und Ursache-Zuordnung               | Zombie und lebender Elternprozess                      |
| Namespaces         | PID/Net/Mount nur benannt           | Getrennte Zugehörigkeiten, User-ID-Abbildung, procfs-Sicht, Netzvorbereitung              | q1–q3 und Mechanismus-Zuordnung           | Prozess im Host sichtbar, im Container nicht           |
| cgroups v2         | Nur allgemeine Ressourcenlimits     | Hierarchie, Quote/Gewicht, memory.high/max, Ereignisse, pids.max                          | q1–q3 und Limit-Zuordnung                 | Freie Host-CPU trotz Throttling                        |
| systemd            | Nur status-Befehl                   | Unit/Drop-in, Type, enabled/active, Abhängigkeiten, Reload, Restart-Grenzen; Unit-Vorlage | q1–q3 und Zustands-Zuordnung              | Enabled, aber Start wegen Konfiguration fehlgeschlagen |
| Linux-Netz         | Keine schichtweise Diagnose         | Namespace-Kontext, Bind-Adresse, Route, Nachbar, DNS/NSS, NAT/Filter/Rückweg              | q1–q3 und Befund-Zuordnung                | IP-Verbindung klappt, Namensauflösung nicht            |
| Container-Einstieg | Rollenliste ohne geprüfte Zuordnung | Original erhalten, Zuständigkeitsübung ergänzt                                            | containerd / runc / CRI                   | Erst in folgenden Fachlektionen                        |
| OCI Images         | Image nur als Layer-Bündel          | Deskriptor, Manifest, Index, Plattform, Digest/Tag, Whiteout, Snapshot                    | q1–q3 und Inhalts-Zuordnung               | Plattformmanifest fehlt                                |
| Runtime            | containerd/runc nur grob abgegrenzt | Metadaten/Task, Shims, OCI Bundle, Konfigurationsfragment, Isolation                      | q1–q3 und Grenz-Zuordnung                 | Containerdefinition ohne laufenden Task                |
| CRI                | Vertrag ohne Fehlergrenzen          | RuntimeService/ImageService, Sandbox, Client-Unterschiede, Endpunkt/Plugin                | q1–q3 und API-Zuordnung                   | containerd erreichbar, CRI deaktiviert                 |
| Lifecycle          | Keine getrennten Zustandsmodelle    | OCI-Zustände, Restart-Verantwortung, Daten, Signal/Exit/OOM-Korrelation                   | q1–q3 und Zustands-Zuordnung              | Exit 137 plus passende Speicherereignisse              |

Die neun neuen Fachlektionen enthalten jeweils zwei Lernziele, technische Abschnitte, Tabelle, lesende externe Diagnosebefehle, grundlegende Praxis, drei Quizfragen und optionalen Diagnosefall. Eine freie schriftliche Begründung wird nicht automatisch bewertet. Ein richtiger Multiple-Choice-Nachweis ersetzt keinen echten VM-Betrieb. Die Einführungstexte und bisherigen Quizfragen bleiben erhalten.

Modul 03 erhält pro Lektion einen Diagnosefall: Objektidentität, etcd-Quorum, Admission, kompaktierter Watch, Cache nach Create, PV-Topologie, Readiness, Rollout-Verfügbarkeit und Node-Partition. Inhaltliche Erklärungen werden dafür nicht weiter ausgebaut. Vorhandene Transferaufgaben werden ausdrücklich als optionale Vertiefung eingeordnet.

## Quellenprüfung und Grenzen

Primärquellen sind Linux-man-pages, Kernel-cgroup-v2-Dokumentation, systemd-Handbücher (Quellstand v257), OCI Image Spec v1.1.1, OCI Runtime Spec v1.2.1, containerd-2.4-Dokumentation und CRI v0.35.0 sowie offizielle Kubernetes-Dokumentation. Dies sind Belegstände für die erläuterten Konzepte, keine Änderung der separaten kubeadm-Lab-Versionen.

Beim Abruf waren 19 der 29 zunächst referenzierten URLs direkt erreichbar. Die zehn man7.org-Adressen liefen in dieser Umgebung in Timeouts. Für Namespace-/PID-/Signal-Semantik wurden deshalb Handbuchquellen im Repository des man-pages-Autors und für Routing der iproute2-Quelltext herangezogen; Alle zehn ergänzten Handbuch-Quellverweise waren anschließend per HTTP erreichbar. systemd-generierte Webseiten waren beim Browserabruf blockiert; die verlinkten offiziellen XML-Quellen sind erreichbar. Es wird keine lückenlose Live-Linkprüfung aller Webseiten behauptet.

Wichtige Abgrenzungen: exec erzeugt allein keine neue PID; Zombie beendet, aber nicht abgeholt; PID-Sicht nicht CPU-Limit; cpu.weight nicht fixe Quote; enabled nicht active/ready; Route nicht End-to-End-Zugriff; Digest nicht Publisher-Vertrauen; Metadaten nicht Task; Socket nicht CRI-Dienst; Exit 137 allein nicht OOM-Beweis.

Alle Diagnosebelege sind ausdrücklich verfasste Modellzustände, keine erfundenen Shell-Ausgaben. Codeblöcke enthalten externe Befehle oder gekennzeichnete Eingabefragmente. Keine VM oder Runtime wurde durch diese Browserprüfungen betrieben. Frei konfigurierbare Modellfehler, zufällige Varianten und offene Textbewertung bleiben spätere Erweiterungen.

## Durchgeführte Prüfung

- 138 Unit-Tests erfolgreich: Inhaltserhalt, getrennte Abschlussbedingungen, Migration 1–3 nach 4, ungültige Nachweise, alle Diagnosefälle mit umgekehrter Untersuchungsreihenfolge und falschen Ursachen/Korrekturen sowie bestehende Modelle.
- 30 Chromium-E2E-Tests erfolgreich: bestehender Lern-/Lab-Betrieb, drei Lernstufen, Moduswechsel, bewusst aufgedeckte Hilfe ohne unabhängigen Nachweis, Reset, Persistenz und alle neun neuen Diagnosen auf schmalem Bildschirm.
- Produktionsbuild einschließlich TypeScript erfolgreich. Desktop und mobile Darstellung visuell geprüft. Der beim Test gefundene Überlauf langer Titel mit drei Statusanzeigen ist behoben.
- Die bekannte Monaco-Bundlegrößenwarnung bleibt bestehen. Echte VM-, kubeadm- oder Runtime-Ausführung war kein Teil dieser Prüfung.
