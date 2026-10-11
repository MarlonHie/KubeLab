import { create } from "zustand";
import { get, set } from "idb-keyval";
import {
  freshLab,
  parseLab,
  type LabState,
} from "../../../../packages/lab-state/src";
export const LAB_KEY = "kubelab-lab-v1";
let pending: ReturnType<typeof setTimeout> | undefined;
let queue = Promise.resolve();
let generation = 0;
function persist(lab: LabState, delay: number) {
  clearTimeout(pending);
  const current = ++generation;
  useLab.setState({ saveStatus: "pending" });
  const write = () => {
    pending = undefined;
    queue = queue
      .then(() => set(LAB_KEY, lab))
      .then(() => {
        if (current === generation)
          useLab.setState({ saveStatus: "saved", error: "" });
      })
      .catch(() => {
        if (current === generation)
          useLab.setState({
            saveStatus: "error",
            error:
              "Lab konnte nicht gespeichert werden. Exportiere deinen Lab-Stand, bevor du diese Seite schließt.",
          });
      });
  };
  if (delay) pending = setTimeout(write, delay);
  else write();
}
export const useLab = create<
  LabState & {
    ready: boolean;
    saveStatus: "loading" | "pending" | "saved" | "error";
    error: string;
    update: (patch: Partial<LabState>, immediate?: boolean) => void;
    replace: (lab: LabState) => void;
  }
>((setState) => ({
  ...freshLab(),
  ready: false,
  saveStatus: "loading",
  error: "",
  update: (patch, immediate = false) => {
    if (!useLab.getState().ready) return;
    const next = parseLab({ ...useLab.getState(), ...patch });
    setState(next);
    persist(next, immediate ? 0 : 200);
  },
  replace: (lab) => {
    const checked = parseLab(lab);
    setState(checked);
    persist(checked, 0);
  },
}));
export async function hydrateLab() {
  try {
    const saved = await get(LAB_KEY);
    if (saved !== undefined) useLab.setState(parseLab(saved));
    useLab.setState({ saveStatus: "saved" });
  } catch {
    useLab.setState({
      saveStatus: "error",
      error:
        "Gespeicherter Lab-Stand ist nicht lesbar. Er wurde nicht überschrieben. Importiere eine Sicherung oder setze das Lab bewusst zurück.",
    });
  } finally {
    useLab.setState({ ready: true });
  }
}
export function flushLab() {
  if (pending) {
    clearTimeout(pending);
    pending = undefined;
    persist(parseLab(useLab.getState()), 0);
  }
  return queue;
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    void flushLab();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushLab();
  });
}
