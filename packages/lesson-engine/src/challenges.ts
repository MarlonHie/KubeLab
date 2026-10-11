import {
  initialRaft,
  initialScheduler,
  raftStep,
  schedulerStep,
  type RaftLab,
  type SchedulerLab,
} from "../../simulation-engine/src/deep-labs";
export const challengeModels = {
  "raft-partition-v1": "raft-internals",
  "scheduler-pipeline-v1": "scheduler-internals",
} as const;
export type ChallengeId = keyof typeof challengeModels;
type Checkpoint<S> = {
  action: string;
  label: string;
  guard: (before: S, after: S) => boolean;
};
const raft: Checkpoint<RaftLab>[] = [
  {
    action: "write",
    label: "Vorschlag ohne Commit",
    guard: (b, a) =>
      b.members[0].log.length === 0 &&
      a.members[0].commit === 0 &&
      a.members[0].log.length === 1,
  },
  {
    action: "replicate",
    label: "Mehrheit repliziert Index 1",
    guard: (_, a) => a.members.every((m) => m.commit === 1 && m.revision === 0),
  },
  {
    action: "apply",
    label: "Commit wird KV-Revision 1",
    guard: (_, a) => a.members.every((m) => m.revision === 1),
  },
  {
    action: "partition",
    label: "Leader von Mehrheit trennen",
    guard: (_, a) => a.network === "split" && a.leader === 0,
  },
  {
    action: "write",
    label: "Minderheits-Write bleibt unbestätigt",
    guard: (b, a) =>
      a.members[0].log.length === 2 &&
      a.members[0].commit === b.members[0].commit &&
      a.members[1].log.length === 1,
  },
  {
    action: "replicate",
    label: "Minderheit kann Commit nicht erhöhen",
    guard: (b, a) =>
      a.network === "split" &&
      a.leader === 0 &&
      a.members[0].commit === b.members[0].commit,
  },
  {
    action: "elect",
    label: "Mehrheit wählt Term 2 mit No-op",
    guard: (_, a) =>
      a.leader === 1 &&
      a.members[1].term === 2 &&
      a.members[0].term === 1 &&
      a.members[1].log[1].kind === "noop",
  },
  {
    action: "replicate",
    label: "No-op im neuen Term bestätigt",
    guard: (_, a) =>
      a.members[1].commit === 2 &&
      a.members[2].commit === 2 &&
      a.members[0].commit === 1,
  },
  {
    action: "apply",
    label: "No-op lässt KV-Revision unverändert",
    guard: (_, a) => a.members[1].applied === 2 && a.members[1].revision === 1,
  },
  {
    action: "write",
    label: "Neue Änderung bei Mehrheit vorschlagen",
    guard: (_, a) => a.members[1].log.length === 3 && a.members[1].commit === 2,
  },
  {
    action: "replicate",
    label: "Änderung bei Mehrheit bestätigen",
    guard: (_, a) => a.members[1].commit === 3 && a.members[0].commit === 1,
  },
  {
    action: "apply",
    label: "Mehrheit erreicht KV-Revision 2",
    guard: (_, a) => a.members[1].revision === 2 && a.members[0].revision === 1,
  },
  {
    action: "heal",
    label: "Unbestätigten Suffix ersetzen",
    guard: (_, a) =>
      a.network === "connected" &&
      a.members[0].log[1].kind === "noop" &&
      a.members[0].term === 2,
  },
  {
    action: "apply",
    label: "Alle Replikate wenden denselben Commit an",
    guard: (_, a) =>
      a.members.every(
        (m) =>
          m.revision === 2 && m.applied === 3 && m.value === a.members[1].value,
      ),
  },
  {
    action: "isolate",
    label: "Mehrheit vollständig verlieren",
    guard: (_, a) => a.network === "isolated",
  },
  {
    action: "write",
    label: "Vorschlag ohne Mehrheit",
    guard: (_, a) => a.members[1].log.length === 4 && a.members[1].commit === 3,
  },
  {
    action: "replicate",
    label: "Ohne Quorum kein weiterer Commit",
    guard: (b, a) =>
      a.network === "isolated" &&
      a.members.every(
        (m, i) => m.commit === b.members[i].commit && m.revision === 2,
      ),
  },
];
const scheduler: Checkpoint<SchedulerLab>[] = [
  {
    action: "filter",
    label: "PV-Zone und Anti-Affinity filtern",
    guard: (_, a) =>
      a.stage === "filtered" &&
      a.candidates.filter((c) => !c.reasons.length).length === 2,
  },
  {
    action: "score",
    label: "Nur zulässige Nodes bewerten",
    guard: (_, a) =>
      a.selected === "worker-d" && a.candidates[0].score === null,
  },
  {
    action: "reserve",
    label: "Reservierung vor Binding",
    guard: (_, a) => a.reserved && !a.bound,
  },
  {
    action: "permit",
    label: "Permit erlaubt den Binding-Zyklus",
    guard: (_, a) => a.stage === "permitted",
  },
  {
    action: "fail",
    label: "PreBind-Fehler führt zu Unreserve",
    guard: (b, a) =>
      b.reserved && !a.reserved && !a.bound && a.stage === "failed",
  },
  {
    action: "retry",
    label: "Fehlgeschlagenen Versuch erneut einreihen",
    guard: (b, a) => b.stage === "failed" && a.stage === "queue",
  },
  {
    action: "filter",
    label: "Neuer Versuch prüft Filter erneut",
    guard: (_, a) => a.stage === "filtered",
  },
  {
    action: "score",
    label: "Neuer Versuch bewertet Kandidaten",
    guard: (_, a) => a.stage === "scored",
  },
  {
    action: "reserve",
    label: "Erneut reservieren",
    guard: (_, a) => a.reserved && !a.bound,
  },
  {
    action: "permit",
    label: "Erneut Permit durchlaufen",
    guard: (_, a) => a.stage === "permitted",
  },
  {
    action: "prebind",
    label: "PreBind-Voraussetzungen erfüllt",
    guard: (_, a) => a.stage === "prebound" && !a.bound,
  },
  {
    action: "bind",
    label: "Erst jetzt binden; noch keine Readiness",
    guard: (_, a) => a.stage === "bound" && a.bound && !a.reserved,
  },
];
export function challengeSteps(id: ChallengeId) {
  return (id === "raft-partition-v1" ? raft : scheduler).map(
    ({ action, label }) => ({ action, label }),
  );
}
function verify<S>(
  steps: Checkpoint<S>[],
  initial: S,
  reduce: (s: S, a: string) => S,
  actions: readonly string[],
) {
  let state = initial,
    passed = 0,
    invalid = false;
  for (const action of actions) {
    const next = reduce(state, action),
      step = steps[passed];
    if (!step || action !== step.action || !step.guard(state, next)) {
      invalid = true;
      break;
    }
    passed++;
    state = next;
  }
  return steps.map((step, i) => ({
    label: step.label,
    passed: !invalid && i < passed,
  }));
}
// Replay from a known initial state: neither arbitrary event sets nor client-supplied snapshots grant credit.
// Strict guided sequences deliberately require reset after a deviation; unrestricted exploration remains available.
export function checkChallenge(id: ChallengeId, actions: readonly string[]) {
  return id === "raft-partition-v1"
    ? verify(raft, initialRaft(), raftStep, actions)
    : verify(scheduler, initialScheduler(), schedulerStep, actions);
}
