# Content-Ausbau Phase 1: Kubernetes im Alltag

Stand: 29. Oktober 2026. Vier neue Lektionen und eine ausgebaute bestehende Lektion ergeben einen zusammenhängenden Einstieg für Entwickler auf vorhandenen Clustern. Die Informationsarchitektur Entdecken/Lernpfade/Playground bleibt erhalten. Alle fünf Inhalte sind frei zugänglich; weder Clusteraufbau noch eine bestandene Prüfung sind erforderlich.

## Ausgelieferte Inhalte

| Reihenfolge / stabile ID | Problem und fachlicher Kern | Beispiel / optionale Vertiefung |
| --- | --- | --- |
| 1 · [`resources-basics`](../../content/lessons/resources-basics.json), neu | Wie beschreibe und untersuche ich eine Anwendung? Ressourcen, deklarativer Sollzustand, YAML-Struktur, Namespace, apply/get/describe/logs; Annahme ist nicht Bereitschaft | Vollständiger Backend-Pod und externe Befehle. Optionaler API-Ablauf; direkter Link in bestehende API-/Admission-Internals |
| 2 · [`pods`](../../content/lessons/pods.json), neu | Warum Pod statt nur Container? Gemeinsames Netzwerk und gezielt geteilte Volumes, Pod-Phasen, Neustart vs. Ersatz, Löschung ohne Besitzer | Derselbe Backend-Pod, bewusst als Ausschnitt statt zweitem vollständigem Manifest. Optional Sandbox, Init/Sidecars; direkter Link zu kubelet-Internals und verwandter Container-Lifecycle |
| 3 · [`deployments`](../../content/lessons/deployments.json), neu | Wer erhält die gewünschte Zahl? Deployment → ReplicaSet → Pods, Labels/Selektoren, Replikate, Rolling Update, fehlerhaftes Image, bewusster Rollback, HA-Grenzen | Backend-Deployment mit drei Replikaten; bestehendes Reconciliation-Modell. Optional maxSurge/maxUnavailable/PDB; direkter Controller-Deep-Dive |
| 4 · [`networking`](../../content/lessons/networking.json), erweitert | Wie findet ein Client wechselnde Pods? ClusterIP, Selektoren, EndpointSlices, DNS, port/targetPort, Service-Typen und interner Zugriff | Deployment und passender Service nebeneinander, interner HTTP-Aufruf, Verbindungsdiagramm. Bestehende Fehlerdiagnose und Wissensfrage erhalten. Optional DNS/Datenpfad/Cilium |
| 5 · [`ingress`](../../content/lessons/ingress.json), neu | Wie kommt der Browser zum Shop? Controller-Voraussetzungen, Host/Pfad/TLS; GatewayClass, Gateway, HTTPRoute und ihr Verhältnis zu Ingress | Frontend-Deployment/Service, alternative Ingress- bzw. Gateway/HTTPRoute-Manifeste, abschließendes Gesamtbild. Optional TLS-Terminierung, cert-manager, MetalLB |

Die Titel und Reihenfolge stehen in der zentralen [Bibliothek](../../packages/lesson-engine/src/library.ts). `pods`, `deployments` und `ingress` verwenden ihre bisherigen geplanten Themen-IDs. Die Bibliothek gibt für bereits ausgelieferte IDs keine zusätzlichen Platzhalterkarten aus. `gateway` bleibt als „Gateway API vertiefen“ eine weiterführende Planung, während der Einstieg schon verfügbar ist.

## Didaktik und Wiederverwendung

Jede Lektion beginnt mit einem Problem, erklärt Ursache und Wirkung und führt zum Problem der nächsten Lektion. YAML ist erläutertes Anschauungsmaterial. Alle fünf enthalten einzeln öffnende Internals; Empfehlungen sind keine Zugangssperren. Es gibt keine neuen Pflichtaufgaben, künstlichen Quizfragen oder pauschalen Zeitwerte. Die vorhandene Networking-Frage bleibt freiwillig. Lernzeit sollte erst nach einer Pilotierung mit Anfängern angegeben werden.

Der gesamte bisherige Networking-Inhalt bleibt unter `networking` erhalten; die vertiefende Diagnose unter `section-1` ist nun optional aufklappbar. Ihr Operations-Szenario und Wissenscheck bleiben unverändert nutzbar. Vorhandene Quellen und alte Leistungsnachweise werden nicht gelöscht. Historische Teamboard-/hello-kubelab-Beispiele anderer Labs bleiben als eigene Beispiele bestehen.

API-Verarbeitung, kubelet/CRI und Controller-Internals werden nicht vollständig neu geschrieben, sondern direkt verlinkt. Dafür ergänzt die Themenmetadatenstruktur lediglich optionale `deepDiveLinks` zu vorhandenen Abschnitten. Das Lesson-JSON-Schema, die Modellimplementierungen und das Fortschrittsformat bleiben unverändert. Verweise werden beim Laden auf existierende Ziele geprüft.

## Visualisierungen und Simulationsgrenzen

- **Deployment:** vorhandenes interaktives `Reconciliation`-Ablaufmodell, von einer zu drei bereiten Instanzen; Ausfall setzt den Ablauf zurück. Keine Container, keine echte Pod-Löschung, keine vollständige Rollout-Simulation. Replikazahländerungen sind zusätzlich im bestehenden Playground möglich.
- **Services:** kleines Textdiagramm Frontend → Service → Backend-Pods; A wird durch D ersetzt. Zielauswahl und Service-Identität werden erklärt, einschließlich möglicher Verbindungsabbrüche. Keine vorgetäuschte Paket- oder DNS-Messung. Die vorhandene Selektorfehler-Übung ist über den Playground erreichbar.
- **Ressourcen:** optionale Verantwortungsansicht kubectl → API → gespeichertes Ziel → zuständige Komponenten.
- **Abschluss:** getrennte Verwaltungsbeziehungen und HTTP-Datenpfade, damit Deployment/ReplicaSet nicht als Netzwerk-Hops erscheinen.

Die vorhandenen Visualizer-, YAML-/Terminal-, Raft-, Scheduler- und Diagnosemodelle bleiben verfügbar. Eine neue freie Rollout-/Netzwerksimulation wäre eine separate Modellierungsaufgabe und wurde für diese Erklärungen nicht hinzugefügt.

## KubeShop-Beispielvertrag

| Eigenschaft | Durchgehend verwendeter Wert |
| --- | --- |
| Namespace | `default`; bei echter Nutzung mit allen Referenzen auf den Team-Namespace anpassen |
| Backend | Deployment/Service `kubeshop-api`, Pod-Label `app: kubeshop-api`, Container `api` auf `0.0.0.0:8080` |
| Demo-Pod | `kubeshop-api-demo`; vor dem Deployment entfernen, damit der spätere Service ihn nicht zusätzlich auswählt |
| API-Service | ClusterIP, Port 80 → targetPort 8080; Name `kubeshop-api`, Endpunkt `/api/products` |
| Frontend | Deployment/Service `kubeshop-web`, Label `app: kubeshop-web`, Container `web`, Port 80 → 80 |
| Images | Explizite Platzhalter `<KUBESHOP_BACKEND_IMAGE>` / `<KUBESHOP_FRONTEND_IMAGE>`; keine erfundenen Registry-Adressen |
| HTTP-Einstieg | `shop.example.test`, `/api` → API-Service:80, `/` → Frontend-Service:80; keine Rewrite-Abhängigkeit |
| Ingress | `networking.k8s.io/v1`, Klasse `<INGRESS_CLASS>` muss durch eine angebotene Klasse ersetzt werden |
| Gateway | `gateway.networking.k8s.io/v1`, Klasse `<GATEWAY_CLASS>`, Gateway `kubeshop-gateway`, Listener `http`, HTTPRoute `kubeshop` |

Das Backend-Deployment in Services ist absichtlich dieselbe Vorlage wie in Deployments: Der Leser kann Labels direkt vergleichen. Automatisierte Tests prüfen diese Gleichheit, beide Service-Selektoren und Zielports sowie beide Routingvarianten gegen die vorhandenen Services. Der DNS-Aufruf gilt für einen Container im Clusternetz. Browser-JavaScript kann nicht automatisch interne Cluster-DNS-Namen verwenden.

Die Image- und Klassenplatzhalter sind **keine direkt ausführbaren Kubernetes-Konfigurationen**. Der YAML-Parser prüft Syntax und Referenzkonsistenz, kein serverseitiges Admission-Verhalten. Eine reale Nutzung setzt passende Images, Zugriffsrechte, Netzwerk/DNS und entweder Ingress-Controller oder Gateway-API-CRDs samt Implementierung voraus. Das ist in den Lektionen sichtbar gekennzeichnet.

## Integration und Fortschritt

Die fünf IDs stehen am Anfang von `alltag`, mit nächsten Themen in derselben Reihenfolge. Suchbegriffe umfassen unter anderem kubectl/Kubernetes CLI, Pods, ReplicaSet, DNS, HTTP-Zugriff und Gateway API. Hilfreiches Vorwissen, verwandte Themen, lokale Internals und die drei direkten Architekturvertiefungen sind hinterlegt.

Manuelle Lesemarkierungen werden im bestehenden Format 5 gespeichert und zwischen allen Pfaden geteilt. `networking` behält seine ID und historische Quiznachweise. Kein vorhandener Nachweis wird als Beleg für die neu hinzugefügten Inhalte umgedeutet; insbesondere bestätigt eine alte Lesemarkierung keine gesonderte Prüfung der Erweiterung. Bei Lektionen ohne Quiz behauptet die optionale Nachweisansicht keinen offenen Wissenscheck; bei reinen Lese-Deep-Dives keine fehlende Vertiefungslektion.

## Qualitätssicherung

Lokal am 29. Oktober 2026 ausgeführt:

| Prüfung | Ergebnis und Aussage |
| --- | --- |
| `npm test` | **175/175 bestanden**, darunter 13 neue Prüfungen für Reihenfolge, Suche, optionale Abschnitte, YAML-Syntax, KubeShop-Referenzen und Fortschrittskompatibilität |
| `npm run build` | TypeScript-Prüfung und Vite-Produktionsbuild erfolgreich; bekannte Monaco-Chunkgrößenwarnung bleibt |
| `./node_modules/.bin/playwright test --workers=4` | **39/39 Chromium-E2E-Tests bestanden**, einschließlich drei neuer Abläufe; alle 27 Lektionen, vorhandene Modelle, Migration/Backup/Export/Import, Desktop und Mobile |
| GitHub-Pages-Unterpfad | Lokaler Preview mit `npm run preview -- --port 4174 --base /KubeLab/`; Startseite, fünf Lektionen und nachgeladener Monaco-Editor per Chromium geprüft. Keine HTTP- oder Laufzeitfehler |
| Darstellung | Desktop 1440 × 1050 und Mobile 390 × 844 visuell geprüft; kein Seitenüberlauf, Code separat horizontal scrollbar, Beispielhinweise sichtbar |
| Repository/Dokumentation | `git diff --check` und lokale Markdown-Dateiverweise ohne Fehler |

Der Abschlusslauf verwendet den endgültigen Build. Zwei zunächst fehlgeschlagene Browserprüfungen sind darin behoben: Der Test öffnet nach Navigation den optionalen Quizbereich ausdrücklich, und die Prüfung der neuen Statusbeschriftung läuft gegen den aktualisierten Build. Keine Regressionstests wurden dafür entfernt.

Neue Tests: [Inhaltsvertrag](../../tests/everyday-content.test.ts) und [Browserabläufe](../../tests/e2e/everyday-content.spec.ts). Diese ergänzen die bestehenden Schema-, Inhaltsbewahrungs-, Simulations-, Fortschritts- und Plattformtests.

## Verbleibende Lücken

Noch keine echte KubeShop-Implementierung, Images, Produktivmanifeste oder nachgewiesene Cluster-/VM-Ausführung. Probes, Ressourcenbudgets, Konfiguration/Secrets, Storage, TLS-Bereitstellung und vertiefte Gateway-Policies benötigen weitere Lektionen. Die Grundlagen benennen diese Grenzen, behaupten aber weder garantierte HA noch produktionsfertigen Betrieb.

Eine freie Rollout-/Endpoint-Fehlersimulation und Nutzertests mit Anfängern bleiben sinnvolle Folgearbeiten. Die vorhandene Bundlegrößenwarnung des Monaco-Editors bleibt bekannt. Keine Agentenentwicklung, kein Backend, keine neuen Abhängigkeiten und kein kostenpflichtiger Dienst wurden hinzugefügt.
