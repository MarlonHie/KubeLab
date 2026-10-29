# Umsetzungsstand und Content-Roadmap · Lernplattform 2.0

Stand: 28. Oktober 2026. Produktziel: Kubernetes verständlich machen, ohne eine Expertenausbildung oder einen Pflichtkurs vorauszusetzen. Die frühere feste Acht-Kapitel-Kursplanung ist ein optionaler Ideenfundus. Es gibt keine Mindestzahl an Lektionen, keine Mindestlernzeit und keine verpflichtenden Quiz-/Praxis-/Expert-Stufen.

## Die fünf beauftragten Phasen

| Phase | Umsetzung | Grenzen |
| --- | --- | --- |
| 1 · Analyse/Dokumentation | Bestehende 22 Lektionen, Aufgaben, Modelle, Navigation und Stores ausgewertet; fünf Dokumente auf Entdecken/Lernpfade/Playground und freiwilliges Lernen umgestellt | Frühere Fachplanungen mit K-IDs bleiben als Ideenfundus erhalten, nicht als verbindlicher Kurs |
| 2 · Datenmodell | Zentrale Themenmetadaten, sechs Kategorien, Synonyme, Beziehungen, direkte Deep-Dive-Links und drei deklarative Pfade implementiert | Geplante Themen haben bewusst keine vollständige Lektion |
| 3 · Einstieg/Navigation | Neue Startseite, Suche, Entdecken, Pfadübersicht/-details, drei Hauptpunkte, Playground-Werkzeuge | Kein neuer Backenddienst, keine Clusteranbindung |
| 4 · Lektionen/Fortschritt | Zusammenhängende Leseansicht, freiwilliger Lesestatus, optionale Aufgaben/Quiz und Nachweise, Metadatenempfehlungen, direkt öffnende Internals | Historische Nachweisseman­tik bleibt sekundär erhalten; kein falsches Umschreiben als unabhängige Kompetenz |
| 5 · Qualitätssicherung | Metadaten-/Such-/Migrationsprüfungen, bestehende Modelltests, Browser-Szenarien und Pages-Unterpfadprüfung | Kein reales VM-/Operator-Lab oder Remote-Deployment als Teil dieser Prüfung |

## Gemeinsame Bibliothek statt Inhaltskopien

[Library](../../packages/lesson-engine/src/library.ts) ist die zentrale Quelle für Topics, Pfade, Suche und Beziehungen. Die bestehenden Lesson-JSON-Dateien bleiben kanonisch und unverändert. Eine gezielte neue [Zalando-Lektion](../../content/lessons/zalando-postgres.json) macht den angeforderten direkten Alltagseinstieg tatsächlich benutzbar. Sie erklärt Manifest, Services/Secrets, Diagnose und optional Patroni anhand offizieller Projektquellen. Sie enthält absichtlich kein Quiz und keine bewertete Aufgabe. Alle übrigen fehlenden Fachkurse werden in diesem Auftrag noch nicht ausgearbeitet.

Die Metadaten trennen `lessonId` von einer geplanten Themenkarte. Suche findet Titel, Beschreibung, Tags, Synonyme und Deep-Dive-Titel, normalisiert Groß-/Kleinschreibung, Umlaute und Trennzeichen und unterstützt die benannten Begriffsvarianten. Kategorie und Verfügbarkeit begrenzen die Treffer. Bei leeren Ergebnissen gibt es eine Rücksetzfunktion. Empfehlungen sind keine Voraussetzungen und keine Freischaltregeln.

Die ursprünglichen 22 IDs bleiben unverändert: linux, linux-processes, linux-namespaces, linux-cgroups, linux-systemd, linux-networking; containers, container-images, container-runtime, container-cri, container-lifecycle; cluster-basics, control-plane, api-lifecycle, etcd, controllers, scheduling, kubelet-runtime, apply-to-pod, component-failures; networking, cilium. Jede erscheint genau einmal in der Bibliothek und kann von mehreren Pfaden referenziert werden.

## Fortschrittsmigration 1–4 nach 5

Der bestehende Schlüssel `kubelab-progress` und idb-keyval/Zustand bleiben erhalten. Format 5 ergänzt:

- `readCompleted`: eindeutige vorhandene Lektions-IDs, unabhängig von Quiz und Aufgaben.
- `recentLesson`: zuletzt tatsächlich besuchte Lektion oder null bei neuem Stand.
- `lastPath`: zuletzt verwendeter gültiger freiwilliger Pfad oder null.

Alle bisherigen Felder bleiben erhalten: `theoryCompleted`, `practiceCompleted`, `independentCompleted`, `checkpoints`, `challenge`, `completedChallenges`, `lastLesson`, `theme`. Vorhandene Theorieabschlüsse werden bei Migration als gelesen übernommen. Praxis wird nicht zu unabhängigem Nachweis aufgewertet. Die historische Version-1-Regel für control-plane bleibt bestehen. Ein erneuter Import/Migrationslauf ist idempotent; Duplikate werden wie bisher entfernt.

Vor automatischer IndexedDB-Migration wird das gültige Original unter `kubelab-progress-backup-v<Version>` gesichert, sofern dort noch keine Sicherung liegt. Erst danach wird der aktive Stand ersetzt. Bei fehlerhafter Validierung oder nicht schreibbarem Backup bleibt das Original bestehen und eine Meldung sichtbar. Unbekannte Formatversionen werden nicht stillschweigend zurückgesetzt. Ein bewusstes Zurücksetzen/Importieren in den Einstellungen bleibt eine eigene Nutzeraktion. Export enthält Format 5; Import akzeptiert 1–5. Eine ältere App kann Format 5 nicht lesen; dafür existiert die alte Sicherung. Es wird keine verlustfreie Rückwärtskonvertierung neuer Lesemarkierungen behauptet.

Ein manuell gesetzter Lesestatus verändert keinen alten Prüfungsnachweis. Das Aufheben löscht nur die Lesemarkierung. Ein bestandener optionaler Quizcheck speichert weiterhin seinen eigenen Nachweis, erzwingt aber keine Lesemarkierung. Pfadwechsel kopiert keine Daten. Deep-Dive-Hilfe betrifft weiterhin den aktuellen optionalen Versuch, nicht den Lesestatus.

Der getrennte Schlüssel `kubelab-lab-v1` bleibt unverändert: ungültiger YAML-Entwurf, angewendetes YAML, Cluster, Szenario und Ausgabe werden nicht migriert oder umbenannt. Bestehende hello-kubelab-/Teamboard-Artefakte bleiben erhalten. Keine globalen Text-/ID-Ersetzungen. Der ursprüngliche Zustand eines realen Benutzerbrowsers wird erst beim nächsten Laden der neuen App migriert; die Entwicklung bearbeitet keine fremden Browserdaten.

## Routen und statischer Betrieb

| Route | Verhalten |
| --- | --- |
| `/#/` | Ruhige Startseite, Logo-Ziel |
| `/#/discover` | Suche/Kategorien/Verfügbarkeit; Filter in URL |
| `/#/paths`, `/#/paths/:id` | Drei freiwillige Pfade und ihre Metadatenfolge |
| `/#/topics/:id` | Geplantes Thema mit ehrlicher Vorschau und vorhandenen Beziehungen |
| `/#/academy/:id` | Bestehende Lektions-ID; optional `?path=…&section=…` |
| `/#/academy` | Kompatibler Zugang zur Themenübersicht |
| `/#/playground?tool=editor|visualizer|build` | Bestehende Werkzeuge in gemeinsamer Navigation |
| `/#/operations`, `/#/visualizer`, `/#/build` | Erhaltene direkte Zugänge mit Playground-Werkzeugleiste |
| `/#/settings` | Theme, Lernstand-/Lab-Export und Import |

Hash-Routing und relative Assets bleiben für `/KubeLab/` geeignet. GitHub-Actions-Workflow bleibt bestehen: Tests/Build/Browserchecks vor Pages-Artefakt. Es werden keine Secrets, Cloud-APIs oder neuen Dependencies benötigt. Ein echter Cluster ist für keinen Pfad notwendig; externe Befehle bleiben optional und als solche gekennzeichnet. Der lokale KubeLab-Agent, Pairing und reale Clusteranbindung sind ausdrücklich ausgeschlossen.

## Geänderte Dateien und wiederverwendete Bausteine

- Daten: `packages/lesson-engine/src/library.ts`, `schema.ts`, `types.ts`, `index.ts`, `lesson.schema.json`, `content/lessons/catalog.ts`, neue `zalando-postgres.json`.
- UI: `apps/web/src/App.tsx`, `pages/Learning.tsx`, `pages/LessonPage.tsx`, `components/LessonBlocks.tsx`, `styles.css`.
- Persistenz: `apps/web/src/stores/progress.ts`.
- Tests: bestehende Unit-/E2E-Tests an neue freiwillige Darstellung und Format 5 angepasst; neue Library-/Plattformtests und expliziter Helfer zum Öffnen optionaler Übungen.
- Dokumentation: alle fünf Dateien unter `docs/content/`.

Wiederverwendet: alle bisherigen Texte, Quellen, Quiz-/Aufgabenblöcke, acht Konzeptmodellarten, Raft-/Scheduler-Internals, 18 Diagnosen, Operations-Szenarien, Monaco, Terminal, ClusterGraph, Build-Leitfaden und Lab-Backup. Keine Simulation entfernt. Die alte Academy-Komponente bleibt als Quellbestand erhalten, wird aber nicht mehr als aktive Start-/Katalogansicht gerendert. Neue Pfade erzeugen keine zweite Kopie eines Lerninhalts.

## Nächste inhaltliche Ausbauschritte

Priorität nach Nutzen und Rückmeldung, nicht nach einer Mengenquote: ein alltagstauglicher Workload-/Konfigurations-/Service-Einstieg, danach Storage und Operator-Nutzung, anschließend Betrieb/GitOps/Security. Linux-/Container- und Architekturdetails bleiben frei erreichbar. KubeShop bietet passende Beispiele; unabhängige Begriffsartikel sind gleichwertig. Der erhaltene Ideenfundus und das Komponentenregister sichern die früher geplanten Themen einschließlich Cilium/Hubble, Longhorn, cert-manager, Prometheus Operator, Alloy/Loki, Zalando, Argo CD/ApplicationSets, ESO, Kyverno, KEDA, Velero, OpenTofu/Terraform und Ansible.

Neue Interaktionen entstehen nur bei didaktischem Mehrwert. Vorhandener YAML-Validator/Terminal unterstützt weiterhin lediglich das dokumentierte Ressourcenmodell, keine CRD-/CSI-/Operatorausführung. Echte Lab-Reproduktion und Versionsmatrizen sind spätere Aufgaben; der historische kubeadm-Leitfaden bleibt ohne bestätigten vollständigen VM-Lauf gekennzeichnet. Keine Agentenarbeit wird dafür eingeplant.

## Prüfprotokoll und verbleibende Grenzen

Das abschließende Prüfprotokoll wird nach den lokalen Läufen unten ergänzt. Ein erfolgreicher Build oder Modelltest belegt keine echte Clusterfunktion. Geplante Themen bleiben sichtbar unvollständig; der aktuelle Auftrag schafft die Struktur und den gezielten Zalando-Einstieg. Die bekannte Monaco-Bundlegrößenwarnung ist weiterhin möglich. Daten liegen lokal pro Browser, nicht geräteübergreifend. Eine unabhängige didaktische Pilotierung ist durch automatisierte Tests nicht ersetzt.
