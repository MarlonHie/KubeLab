import { learningPaths } from "../../../../packages/lesson-engine/src/library";
import {
  lessons,
  practiceTasks,
  deepDiveTasks,
  practiceKey,
} from "../../../../packages/lesson-engine/src";
import { create } from "zustand";
import { get, set } from "idb-keyval";
export interface Progress {
  version: 5;
  readCompleted: string[];
  lastPath: string | null;
  recentLesson: string | null;
  theoryCompleted: string[];
  independentCompleted: string[];
  practiceCompleted: string[];
  checkpoints: number[];
  challenge: boolean;
  completedChallenges: string[];
  lastLesson: string;
  theme: "light" | "dark";
}
const defaults: Progress = {
  version: 5,
  readCompleted: [],
  lastPath: null,
  recentLesson: null,
  theoryCompleted: [],
  independentCompleted: [],
  practiceCompleted: [],
  checkpoints: [],
  challenge: false,
  completedChallenges: [],
  lastLesson: "cluster-basics",
  theme: "light",
};
const lessonIds = new Set(lessons.map((l) => l.id));
const taskIds = new Set(
  lessons.flatMap((l) => practiceTasks(l).map((t) => practiceKey(l.id, t.id))),
);
const independentIds = new Set(
  lessons.flatMap((l) => deepDiveTasks(l).map((t) => practiceKey(l.id, t.id))),
);
const validIds = (value: unknown, allowed: Set<string>): value is string[] =>
  Array.isArray(value) &&
  value.every((id) => typeof id === "string" && allowed.has(id));
export function parseProgress(value: unknown): Progress {
  if (!value || typeof value !== "object")
    throw new Error("Ungültiger KubeLab-Lernstand.");
  const v = value as Record<string, unknown>;
  const legacy = v.version === 1 || v.version === 2;
  const theory = legacy ? v.completed : v.theoryCompleted;
  if (
    (!legacy && v.version !== 3 && v.version !== 4 && v.version !== 5) ||
    !validIds(theory, lessonIds) ||
    (v.version === 5 &&
      (!validIds(v.readCompleted, lessonIds) ||
        !(
          v.lastPath === null || learningPaths.some((p) => p.id === v.lastPath)
        ) ||
        !(
          v.recentLesson === null ||
          (typeof v.recentLesson === "string" && lessonIds.has(v.recentLesson))
        ))) ||
    ((v.version === 4 || v.version === 5) &&
      (!validIds(v.independentCompleted, independentIds) ||
        !(v.independentCompleted as string[]).every(
          (id) =>
            Array.isArray(v.practiceCompleted) &&
            v.practiceCompleted.includes(id),
        ))) ||
    (!legacy && !validIds(v.practiceCompleted, taskIds)) ||
    !Array.isArray(v.checkpoints) ||
    !v.checkpoints.every((x) => Number.isInteger(x) && x >= 0 && x < 7) ||
    typeof v.challenge !== "boolean" ||
    (v.completedChallenges !== undefined &&
      !validIds(
        v.completedChallenges,
        new Set(["selector", "service", "replicas"]),
      )) ||
    typeof v.lastLesson !== "string" ||
    !lessonIds.has(v.lastLesson) ||
    !["light", "dark"].includes(v.theme as string)
  )
    throw new Error(
      "Ungültige KubeLab-Fortschrittsdatei (Version 1–5 erwartet).",
    );
  const retainedTheory = [...new Set(theory)].filter(
    (id) => !(v.version === 1 && id === "control-plane"),
  );
  return {
    version: 5,
    readCompleted:
      v.version === 5
        ? [...new Set(v.readCompleted as string[])]
        : retainedTheory,
    lastPath: v.version === 5 ? (v.lastPath as string | null) : null,
    recentLesson:
      v.version === 5
        ? (v.recentLesson as string | null)
        : (v.lastLesson as string),
    independentCompleted:
      v.version === 4 || v.version === 5
        ? [...new Set(v.independentCompleted as string[])]
        : [],
    theoryCompleted: [...new Set(theory)].filter(
      (id) => !(v.version === 1 && id === "control-plane"),
    ),
    practiceCompleted: legacy
      ? []
      : [...new Set(v.practiceCompleted as string[])],
    checkpoints: [...new Set(v.checkpoints as number[])],
    challenge: v.challenge,
    completedChallenges: [
      ...new Set(
        (v.completedChallenges as string[] | undefined) ||
          (v.challenge ? ["selector"] : []),
      ),
    ],
    lastLesson: v.lastLesson,
    theme: v.theme as Progress["theme"],
  };
}
let queue = Promise.resolve();
let generation = 0;
function save(progress: Progress) {
  const current = ++generation;
  useProgress.setState({ saveStatus: "pending" });
  queue = queue
    .then(() => set("kubelab-progress", progress))
    .then(() => {
      if (current === generation)
        useProgress.setState({ error: "", saveStatus: "saved" });
    })
    .catch(() => {
      if (current === generation)
        useProgress.setState({
          saveStatus: "error",
          error:
            "Dein Browser verhindert die Speicherung. Bitte exportiere deinen Lernstand vor dem Schließen.",
        });
    });
}
export const useProgress = create<
  Progress & {
    ready: boolean;
    error: string;
    saveStatus: "loading" | "pending" | "saved" | "error";
    update: (p: Partial<Progress>) => void;
    reset: () => void;
  }
>((setState) => ({
  ...defaults,
  ready: false,
  error: "",
  saveStatus: "loading",
  update: (p) => {
    const next = parseProgress({ ...useProgress.getState(), ...p });
    setState(next);
    save(next);
  },
  reset: () => {
    setState(defaults);
    save(defaults);
  },
}));
export async function hydrate() {
  try {
    const data = await get("kubelab-progress");
    if (data !== undefined) {
      const migrated = parseProgress(data);
      if (data.version !== 5) {
        const backupKey = `kubelab-progress-backup-v${data.version}`;
        if ((await get(backupKey)) === undefined) await set(backupKey, data);
      }
      useProgress.setState(migrated);
      if (data.version !== 5) save(migrated);
      else useProgress.setState({ saveStatus: "saved" });
    } else useProgress.setState({ saveStatus: "saved" });
  } catch {
    useProgress.setState({
      saveStatus: "error",
      error:
        "Lokaler Lernstand konnte nicht geladen werden. Er wurde nicht überschrieben. Importiere eine Sicherung oder setze den Lernstand bewusst zurück.",
    });
  } finally {
    useProgress.setState({ ready: true });
  }
}
