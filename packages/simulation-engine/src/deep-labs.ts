// Deterministic teaching models, not implementations of Raft or the Scheduling Framework.
export type DeepModel = "raft-internals" | "scheduler-internals";
export interface Entry {
  term: number;
  kind: "put" | "noop";
  value: string;
}
export interface Member {
  term: number;
  log: Entry[];
  commit: number;
  applied: number;
  revision: number;
  value: string;
}
export interface RaftLab {
  members: Member[];
  leader: number;
  network: "connected" | "split" | "isolated";
  message: string;
}
export const raftActions: Record<string, string> = {
  write: "Write vorschlagen",
  replicate: "Replizieren und Commit prüfen",
  apply: "Commit lokal anwenden",
  partition: "Partition 1 | 2+3",
  elect: "Mehrheit wählt Leader",
  heal: "Netz heilen und Logs abgleichen",
  isolate: "Alle Mitglieder isolieren",
};
export function initialRaft(): RaftLab {
  return {
    members: Array.from({ length: 3 }, () => ({
      term: 1,
      log: [],
      commit: 0,
      applied: 0,
      revision: 0,
      value: "–",
    })),
    leader: 0,
    network: "connected",
    message: "Leeres Modell-Log, Term 1. Alle Werte sind Simulationszustand.",
  };
}
function peers(s: RaftLab): number[] {
  return [0, 1, 2].filter(
    (i) =>
      s.network === "connected" ||
      i === s.leader ||
      (s.network === "split" && s.leader > 0 && i > 0),
  );
}
export function raftStep(before: RaftLab, action: string): RaftLab {
  const s = structuredClone(before),
    leader = s.members[s.leader];
  const group = peers(s);
  s.message = "Aktion passt nicht zum aktuellen Zustand; keine Änderung.";
  if (action === "write") {
    leader.log.push({
      term: leader.term,
      kind: "put",
      value: `Wert-${leader.term}-${leader.log.length + 1}`,
    });
    s.message =
      group.length < 2
        ? "Nur lokaler Log-Eintrag. Keine Mehrheit, kein Commit, kein bestätigter Write."
        : "Vorschlag im Leader-Log. Noch kein Commit und keine KV-Änderung.";
  } else if (action === "replicate") {
    if (group.length < 2)
      s.message = "Keine Mehrheit: Commit-Index bleibt unverändert.";
    else if (leader.log.length && leader.log.at(-1)!.term === leader.term) {
      leader.commit = leader.log.length;
      for (const i of group) {
        s.members[i].term = leader.term;
        s.members[i].log = structuredClone(leader.log);
        s.members[i].commit = leader.commit;
      }
      s.message =
        "Mehrheit hat das Log bis zum aktuellen Term repliziert. Commit sichtbar, Anwendung folgt separat.";
    }
  } else if (action === "apply") {
    // Application is local and may continue on an isolated member for already committed entries.
    for (const m of s.members) {
      for (let i = m.applied; i < m.commit; i++)
        if (m.log[i].kind === "put") {
          m.revision++;
          m.value = m.log[i].value;
        }
      m.applied = m.commit;
    }
    s.message =
      "Jedes Mitglied wendet nur seinen bekannten Commit-Präfix an. No-op erhöht die KV-Revision nicht.";
  } else if (
    action === "partition" &&
    s.network === "connected" &&
    s.leader === 0
  ) {
    s.network = "split";
    s.message =
      "etcd-1 ist isoliert. etcd-2 und etcd-3 können sich erreichen. Timer sind angehalten.";
  } else if (action === "elect" && s.network === "split" && s.leader === 0) {
    s.leader = 1;
    const next = s.members[1];
    next.term++;
    // Both voters have identical logs in this fixed scenario. New leader appends a current-term no-op.
    next.log.push({ term: next.term, kind: "noop", value: "–" });
    s.members[2].term = next.term;
    s.message =
      "etcd-2 gewinnt 2 Stimmen, beginnt Term 2 und schlägt einen No-op vor. etcd-1 kennt den neuen Term noch nicht.";
  } else if (action === "heal" && s.network === "split" && s.leader === 1) {
    s.network = "connected";
    for (const m of s.members) {
      m.term = leader.term;
      m.log = structuredClone(leader.log);
      m.commit = leader.commit;
    }
    s.message =
      "etcd-1 sieht den höheren Term und folgt. Sein unbestätigter Suffix wird ersetzt; bestätigte Einträge bleiben erhalten. Apply steht separat aus.";
  } else if (action === "isolate") {
    s.network = "isolated";
    s.message =
      "Drei getrennte Gruppen: keine kann zwei Stimmen erreichen. Das Quorum bleibt 2.";
  }
  return s;
}
export interface Candidate {
  name: string;
  free: number;
  zone: string;
  sameApp: number;
  reasons: string[];
  score: number | null;
}
export interface SchedulerLab {
  stage:
    | "queue"
    | "filtered"
    | "scored"
    | "reserved"
    | "permitted"
    | "prebound"
    | "bound"
    | "failed";
  candidates: Candidate[];
  selected: string | null;
  reserved: boolean;
  bound: boolean;
  message: string;
}
export const schedulerActions: Record<string, string> = {
  filter: "PreFilter und Filter",
  score: "PreScore und Score",
  reserve: "Reserve",
  permit: "Permit erlauben",
  prebind: "PreBind erfolgreich",
  fail: "PreBind fehlschlägt → Unreserve",
  bind: "Bind und PostBind",
  retry: "Erneut einreihen",
  preemption: "Preemption analysieren",
};
export function initialScheduler(): SchedulerLab {
  return {
    stage: "queue",
    candidates: [
      {
        name: "worker-a",
        free: 4,
        zone: "a",
        sameApp: 0,
        reasons: [],
        score: null,
      },
      {
        name: "worker-b",
        free: 2,
        zone: "b",
        sameApp: 0,
        reasons: [],
        score: null,
      },
      {
        name: "worker-c",
        free: 4,
        zone: "b",
        sameApp: 1,
        reasons: [],
        score: null,
      },
      {
        name: "worker-d",
        free: 3,
        zone: "b",
        sameApp: 0,
        reasons: [],
        score: null,
      },
    ],
    selected: null,
    reserved: false,
    bound: false,
    message:
      "Pod: CPU-Request 2, PV-Zone b, harte Pod-Anti-Affinity für dieselbe App. Noch nicht gebunden.",
  };
}
export function schedulerStep(
  before: SchedulerLab,
  action: string,
): SchedulerLab {
  const s = structuredClone(before);
  s.message =
    "Dieser Erweiterungspunkt ist in der aktuellen Phase nicht erreichbar.";
  if (action === "filter" && s.stage === "queue") {
    for (const c of s.candidates)
      c.reasons = [
        c.free < 2 ? "CPU-Request passt nicht" : "",
        c.zone !== "b" ? "PV-Node-Affinity: falsche Zone" : "",
        c.sameApp ? "harte Pod-Anti-Affinity" : "",
      ].filter(Boolean);
    s.stage = "filtered";
    s.message =
      "worker-a und worker-c ausgeschlossen. Nur worker-b und worker-d gelangen zum Scoring.";
  } else if (action === "score" && s.stage === "filtered") {
    for (const c of s.candidates)
      if (!c.reasons.length) c.score = (c.free - 2) * 10;
    s.selected = [...s.candidates]
      .filter((c) => c.score !== null)
      .sort((a, b) => b.score! - a.score!)[0].name;
    s.stage = "scored";
    s.message =
      "Lehrformel: (freie CPU − Request) × 10. worker-d gewinnt. Dies sind keine Kubernetes-Standardgewichte.";
  } else if (action === "reserve" && s.stage === "scored") {
    s.reserved = true;
    s.stage = "reserved";
    s.message =
      "Modell-Reservierung im Scheduler. Noch kein API-Binding und kein laufender Pod.";
  } else if (action === "permit" && s.stage === "reserved") {
    s.stage = "permitted";
    s.message =
      "Permit lässt den Binding-Zyklus weiterlaufen; reale Plugins können warten oder ablehnen.";
  } else if (action === "fail" && s.stage === "permitted") {
    s.reserved = false;
    s.selected = null;
    s.stage = "failed";
    s.message =
      "Simulierter Volume-Binding-Fehler in PreBind: Unreserve gibt die Reservierung frei. Kein Binding erfolgt.";
  } else if (action === "prebind" && s.stage === "permitted") {
    s.stage = "prebound";
    s.message =
      "Volume-Binding-Voraussetzung erfüllt. Das Mounten erfolgt später am Node, nicht im Scheduler.";
  } else if (action === "bind" && s.stage === "prebound" && s.reserved) {
    s.stage = "bound";
    s.bound = true;
    s.reserved = false;
    s.message =
      "Binding ordnet den Pod worker-d zu. PostBind folgt. Containerstart und Readiness sind weiterhin Aufgaben des kubelet.";
  } else if (action === "retry" && s.stage === "failed")
    return initialScheduler();
  else if (action === "preemption" && s.stage === "filtered")
    s.message =
      "Es gibt zulässige Nodes: PostFilter/Preemption ist hier nicht nötig. Selbst ohne Kandidaten könnte das Verdrängen von Pods die PV-Zone von worker-a nicht ändern.";
  return s;
}
export function replayRaft(actions: readonly string[]) {
  return actions.reduce(raftStep, initialRaft());
}
export function replayScheduler(actions: readonly string[]) {
  return actions.reduce(schedulerStep, initialScheduler());
}
