# kubeadm-basics-v1

Die ausführbare Lernansicht liegt unter `/#/build`; ihre sieben Schritte stehen in `apps/web/src/pages/buildSteps.ts`.

- Startzustand: drei neue Ubuntu-24.04-VMs, systemd, eindeutige Hostnamen, Snapshot vor dem Lab.
- Profil: mindestens 6 vCPU, 8 GB RAM insgesamt (4 GB Control Plane und je 2 GB pro Worker), 60 GB Disk insgesamt.
- Versionen: Kubernetes 1.35.0, Ubuntu-containerd 1.7, Cilium 1.19.0, Helm 3.
- Aufgaben: System vorbereiten, Runtime einrichten, Control Plane initialisieren, CNI installieren, Worker verbinden, zwei nginx-Replikate prüfen.
- Validierung: manuelle Checkpoints in der Webseite; echte Prüfungen über kubeadm, systemctl und kubectl im externen Terminal.
- Reset: alle VMs aus dem ursprünglichen Snapshot wiederherstellen. Nur kubeadm reset ist kein vollständiger Reset.
- Netzwerk: Beispiel 192.168.56.0/24 für VMs, 10.244.0.0/16 für Pods, 10.96.0.0/12 für Services. An die eigene Umgebung anpassen; keine Überlappungen.
- Status: Anleitung anhand der Upstream-Dokumentation erstellt, noch nicht als vollständiges VM-Lab automatisiert verifiziert.

Für 0.2 ist die VM-Verifikation zugunsten des Architektur-Referenzmoduls zurückgestellt. `export-steps.mjs` und `verify-vms.py` sind vorbereitete, noch nicht durch einen erfolgreichen vollständigen Lauf bestätigte Testwerkzeuge. Sie gehören nicht zum Browser oder zum CI-Nachweis. Der Python-Harness benötigt separat bereitgestellte QEMU-Werkzeuge, ein per SHA-256 geprüftes Ubuntu-Cloud-Image und geeignete Virtualisierung; er darf nur mit einem eigens dafür angelegten Testverzeichnis verwendet werden. Kein VM-Erfolg wird aus den Browser-Tests abgeleitet.

Quellen: [kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/), [Cilium 1.19](https://docs.cilium.io/en/v1.19/installation/k8s-install-kubeadm/), [Kubernetes-Ports](https://kubernetes.io/docs/reference/networking/ports-and-protocols/).
