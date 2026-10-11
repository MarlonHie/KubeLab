# Content First · Entwicklungsstand 0.2.1

Priorität: technische Tiefe und praktisches Verständnis vor dem lokalen Agenten. Keine Benutzerverwaltung oder kostenpflichtige Infrastruktur in dieser Phase. 80–120 Lektionen sind ein Planungsrahmen, kein bereits ausgelieferter Umfang.

## Referenzmodul 03

Neun ausgearbeitete Lektionen:

1. Kubernetes und Clusterbegriffe.
2. Control Plane und Worker Nodes.
3. API Server und API-Lebenszyklus.
4. etcd, Desired State und Quorum.
5. Controller und Reconciliation.
6. Scheduling und Pod-Platzierung.
7. kubelet, CRI und Container Runtime.
8. Von kubectl apply bis zum bereiten Pod.
9. Komponenten- und Node-Ausfälle.

Jede Lektion enthält Lernziele, Einführung, technische Vertiefung, ein interaktives Modell mit Grenzen, eine Aufgabe mit Hinweis und Lösung, Praxisbezug, Fehleranalyse, Expert-Challenge und drei begründete Quizfragen. Die Niveaus Fundamentals, Deep Dive und Expert sind frei zugänglich. Quellen stammen aus der Kubernetes- und etcd-Dokumentation. Redaktioneller Stand: 11. Oktober 2026; eine unabhängige fachliche Abnahme ist damit nicht behauptet.

## Lehrplan und Phasen

| Phase                     | Module | Themen                                                             |
| ------------------------- | ------ | ------------------------------------------------------------------ |
| A · Fundament             | 01–04  | Linux, Container, Kubernetes Architecture, Bootstrap               |
| B · Kubernetes Core       | 05–08  | Workloads, Scheduling & Resources, Networking, Ingress & Gateway   |
| C · Plattform             | 09–13  | Storage, Helm & Kustomize, Operators & CRDs, Observability, GitOps |
| D · Enterprise Operations | 14–16  | Security, High Availability, Troubleshooting                       |
| E · Content Quality       | alle   | Fachreview, Didaktik, Verlinkung, Tests und Kollegen-Beta          |

Modul 03 ist das ausgearbeitete Referenzmodul. Für 01, 02 und 07 bestehen Einführungen; die übrigen Bereiche sind geplant. Es gibt insgesamt 13 verfügbare Lektionen. Der bestehende externe kubeadm-Leitfaden ist kein fertig geprüfter Bootstrap-Lernpfad.

## Durchgehendes Praxisprojekt

„Teamboard“ verbindet Frontend, Backend-API und PostgreSQL. Das Referenzmodul verwendet diese Anwendung als Architekturbeispiel. Später folgen HPA, Storage, Zalando Postgres Operator, Prometheus, Argo CD und Kyverno. Diese Zielarchitektur wird derzeit weder im Browser noch auf echten Clustern installiert.

## Content-System 0.2.1

Alle vorhandenen Lektionen verwenden das deklarative Blockformat. Theorie und überprüfte Modellaufgaben erhalten getrennte Fortschritte, vorhandene Stände werden migriert. Die Einführungen wurden formal migriert, noch nicht inhaltlich zu vollständigen Grundlagenmodulen ausgebaut. Siehe [Autorenhandbuch](lesson-authoring.md).

## Weitere Werkzeuge

Vorhanden sind Architektur-, Request-, Quorum-, Scheduler-, Runtime-, Reconciliation- und Failure-Experimente sowie der persistente YAML-Playground. Network Packet Explorer, Storage Explorer, Observability Playground und komplexe Operator-Labs folgen mit ihren Fachmodulen. Bestehende einfache Service-/Cilium-Inhalte ersetzen keinen vollständigen Networking-Lernpfad.

VM-Verifikation und lokaler Agent sind zurückgestellt. Content-Qualität wird fortlaufend geprüft; vor einer umfassenden Beta folgen unabhängige Fachprüfung und Rückmeldungen von Kollegen.
