export const buildSteps = [
  {
    title: "Deine Lab-Umgebung vorbereiten",
    tag: "AUF ALLEN NODES",
    text: "Nutze drei frische Ubuntu-24.04-VMs mit systemd, eindeutigen Hostnamen, statischen IPs und gegenseitiger Erreichbarkeit. Reserviere insgesamt mindestens 6 vCPU, 8 GB RAM und 60 GB Disk. Erstelle vor dem Start VM-Snapshots. Beispiel: control-01 = 192.168.56.10, worker-01 = .11, worker-02 = .12. Passe diese Adressen an dein VM-Netz an; Pod-Netz 10.244.0.0/16 und Service-Netz 10.96.0.0/12 dürfen sich damit nicht überschneiden.",
    code: "hostnamectl\nip -br address\nfree -h\nnproc\ntimedatectl status",
    check:
      "Drei isolierte VMs sind erreichbar, ihre Uhren synchronisiert und die Ressourcen vorhanden.",
    hint: "Linux: nutze KVM/libvirt oder deine vorhandene Virtualisierung. Windows/WSL2: führe kubectl bei Bedarf in WSL aus, verwende für dieses Mehrnode-Lab jedoch separate Linux-VMs. Drei WSL-Shells sind keine drei Nodes.",
  },
  {
    title: "Linux für Kubernetes konfigurieren",
    tag: "AUF ALLEN NODES",
    text: "Die folgenden Befehle verändern ausschließlich deine dedizierten Lab-VMs. Deaktiviere Swap und aktiviere Forwarding sowie die nötigen Kernelmodule. Entferne zusätzlich den Swap-Eintrag in /etc/fstab, damit Swap nach einem Neustart deaktiviert bleibt.",
    code: 'sudo swapoff -a\nsudo modprobe overlay\nsudo modprobe br_netfilter\nprintf "overlay\\nbr_netfilter\\n" | sudo tee /etc/modules-load.d/kubelab.conf\nprintf "net.bridge.bridge-nf-call-iptables = 1\\nnet.ipv4.ip_forward = 1\\nnet.bridge.bridge-nf-call-ip6tables = 1\\n" | sudo tee /etc/sysctl.d/99-kubelab.conf\nsudo sysctl --system\nswapon --show',
    check: "swapon --show ist leer und net.ipv4.ip_forward ist 1.",
    hint: "Öffne die erforderlichen Ports nur zwischen den Lab-VMs: API 6443/TCP, kubelet 10250/TCP und Cilium VXLAN 8472/UDP. etcd 2379–2380/TCP bleibt auf die Control Plane beschränkt. Beachte die vollständige Portliste in der Kubernetes-Dokumentation.",
  },
  {
    title: "containerd installieren",
    tag: "AUF ALLEN NODES",
    text: "Ubuntu 24.04 stellt containerd 1.7 über seine Paketquellen bereit. Verwende den systemd-cgroup-Treiber für Runtime und kubelet. Die folgende Konfiguration ist für containerd 1.x vorgesehen.",
    code: 'sudo apt-get update\nsudo apt-get install -y containerd apt-transport-https ca-certificates curl gpg\nsudo mkdir -p /etc/containerd\ncontainerd config default | sudo tee /etc/containerd/config.toml >/dev/null\nsudo sed -i "s/SystemdCgroup = false/SystemdCgroup = true/" /etc/containerd/config.toml\nsudo systemctl enable --now containerd\nsudo systemctl restart containerd\ncontainerd --version\nsudo systemctl is-active containerd',
    check:
      "containerd ist active und die Konfiguration enthält SystemdCgroup = true.",
    hint: "Bei containerd 2.x ist die Konfigurationsstruktur anders. Nutze für dieses Lab das Ubuntu-24.04-Paket und keine zusätzliche Docker-Paketquelle.",
  },
  {
    title: "kubeadm, kubelet und kubectl installieren",
    tag: "AUF ALLEN NODES · KUBERNETES 1.35.0",
    text: "Dieses Lab verwendet bewusst Kubernetes 1.35.0 als festen Übungsstand. Alle Nodes erhalten dieselbe Version. Die Versionsbindung dient der Reproduzierbarkeit und ist keine Empfehlung für produktive Cluster.",
    code: 'sudo mkdir -p /etc/apt/keyrings\ncurl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg\necho "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list\nsudo apt-get update\nsudo apt-get install -y kubelet=1.35.0-1.1 kubeadm=1.35.0-1.1 kubectl=1.35.0-1.1\nsudo apt-mark hold kubelet kubeadm kubectl\nsudo systemctl enable kubelet\nkubeadm version -o short',
    check: "kubeadm meldet v1.35.0.",
    hint: "kubelet darf vor kubeadm init oder join wiederholt neu starten. Bei Paketfehlern prüfe mit apt-cache madison kubeadm, ob Version und Repository übereinstimmen.",
  },
  {
    title: "Die Control Plane initialisieren",
    tag: "NUR AUF CONTROL-01",
    text: "Ersetze die Beispiel-IP durch die tatsächliche IP deiner Control Plane. Bewahre den ausgegebenen Join-Befehl lokal auf: Er enthält ein temporäres Zugangstoken. Kopiere keine kubeconfig und keine Tokens in die Webseite.",
    code: 'sudo kubeadm init --kubernetes-version=v1.35.0 --apiserver-advertise-address=192.168.56.10 --pod-network-cidr=10.244.0.0/16\nmkdir -p "$HOME/.kube"\nsudo cp /etc/kubernetes/admin.conf "$HOME/.kube/config"\nsudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"\nkubectl get nodes\nkubectl get pods -n kube-system',
    check:
      "Die Control Plane ist registriert; NotReady und Pending bei CoreDNS sind vor der CNI-Installation erwartbar.",
    hint: "Bei einer falschen IP stelle den frischen VM-Snapshot wieder her. Verwende keine --ignore-preflight-errors-Pauschalausnahme.",
  },
  {
    title: "Pod-Netzwerk und Worker verbinden",
    tag: "CONTROL-01, DANACH WORKER",
    text: "Installiere Helm 3 nach der offiziellen Helm-Anleitung auf control-01. Cilium 1.19.0 wird mit explizitem Pod-CIDR installiert; kube-proxy bleibt aktiv. Erzeuge danach einen Join-Befehl und führe genau diesen mit sudo auf beiden Workern aus.",
    code: 'helm repo add cilium https://helm.cilium.io/\nhelm repo update\nhelm install cilium cilium/cilium --version 1.19.0 --namespace kube-system --set ipam.operator.clusterPoolIPv4PodCIDRList="{10.244.0.0/16}"\nsudo kubeadm token create --print-join-command\n# Den ausgegebenen kubeadm join-Befehl mit sudo auf worker-01 und worker-02 ausführen.\nkubectl -n kube-system rollout status daemonset/cilium --timeout=180s\nkubectl get nodes',
    check: "Alle drei Nodes melden Ready und CoreDNS ist Running.",
    hint: "Falls ein Worker NotReady bleibt, prüfe containerd, kubelet-Journal, Cilium-Pods und die VM-Firewall. Bei abgelaufenem Token erzeuge einen neuen Join-Befehl.",
  },
  {
    title: "Deinen ersten Workload prüfen",
    tag: "AUF CONTROL-01",
    text: "Erzeuge zwei nginx-Replikate. Prüfe ihre Verteilung und teste die Anwendung per Port-Forward. Der zweite Befehl läuft im Vordergrund; führe curl in einer weiteren Shell derselben VM aus.",
    code: "kubectl create deployment hello-kubelab --image=nginx:1.28 --replicas=2\nkubectl rollout status deployment/hello-kubelab --timeout=180s\nkubectl get pods -o wide\nkubectl port-forward deployment/hello-kubelab 8080:80\n# In einer zweiten Shell:\ncurl http://127.0.0.1:8080\n# Nach dem Test: Port-Forward mit Strg+C beenden.\nkubectl delete deployment hello-kubelab",
    check: "Beide Pods sind Running und nginx beantwortet die HTTP-Anfrage.",
    hint: "Reset: Stelle alle drei VM-Snapshots von vor dem Lab wieder her. kubeadm reset allein entfernt nicht alle CNI-, Firewall- und kubeconfig-Reste. Für diese Übung ist der Snapshot der definierte Ausgangszustand.",
  },
];
