export interface QuorumState {
  members: boolean[];
  leader: number | null;
  revision: number;
  term: number;
}
export const initialQuorum = (): QuorumState => ({
  members: [true, true, true],
  leader: 0,
  revision: 0,
  term: 1,
});
export const majority = (total: number) => Math.floor(total / 2) + 1;
export function canCommit(state: QuorumState) {
  return (
    state.leader !== null &&
    state.members[state.leader] &&
    state.members.filter(Boolean).length >= majority(state.members.length)
  );
}
export function toggleMember(state: QuorumState, index: number): QuorumState {
  if (index < 0 || index >= state.members.length)
    throw new Error("Unbekanntes Mitglied");
  const members = state.members.map((up, i) => (i === index ? !up : up));
  return {
    ...state,
    members,
    leader:
      state.leader !== null && members[state.leader] ? state.leader : null,
  };
}
export function electLeader(state: QuorumState): QuorumState {
  if (state.members.filter(Boolean).length < majority(state.members.length))
    return state;
  if (state.leader !== null && state.members[state.leader]) return state;
  return {
    ...state,
    leader: state.members.findIndex(Boolean),
    term: state.term + 1,
  };
}
export function commitWrite(state: QuorumState) {
  return canCommit(state) ? { ...state, revision: state.revision + 1 } : state;
}
export function apiRequest(
  identity: boolean,
  authorized: boolean,
  admitted: boolean,
) {
  const names = [
    "Authentifizierung",
    "Autorisierung",
    "Objektprüfung & Admission",
    "Persistenz",
  ];
  const failed = !identity ? 0 : !authorized ? 1 : !admitted ? 2 : null;
  return {
    steps: names.map((name, i) => ({
      name,
      state:
        failed === null || i < failed
          ? "passed"
          : i === failed
            ? "failed"
            : "waiting",
    })),
    accepted: failed === null,
    reason:
      failed === 0
        ? "401 · Identität nicht bestätigt"
        : failed === 1
          ? "403 · Operation nicht erlaubt"
          : failed === 2
            ? "Admission lehnt diese Änderung ab"
            : "Änderung akzeptiert; Workload-Bereitschaft ist noch offen",
  };
}
export function schedulingCandidates(
  cpu: number,
  forced: string,
  tainted: boolean,
  tolerated: boolean,
) {
  return [
    { name: "worker-01", cpu: 2 },
    { name: "worker-02", cpu: 4 },
  ].map((node) => ({
    ...node,
    reasons: [
      ...(cpu > node.cpu
        ? ["CPU-Request über freier planbarer Kapazität"]
        : []),
      ...(forced !== "auto" && forced !== node.name
        ? ["Harter Node-Wunsch passt nicht"]
        : []),
      ...(node.name === "worker-02" && tainted && !tolerated
        ? ["NoSchedule-Taint nicht toleriert"]
        : []),
    ],
  }));
}
export function runtimeResult(
  network: boolean,
  volume: boolean,
  image: boolean,
  ready: boolean,
) {
  if (!network)
    return {
      stage: 0,
      title: "Vorbereitung blockiert",
      detail: "Pod-Netzwerk kann nicht bereitgestellt werden.",
    };
  if (!volume)
    return {
      stage: 1,
      title: "Volume-Vorbereitung blockiert",
      detail: "Ein benötigtes Volume ist noch nicht nutzbar.",
    };
  if (!image)
    return {
      stage: 2,
      title: "ImagePullBackOff (Modell)",
      detail:
        "Das benötigte Image ist nicht verfügbar; kein erfolgreicher Containerstart.",
    };
  if (!ready)
    return {
      stage: 3,
      title: "Running · nicht Ready",
      detail: "Der Container läuft, aber die Readiness-Prüfung schlägt fehl.",
    };
  return {
    stage: 4,
    title: "Running · Ready",
    detail: "Im Modell sind alle Voraussetzungen und die Readiness erfüllt.",
  };
}
export const failureCases = {
  scheduler: {
    title: "Scheduler ausgefallen",
    existing: "Bestehende Container können weiterlaufen.",
    newPods:
      "Neue ungebundene Pods erhalten keine automatische Node-Zuweisung.",
    inspect: "Prüfe ungebundene Pending-Pods und die Scheduler-Verfügbarkeit.",
  },
  api: {
    title: "API Server unerreichbar",
    existing:
      "Bestehende lokale Workloads und Datenpfade können weiterarbeiten.",
    newPods:
      "Normale API-Schreibvorgänge und zentrale Koordination sind blockiert.",
    inspect:
      "Prüfe API-Endpunkt, Erreichbarkeit, Zertifikate und Serverzustand.",
  },
  controller: {
    title: "Controller Manager ausgefallen",
    existing: "Bestehende Workloads können weiterlaufen.",
    newPods:
      "Fehlende Replikate werden von den betroffenen Regelkreisen nicht ersetzt; bestehende Pod-Objekte könnten noch geplant werden.",
    inspect:
      "Vergleiche gewünschte Replikate mit vorhandenen ReplicaSets und Pods.",
  },
  worker: {
    title: "worker-01 ausgeschaltet",
    existing:
      "Container auf diesem Node sind gestoppt; andere Nodes können weiterarbeiten.",
    newPods:
      "Ersatz ist erst nach Erkennung und unter passenden Ressourcen- und Storage-Bedingungen möglich.",
    inspect:
      "Prüfe Node-Status, Events, Kapazität und Volumes. Der letzte API-Status kann veraltet sein.",
  },
  etcd: {
    title: "etcd ohne Mehrheit",
    existing: "Laufende Container müssen nicht sofort stoppen.",
    newPods:
      "Neue konsistente Zustandsänderungen können nicht bestätigt werden.",
    inspect:
      "Prüfe Mitgliedererreichbarkeit und Quorum. Keine unkontrollierte zweite Cluster-Wahrheit erzeugen.",
  },
};
