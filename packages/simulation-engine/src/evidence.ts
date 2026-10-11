import {
  canCommit,
  schedulingCandidates,
  runtimeResult,
  type QuorumState,
} from "./architecture";
// Evidence is emitted only by explicit model actions; rendering the default state earns nothing.
export function quorumWriteEvidence(state: QuorumState): string | null {
  const alive = state.members.filter(Boolean).length;
  if (alive < 2) return "quorum.no-majority";
  if (state.leader === null) return "quorum.leader-missing";
  if (canCommit(state) && state.term > 1) return "quorum.recovered-write";
  if (canCommit(state) && alive === 3) return "quorum.initial-write";
  return null;
}
export function apiEvidence(
  identity: boolean,
  authorized: boolean,
  admitted: boolean,
) {
  return !identity
    ? "api.identity-rejected"
    : !authorized
      ? "api.permission-rejected"
      : !admitted
        ? "api.admission-rejected"
        : "api.accepted";
}
export function schedulerEvidence(
  cpu: number,
  forced: string,
  tainted: boolean,
  tolerated: boolean,
): string | null {
  const selected = schedulingCandidates(cpu, forced, tainted, tolerated).find(
    (n) => n.reasons.length === 0,
  );
  if (cpu === 3 && forced === "worker-01" && !selected)
    return "scheduler.capacity-blocked";
  if (cpu === 3 && forced === "worker-02" && tainted && !tolerated && !selected)
    return "scheduler.taint-blocked";
  if (
    cpu === 3 &&
    forced === "worker-02" &&
    tainted &&
    tolerated &&
    selected?.name === "worker-02"
  )
    return "scheduler.tolerated";
  return null;
}
export function runtimeEvidence(
  network: boolean,
  volume: boolean,
  image: boolean,
  ready: boolean,
): string | null {
  const { stage } = runtimeResult(network, volume, image, ready);
  return stage === 0
    ? "runtime.network-blocked"
    : stage === 2
      ? "runtime.image-blocked"
      : stage === 3
        ? "runtime.not-ready"
        : stage === 4
          ? "runtime.ready"
          : null;
}
