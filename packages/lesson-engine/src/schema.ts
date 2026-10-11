import { challengeModels } from "./challenges";
import { diagnosticCases } from "../../simulation-engine/src/diagnosis";
import Ajv from "ajv";
import schema from "../lesson.schema.json" with { type: "json" };
import type { Lesson } from "./types";
import { experimentEvents } from "./experiments";
const validate = new Ajv({ allErrors: true }).compile<Lesson>(schema);
export function parseLesson(value: unknown): Lesson {
  if (!validate(value))
    throw new Error(
      "Ungültige Lektion: " +
        validate.errors
          ?.map((e) => `${e.instancePath} ${e.message}`)
          .join("; "),
    );
  const lesson = value;
  const ids = new Set<string>();
  const experiments = new Map<string, keyof typeof experimentEvents>();
  let quizCount = 0;
  function unique(id: string) {
    if (ids.has(id)) throw new Error(`${lesson.id}: Doppelte Inhalts-ID ${id}`);
    ids.add(id);
  }
  for (const section of lesson.sections) {
    unique(section.id);
    for (const b of section.blocks) {
      if ("id" in b) unique(b.id);
      if (b.type === "experiment") experiments.set(b.id, b.kind);
      if (
        b.type === "table" &&
        b.rows.some((r) => r.length !== b.headers.length)
      )
        throw new Error(
          `${lesson.id}: Tabelle hat unterschiedlich viele Spalten`,
        );
      if (b.type === "quiz") {
        quizCount++;
        const questions = new Set<string>();
        for (const q of b.questions) {
          if (questions.has(q.id) || q.correct >= q.answers.length)
            throw new Error(`${lesson.id}: Ungültige Quizfrage ${q.id}`);
          questions.add(q.id);
        }
      }
      if (b.type === "task") {
        const v = b.verification;
        if (v.kind === "diagnosis" && !Object.hasOwn(diagnosticCases, v.caseId))
          throw new Error(`${lesson.id}: Unbekannter Diagnosefall`);
        if (
          v.kind === "matching" &&
          v.items.some((i) => !v.options.includes(i.answer))
        )
          throw new Error(`${lesson.id}: Unbekannte Zuordnungslösung`);
        if (
          v.kind === "state-machine" &&
          experiments.get(v.experimentId) !== challengeModels[v.challengeId]
        )
          throw new Error(`${lesson.id}: Ungültige Zustandsmaschinen-Prüfung`);
        if (v.kind === "experiment") {
          const kind = experiments.get(v.experimentId);
          if (
            !kind ||
            v.requirements.some(
              (r) => !experimentEvents[kind].includes(r.event),
            ) ||
            new Set(v.requirements.map((r) => r.event)).size !==
              v.requirements.length
          )
            throw new Error(
              `${lesson.id}: Ungültige Experiment-Prüfung für ${v.experimentId}`,
            );
        }
      }
    }
  }
  if (quizCount !== 1)
    throw new Error(
      `${lesson.id}: Genau ein Wissenscheck pro Lektion erforderlich`,
    );
  return lesson;
}
export function parseCatalog(values: unknown[]): Lesson[] {
  const lessons = values.map(parseLesson);
  if (new Set(lessons.map((l) => l.id)).size !== lessons.length)
    throw new Error("Doppelte Lektions-ID");
  return lessons;
}
