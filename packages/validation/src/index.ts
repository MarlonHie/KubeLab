import { parseAllDocuments } from "yaml";
import Ajv from "ajv";
import type { Resource } from "../../cluster-model/src";
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile({
  type: "object",
  required: ["apiVersion", "kind", "metadata", "spec"],
  properties: {
    apiVersion: { type: "string" },
    kind: { enum: ["Deployment", "Pod", "Service"] },
    metadata: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          maxLength: 63,
          pattern: "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$",
        },
        namespace: {
          type: "string",
          maxLength: 63,
          pattern: "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$",
        },
        labels: { type: "object", additionalProperties: { type: "string" } },
      },
    },
    spec: { type: "object" },
  },
});
const object = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function validateYaml(source: string): {
  resources: Resource[];
  errors: string[];
} {
  const resources: Resource[] = [];
  const errors: string[] = [];
  if (source.length > 100000)
    return { resources, errors: ["Maximal 100 KB pro Manifest."] };
  try {
    const documents = parseAllDocuments(source);
    if (!documents.length) errors.push("Das Manifest ist leer.");
    for (const [i, doc] of documents.entries()) {
      const label = `Dokument ${i + 1}`;
      if (doc.errors.length) {
        errors.push(...doc.errors.map((e) => `${label}: ${e.message}`));
        continue;
      }
      const r = doc.toJS({ maxAliasCount: 50 });
      if (!validate(r)) {
        errors.push(`${label}: ${ajv.errorsText(validate.errors)}`);
        continue;
      }
      const value = r as Resource;
      const s = value.spec;
      if (value.apiVersion !== (value.kind === "Deployment" ? "apps/v1" : "v1"))
        errors.push(`${label}: Ungültige apiVersion für ${value.kind}.`);
      if (value.kind === "Deployment") {
        if (
          s.replicas !== undefined &&
          (!Number.isInteger(s.replicas) || s.replicas < 0 || s.replicas > 20)
        )
          errors.push(
            `${label}: replicas muss eine ganze Zahl von 0 bis 20 sein (Simulationslimit).`,
          );
        const labels = s.template?.metadata?.labels;
        const match = s.selector?.matchLabels;
        if (
          !object(match) ||
          !Object.keys(match).length ||
          !object(labels) ||
          !Object.entries(match).every(
            ([k, v]) => typeof v === "string" && labels[k] === v,
          )
        )
          errors.push(
            `${label}: selector.matchLabels muss zu template.metadata.labels passen.`,
          );
      }
      if (value.kind === "Deployment" || value.kind === "Pod") {
        const c =
          value.kind === "Pod" ? s.containers : s.template?.spec?.containers;
        if (
          !Array.isArray(c) ||
          !c.length ||
          !c.every(
            (x) =>
              object(x) &&
              typeof x.name === "string" &&
              x.name.length > 0 &&
              typeof x.image === "string" &&
              x.image.length > 0,
          )
        )
          errors.push(`${label}: Jeder Container benötigt name und image.`);
      }
      if (value.kind === "Service") {
        if (
          !object(s.selector) ||
          !Object.keys(s.selector).length ||
          !Object.values(s.selector).every((x) => typeof x === "string")
        )
          errors.push(
            `${label}: Ein Service benötigt einen selector mit Textwerten.`,
          );
        if (
          !Array.isArray(s.ports) ||
          !s.ports.length ||
          !s.ports.every(
            (p: unknown) =>
              object(p) &&
              Number.isInteger(p.port) &&
              p.port > 0 &&
              p.port <= 65535,
          )
        )
          errors.push(
            `${label}: ports benötigt gültige Ports von 1 bis 65535.`,
          );
      }
      resources.push(value);
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Ungültiges YAML.");
  }
  return { resources: errors.length ? [] : resources, errors };
}
