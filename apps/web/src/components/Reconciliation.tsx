import { useState } from "react";
const stages = [
  {
    title: "API nimmt den Sollzustand an",
    text: "Deployment mit 3 gewünschten Replikaten ist gespeichert. Ein Pod läuft bereits.",
    pods: 1,
  },
  {
    title: "Controller erkennen die Abweichung",
    text: "Der Deployment-Controller verwaltet das ReplicaSet. Der ReplicaSet-Controller fordert zwei weitere Pod-Objekte über die API an.",
    pods: 1,
  },
  {
    title: "Scheduler bindet die neuen Pods",
    text: "Geeignete Nodes werden ausgewählt. Eine Node-Zuweisung allein startet noch keinen Container.",
    pods: 1,
  },
  {
    title: "kubelet und Runtime starten Container",
    text: "Nach Netzwerk- und Volume-Vorbereitung startet die Runtime die Container. Readiness-Prüfungen stehen noch aus.",
    pods: 1,
  },
  {
    title: "Bereitschaft wird beobachtet",
    text: "Im vereinfachten Beispiel werden die neuen Pods bereit. Der Regelkreis hat den Sollzustand erreicht.",
    pods: 3,
  },
];
export function Reconciliation() {
  const [step, setStep] = useState(0);
  const current = stages[step];
  return (
    <section className="reconciliation" aria-label="Reconciliation-Experiment">
      <div className="eyebrow">VEREINFACHTES ABLAUFMODELL</div>
      <h3>Von einer zu drei bereiten Instanzen</h3>
      <p>
        <strong>Soll: 3 Replikate · Ist: {current.pods} bereit</strong>
      </p>
      <ol>
        {stages.map((s, i) => (
          <li
            className={step === i ? "current" : ""}
            key={s.title}
            aria-current={step === i ? "step" : undefined}
          >
            {s.title}
          </li>
        ))}
      </ol>
      <p role="status">{current.text}</p>
      <button
        className="button primary"
        disabled={step === stages.length - 1}
        onClick={() => setStep((s) => s + 1)}
      >
        Regelkreis fortsetzen
      </button>
      <button className="button secondary" onClick={() => setStep(0)}>
        {step === 4 ? "Ausfall simulieren" : "Ablauf zurücksetzen"}
      </button>
      <small>
        Dieses Lernmodell verändert dein Operations Lab nicht. Echte Controller
        arbeiten asynchron und können Schritte wiederholen.
      </small>
    </section>
  );
}
