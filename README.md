# KubeLab

Kostenlose, deutschsprachige Kubernetes-Lernplattform mit lokalen Lernständen. Statische React-/TypeScript-Anwendung ohne Konto oder Backend.

## Lokal starten

Voraussetzung: Node.js 22.12+ (auch Node 20.19+ unterstützt) und npm 11.6.2+.

```bash
npm ci
npm run dev
```

Öffne die von Vite angezeigte lokale URL. Produktionsbuild und Prüfungen:

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

## Enthalten

- Dashboard, responsive Navigation, Hell-/Dunkelmodus.
- Drei MDX-Grundlagenmodule zu Linux, Containern und Control Plane; Quiz und Modulnavigation.
- React-Flow-Visualizer mit Komponentenerklärungen und Scheduler-Experiment.
- Lokal gebündelter Monaco-YAML-Editor, AJV-/YAML-Prüfung, xterm.js-Terminal und begrenzte kubectl-Simulation.
- Deployment, Pod und Service, Replikate, Ressourcenansicht, reparierbare Deployment-Challenge, verstellbare Editorbreite.
- Sieben geführte kubeadm-Schritte mit kopierbaren Befehlen, Voraussetzungen, manuellen Checkpoints, Troubleshooting und Snapshot-Reset.
- Fortschritt in IndexedDB, geprüfter JSON-Import/-Export und expliziter Reset.

Der Browser führt keine echten Shell-Befehle aus. Die Simulation prüft nur einen Teil des Kubernetes-Schemas und nimmt erfolgreiche Containerstarts an. Lab-Zustände und YAML werden nicht dauerhaft gespeichert. Der kubeadm-Leitfaden wurde nicht auf echten VMs ausgeführt. Agent, Enterprise-Labs, übrige Academy-Phasen und PWA folgen später. Siehe [Implementierung](docs/architecture/implementation.md), [Sicherheitsgrenzen](docs/security/README.md) und [Gesamtroadmap](docs/architecture/roadmap.md).

## GitHub Pages

1. Dieses Projekt in ein eigenes GitHub-Repository mit Hauptbranch `main` übertragen.
2. Unter **Settings → Pages → Build and deployment** die Quelle **GitHub Actions** wählen.
3. Push auf `main` oder den Workflow **Validate and deploy KubeLab** manuell starten.

Der Workflow installiert Abhängigkeiten, führt Unit- und Browsertests aus und veröffentlicht `apps/web/dist`. Pull Requests werden geprüft, aber nicht veröffentlicht. Hash-Routing und relative Assets unterstützen `https://NAME.github.io/REPO/` ohne serverseitige Rewrite-Regeln. Es werden keine Secrets benötigt.

Zielrepository: https://github.com/MarlonHie/KubeLab. Die Veröffentlichung benötigt GitHub-Schreibzugriff und aktivierte GitHub Pages.

## Beiträge und Lizenz

Neue Grundlagenlektionen als MDX in `content/` anlegen und in der Lesson Engine sowie der Modulansicht registrieren. Die Lernstruktur lautet Konzept → Visualisierung → Lab → Aufgabe → Validierung → Troubleshooting. Simulationsänderungen mit den Tests in `tests/` prüfen.

MIT-Lizenz, siehe [LICENSE](LICENSE).
