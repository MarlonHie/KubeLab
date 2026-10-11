import { lessons } from "../../../../packages/lesson-engine/src";
import { create } from "zustand";
import { get, set } from "idb-keyval";
export interface Progress {
  version: 2;
  completed: string[];
  checkpoints: number[];
  challenge: boolean;
  completedChallenges: string[];
  lastLesson: string;
  theme: "light" | "dark";
}
const defaults: Progress = {
  version: 2,
  completed: [],
  checkpoints: [],
  challenge: false,
  completedChallenges: [],
  lastLesson: "cluster-basics",
  theme: "light",
};
export function parseProgress(value: unknown): Progress {
  const v = value as Progress;
  if (
    !v ||
    ![1, 2].includes(v.version) ||
    !Array.isArray(v.completed) ||
    !v.completed.every((x) => lessons.some((l) => l.id === x)) ||
    !Array.isArray(v.checkpoints) ||
    !v.checkpoints.every((x) => Number.isInteger(x) && x >= 0 && x < 7) ||
    typeof v.challenge !== "boolean" ||
    (v.completedChallenges !== undefined &&
      (!Array.isArray(v.completedChallenges) ||
        !v.completedChallenges.every((id) =>
          ["selector", "service", "replicas"].includes(id),
        ))) ||
    !lessons.some((l) => l.id === v.lastLesson) ||
    !["light", "dark"].includes(v.theme)
  )
    throw new Error(
      "Ungültige KubeLab-Fortschrittsdatei (Version 1 oder 2 erwartet).",
    );
  return {
    version: 2,
    completed: [...new Set(v.completed)].filter(
      (id) => !(Number(v.version) === 1 && id === "control-plane"),
    ),
    checkpoints: [...new Set(v.checkpoints)],
    challenge: v.challenge,
    completedChallenges: [
      ...new Set(v.completedChallenges || (v.challenge ? ["selector"] : [])),
    ],
    lastLesson: v.lastLesson,
    theme: v.theme,
  };
}
let queue = Promise.resolve();
function save(progress: Progress) {
  queue = queue
    .then(() => set("kubelab-progress", progress))
    .then(() => {
      useProgress.setState({ error: "" });
    })
    .catch(() => {
      useProgress.setState({
        error:
          "Dein Browser verhindert die Speicherung. Bitte exportiere deinen Lernstand vor dem Schließen.",
      });
    });
}
export const useProgress = create<
  Progress & {
    ready: boolean;
    error: string;
    update: (p: Partial<Progress>) => void;
    reset: () => void;
  }
>((setState) => ({
  ...defaults,
  ready: false,
  error: "",
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
    if (data) useProgress.setState(parseProgress(data));
  } catch {
    useProgress.setState({
      error:
        "Lokaler Lernstand konnte nicht geladen werden. Exportiere deinen Fortschritt zur Sicherung.",
    });
  } finally {
    useProgress.setState({ ready: true });
  }
}
