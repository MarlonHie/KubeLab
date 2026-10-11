import type { Experiment } from "./types";
// Only registered model observations can serve as practice evidence. No content-supplied code.
export const experimentEvents: Record<Experiment, readonly string[]> = {
  "raft-internals": [],
  "scheduler-internals": [],
  architecture: [],
  reconciliation: [],
  flow: [],
  failure: [],
  api: [
    "api.identity-rejected",
    "api.permission-rejected",
    "api.admission-rejected",
    "api.accepted",
  ],
  quorum: [
    "quorum.initial-write",
    "quorum.leader-missing",
    "quorum.recovered-write",
    "quorum.no-majority",
  ],
  scheduler: [
    "scheduler.capacity-blocked",
    "scheduler.taint-blocked",
    "scheduler.tolerated",
  ],
  runtime: [
    "runtime.network-blocked",
    "runtime.image-blocked",
    "runtime.not-ready",
    "runtime.ready",
  ],
};
export type ReportEvidence = (event: string | null) => void;
