import { type Cluster } from "../../cluster-model/src";
import { defaultManifest } from "../../simulation-engine/src";
import {
  scenarios,
  type ScenarioId,
} from "../../simulation-engine/src/scenarios";
import { validateYaml } from "../../validation/src";
export interface LabState {
  version: 1;
  source: string;
  cluster: Cluster;
  scenario: ScenarioId | null;
  lastOutput: string;
  appliedSource: string | null;
}
export function freshLab(): LabState {
  return {
    version: 1,
    source: defaultManifest,
    cluster: { resources: [], revision: 0 },
    scenario: null,
    lastOutput: "Simulation bereit. Wende dein erstes Manifest an.",
    appliedSource: null,
  };
}
export function parseLab(value: unknown): LabState {
  const v = value as LabState;
  if (
    !v ||
    v.version !== 1 ||
    typeof v.source !== "string" ||
    v.source.length > 100000 ||
    !v.cluster ||
    !Array.isArray(v.cluster.resources) ||
    v.cluster.resources.length > 100 ||
    !Number.isSafeInteger(v.cluster.revision) ||
    v.cluster.revision < 0 ||
    !([null, ...scenarios.map((s) => s.id)] as unknown[]).includes(
      v.scenario,
    ) ||
    typeof v.lastOutput !== "string" ||
    v.lastOutput.length > 100000 ||
    (v.appliedSource !== null &&
      (typeof v.appliedSource !== "string" || v.appliedSource.length > 100000))
  )
    throw new Error("Ungültiger Lab-Speicherstand (Version 1 erwartet).");
  const encoded = JSON.stringify(v.cluster.resources);
  if (encoded.length > 1000000)
    throw new Error("Der simulierte Cluster ist zu groß.");
  const identities = new Set<string>();
  for (const resource of v.cluster.resources) {
    const checked = validateYaml(JSON.stringify(resource));
    if (checked.errors.length)
      throw new Error(
        "Ungültige Ressource im gespeicherten Cluster: " + checked.errors[0],
      );
    const key = [
      resource.kind,
      resource.metadata.namespace || "default",
      resource.metadata.name,
    ].join("/");
    if (identities.has(key))
      throw new Error("Doppelte Ressource im gespeicherten Cluster.");
    identities.add(key);
  }
  return JSON.parse(
    JSON.stringify({
      version: 1,
      source: v.source,
      cluster: v.cluster,
      scenario: v.scenario,
      lastOutput: v.lastOutput,
      appliedSource: v.appliedSource,
    }),
  );
}
