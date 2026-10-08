import { create } from "zustand";
import { get, set } from "idb-keyval";
export interface Progress {
  version: 1;
  completed: string[];
  checkpoints: number[];
  challenge: boolean;
  lastLesson: string;
  theme: "light" | "dark";
}
const defaults: Progress = {
  version: 1,
  completed: [],
  checkpoints: [],
  challenge: false,
  lastLesson: "linux",
  theme: "light",
};
export function parseProgress(value: unknown): Progress {
  const v = value as Progress;
  if (
    !v ||
    v.version !== 1 ||
    !Array.isArray(v.completed) ||
    !v.completed.every((x) =>
      ["linux", "containers", "control-plane"].includes(x),
    ) ||
    !Array.isArray(v.checkpoints) ||
    !v.checkpoints.every((x) => Number.isInteger(x) && x >= 0 && x < 7) ||
    typeof v.challenge !== "boolean" ||
    !["linux", "containers", "control-plane"].includes(v.lastLesson) ||
    !["light", "dark"].includes(v.theme)
  )
    throw new Error(
      "Ungültige KubeLab-Fortschrittsdatei (Version 1 erwartet).",
    );
  return {
    version: 1,
    completed: [...new Set(v.completed)],
    checkpoints: [...new Set(v.checkpoints)],
    challenge: v.challenge,
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
    setState(p);
    const s = useProgress.getState();
    save(parseProgress(s));
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
