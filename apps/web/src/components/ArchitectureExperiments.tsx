import { useEffect, useState, type ReactNode } from "react";
import {
  Box,
  CheckCircle2,
  Database,
  Server,
  Play,
  RotateCcw,
} from "lucide-react";
import { ClusterGraph } from "./ClusterGraph";
import { Reconciliation } from "./Reconciliation";
import type { Experiment } from "../../../../packages/lesson-engine/src/types";
import type { ReportEvidence } from "../../../../packages/lesson-engine/src/experiments";
import {
  quorumWriteEvidence,
  apiEvidence,
  schedulerEvidence,
  runtimeEvidence,
} from "../../../../packages/simulation-engine/src/evidence";
type EvidenceProps = { onEvidence?: ReportEvidence };
import {
  initialQuorum,
  majority,
  canCommit,
  toggleMember,
  electLeader,
  commitWrite,
  apiRequest,
  schedulingCandidates,
  runtimeResult,
  failureCases,
} from "../../../../packages/simulation-engine/src/architecture";
function Frame({
  title,
  limit,
  children,
}: {
  title: string;
  limit: string;
  children: ReactNode;
}) {
  return (
    <section className="experiment" aria-label={title}>
      <div className="eyebrow">
        INTERAKTIVES LERNMODELL · KEINE ECHTE AUSFÜHRUNG
      </div>
      <h3>{title}</h3>
      {children}
      <p className="model-limit">
        <strong>Modellgrenze:</strong> {limit}
      </p>
    </section>
  );
}
export function QuorumSimulator({ onEvidence }: EvidenceProps) {
  const [state, setState] = useState(initialQuorum);
  const [message, setMessage] = useState(
    "Ein Leader und drei erreichbare Mitglieder.",
  );
  return (
    <Frame
      title="etcd Quorum Simulator"
      limit="Eine gemeinsame Netzpartition, feste drei abstimmende Mitglieder, manuell ausgelöste Leader-Wahl. Keine echten Raft-Zeitgeber, Logs, Persistenz, Reads, Learner oder MVCC-Transaktionen."
    >
      <div className="quorum-grid">
        {state.members.map((up, i) => (
          <button
            key={i}
            aria-pressed={up}
            className={`member ${up ? "up" : "down"}`}
            onClick={() => {
              setState((s) => toggleMember(s, i));
              setMessage(
                up
                  ? `etcd-${i + 1} ist jetzt ausgefallen.`
                  : `etcd-${i + 1} ist wieder erreichbar.`,
              );
            }}
          >
            <Database size={27} />
            <strong>etcd-{i + 1}</strong>
            <span>
              {!up ? "Ausgefallen" : state.leader === i ? "Leader" : "Follower"}
            </span>
            <small>{up ? "Ausschalten" : "Wiederherstellen"}</small>
          </button>
        ))}
      </div>
      <div className="experiment-metrics">
        <span>
          Erreichbar: <strong>{state.members.filter(Boolean).length}/3</strong>
        </span>
        <span>
          Mehrheit: <strong>{majority(state.members.length)}</strong>
        </span>
        <span>
          Modellrevision:{" "}
          <strong data-testid="etcd-revision">{state.revision}</strong>
        </span>
        <span>
          Wahlperiode: <strong>{state.term}</strong>
        </span>
      </div>
      <p className={canCommit(state) ? "result-ok" : "result-fail"}>
        {canCommit(state)
          ? "Schreiben möglich"
          : state.members.filter(Boolean).length < 2
            ? "Kein Quorum – Schreiben blockiert"
            : "Leader fehlt – Wahl erforderlich"}
      </p>
      <div className="inline-actions">
        <button
          className="button primary"
          onClick={() => {
            const event = quorumWriteEvidence(state);
            if (event) onEvidence?.(event);
            setState((s) => commitWrite(s));
            setMessage(
              canCommit(state)
                ? "Änderung durch die Mehrheit bestätigt."
                : "Keine Änderung bestätigt: Leader oder Mehrheit fehlt.",
            );
          }}
        >
          Änderung schreiben
        </button>
        <button
          className="button secondary"
          disabled={
            state.leader !== null || state.members.filter(Boolean).length < 2
          }
          onClick={() => {
            setState(electLeader);
            setMessage("Neuer Leader von der Mehrheit gewählt.");
          }}
        >
          Leader wählen
        </button>
        <button
          className="button secondary"
          onClick={() => {
            onEvidence?.(null);
            setState(initialQuorum());
            setMessage("Experiment zurückgesetzt.");
          }}
        >
          <RotateCcw size={14} />
          Zurücksetzen
        </button>
      </div>
      <p role="status">{message}</p>
    </Frame>
  );
}
export function ApiExplorer({ onEvidence }: EvidenceProps) {
  const [identity, setIdentity] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [admitted, setAdmitted] = useState(true);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof apiRequest> | null>(
    null,
  );
  return (
    <Frame
      title="API Request Explorer"
      limit="Nur grobe Stufen eines Schreibvorgangs. Schema, Defaulting, Conversion, Webhooks, Feldbesitz, Cache und zeitliche Fehler werden nicht vollständig abgebildet. Keine Netzwerk-Anfrage."
    >
      <div className="experiment-options">
        {[
          { label: "Gültige Identität", value: identity, set: setIdentity },
          { label: "Operation erlaubt", value: authorized, set: setAuthorized },
          { label: "Admission akzeptiert", value: admitted, set: setAdmitted },
        ].map((option) => (
          <label key={option.label}>
            <input
              type="checkbox"
              checked={option.value}
              onChange={(e) => {
                option.set(e.target.checked);
                setResult(null);
              }}
            />
            {option.label}
          </label>
        ))}
      </div>
      <button
        className="button primary"
        onClick={() => {
          const next = apiRequest(identity, authorized, admitted);
          setResult(next);
          onEvidence?.(apiEvidence(identity, authorized, admitted));
          if (next.accepted) setRevision((n) => n + 1);
        }}
      >
        Schreibanfrage simulieren
      </button>
      <ol className="flow-steps">
        {(
          result?.steps ||
          apiRequest(true, true, true).steps.map((s) => ({
            ...s,
            state: "waiting",
          }))
        ).map((s) => (
          <li className={s.state} key={s.name}>
            {s.name}
            <span>
              {s.state === "passed"
                ? "Erfüllt"
                : s.state === "failed"
                  ? "Abgelehnt"
                  : "Noch nicht ausgeführt"}
            </span>
          </li>
        ))}
      </ol>
      <p role="status">
        {result?.reason ||
          "Konfiguriere den Request und starte die Simulation."}
      </p>
      <p>
        Akzeptierte Modelländerungen: <strong>{revision}</strong>
      </p>
    </Frame>
  );
}
export function SchedulerPlayground({ onEvidence }: EvidenceProps) {
  const [cpu, setCpu] = useState(1);
  const [forced, setForced] = useState("auto");
  const [taint, setTaint] = useState(false);
  const [tolerated, setTolerated] = useState(false);
  const candidates = schedulingCandidates(cpu, forced, taint, tolerated);
  const selected = candidates.find((n) => n.reasons.length === 0);
  return (
    <Frame
      title="Scheduler Playground"
      limit="Nur freie CPU-Requests-Kapazität, ein harter Node-Wunsch und ein NoSchedule-Taint. Der erste passende Node gewinnt; echtes Scoring, Speicher, Affinity, Volumes und Preemption fehlen."
    >
      <label className="range-label">
        CPU-Request: {cpu} vCPU
        <input
          aria-label="CPU-Request im Playground"
          type="range"
          min="1"
          max="6"
          value={cpu}
          onChange={(e) => setCpu(Number(e.target.value))}
        />
      </label>
      <label>
        Harter Node-Wunsch
        <select
          aria-label="Harter Node-Wunsch"
          value={forced}
          onChange={(e) => setForced(e.target.value)}
        >
          <option value="auto">Kein Node-Wunsch</option>
          <option value="worker-01">worker-01</option>
          <option value="worker-02">worker-02</option>
        </select>
      </label>
      <div className="experiment-options">
        <label>
          <input
            type="checkbox"
            checked={taint}
            onChange={(e) => setTaint(e.target.checked)}
          />
          worker-02: NoSchedule-Taint
        </label>
        <label>
          <input
            type="checkbox"
            checked={tolerated}
            onChange={(e) => setTolerated(e.target.checked)}
          />
          Pod toleriert diesen Taint
        </label>
      </div>
      <div className="scheduler-nodes">
        {candidates.map((n) => (
          <div
            className={selected?.name === n.name ? "selected" : ""}
            key={n.name}
          >
            <Server size={24} />
            <strong>{n.name}</strong>
            <span>{n.cpu} vCPU frei planbar</span>
            <small>{n.reasons.join(" · ") || "Filter bestanden"}</small>
          </div>
        ))}
      </div>
      {onEvidence && (
        <button
          className="button secondary"
          onClick={() => {
            const event = schedulerEvidence(cpu, forced, taint, tolerated);
            if (event) onEvidence(event);
          }}
        >
          Zustand für Aufgabe prüfen
        </button>
      )}
      <p role="status">
        {selected
          ? `Im Modell gewählt: ${selected.name}`
          : "Pending: Kein Node erfüllt alle Bedingungen."}
      </p>
    </Frame>
  );
}
const flow = [
  [
    "kubectl → API",
    "Deployment-Ziel senden; Identität, Berechtigung und Objektprüfung.",
  ],
  [
    "API → etcd",
    "Angenommenes Ziel persistieren. API-Erfolg ist noch keine Pod-Bereitschaft.",
  ],
  ["Deployment-Controller", "ReplicaSet erstellen oder aktualisieren."],
  ["ReplicaSet-Controller", "Fehlende Pod-Objekte über die API anfordern."],
  ["Scheduler", "Ungebundene Pods auf geeignete Nodes binden."],
  [
    "kubelet → Runtime",
    "Netzwerk und Volumes vorbereiten; Images und Container verwalten.",
  ],
  [
    "Readiness & Status",
    "Anwendungsbereitschaft prüfen und Beobachtungen an die API melden.",
  ],
];
export function RequestFlow() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step >= flow.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(timer);
  }, [playing, step]);
  return (
    <Frame
      title="Request Flow Animator"
      limit="Logische Lernreihenfolge statt synchroner Aufrufkette. Reale Komponenten beobachten über die API, arbeiten nebenläufig und wiederholen Schritte. Service-Erreichbarkeit und externe Routen sind nicht modelliert."
    >
      <ol className="flow-steps">
        {flow.map(([name], i) => (
          <li
            className={i === step ? "current" : i < step ? "passed" : "waiting"}
            key={name}
            aria-current={i === step ? "step" : undefined}
          >
            <span>{i + 1}</span>
            {name}
            {i < step && <CheckCircle2 size={17} />}
          </li>
        ))}
      </ol>
      <p role="status">
        <strong>{flow[step][0]}:</strong> {flow[step][1]}
      </p>
      <div className="inline-actions">
        <button
          className="button primary"
          disabled={step === flow.length - 1}
          onClick={() => {
            setPlaying(false);
            setStep((s) => s + 1);
          }}
        >
          Nächster Übergang
        </button>
        <button
          className="button secondary"
          disabled={step === flow.length - 1 && !playing}
          onClick={() => setPlaying(!playing)}
        >
          <Play size={15} />
          {playing ? "Pausieren" : "Ablauf abspielen"}
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
        >
          Ablauf zurücksetzen
        </button>
      </div>
    </Frame>
  );
}
export function RuntimeExplorer({ onEvidence }: EvidenceProps) {
  const [network, setNetwork] = useState(true);
  const [volume, setVolume] = useState(true);
  const [image, setImage] = useState(true);
  const [ready, setReady] = useState(true);
  const result = runtimeResult(network, volume, image, ready);
  return (
    <Frame
      title="Node Runtime Explorer"
      limit="Vereinfachte Abhängigkeiten eines bereits gebundenen Pods. Keine echte CRI-, CNI- oder CSI-Ausführung; Vorbereitung kann real parallel erfolgen. Fehlerklassen sind keine vollständige Statusmaschine."
    >
      <div className="experiment-options">
        {[
          { name: "Pod-Netzwerk verfügbar", value: network, set: setNetwork },
          { name: "Volume verfügbar", value: volume, set: setVolume },
          { name: "Image verfügbar", value: image, set: setImage },
          { name: "Readiness erfolgreich", value: ready, set: setReady },
        ].map((o) => (
          <label key={o.name}>
            <input
              type="checkbox"
              checked={o.value}
              onChange={(e) => o.set(e.target.checked)}
            />
            {o.name}
          </label>
        ))}
      </div>
      <div className="runtime-chain">
        {[
          "kubelet",
          "Pod-Umgebung",
          "containerd / CRI",
          "OCI-Runtime",
          "Readiness",
        ].map((s, i) => (
          <span className={i <= result.stage ? "active" : ""} key={s}>
            <Box size={18} />
            {s}
          </span>
        ))}
      </div>
      {onEvidence && (
        <button
          className="button secondary"
          onClick={() => {
            const event = runtimeEvidence(network, volume, image, ready);
            if (event) onEvidence(event);
          }}
        >
          Zustand für Aufgabe prüfen
        </button>
      )}
      <p role="status">
        <strong>{result.title}</strong> · {result.detail}
      </p>
    </Frame>
  );
}
export function FailureSimulator() {
  const [failure, setFailure] =
    useState<keyof typeof failureCases>("scheduler");
  const result = failureCases[failure];
  return (
    <Frame
      title="Failure Simulator"
      limit="Eine kleine Control Plane ohne Ersatzinstanzen. Einzelne ausgewählte Fehler; keine echte Ausfallerkennung, Zeitgarantie, Netzpartition, Volume-Recovery oder automatische Failover-Prüfung."
    >
      <label>
        Ausfallszenario
        <select
          aria-label="Ausfallszenario"
          value={failure}
          onChange={(e) =>
            setFailure(e.target.value as keyof typeof failureCases)
          }
        >
          {Object.entries(failureCases).map(([id, v]) => (
            <option key={id} value={id}>
              {v.title}
            </option>
          ))}
        </select>
      </label>
      <dl className="failure-results">
        <dt>Bestehende Workloads</dt>
        <dd>{result.existing}</dd>
        <dt>Neue Zustandsänderungen und Ersatz</dt>
        <dd>{result.newPods}</dd>
        <dt>Erste Diagnose</dt>
        <dd>{result.inspect}</dd>
      </dl>
      <p role="status">Aktiv: {result.title}</p>
    </Frame>
  );
}
export function ArchitectureExperiment({
  kind,
  onEvidence,
}: { kind: Experiment } & EvidenceProps) {
  if (kind === "architecture")
    return (
      <Frame
        title="Architecture Explorer"
        limit="Eine Control Plane und zwei Beispiel-Worker. Linien stehen für logische Beziehungen zur API, nicht für Anwendungsverkehr oder vollständige Netzwerkprotokolle."
      >
        <ClusterGraph />
      </Frame>
    );
  if (kind === "quorum") return <QuorumSimulator onEvidence={onEvidence} />;
  if (kind === "api") return <ApiExplorer onEvidence={onEvidence} />;
  if (kind === "scheduler")
    return <SchedulerPlayground onEvidence={onEvidence} />;
  if (kind === "runtime") return <RuntimeExplorer onEvidence={onEvidence} />;
  if (kind === "flow") return <RequestFlow />;
  if (kind === "failure") return <FailureSimulator />;
  return <Reconciliation />;
}
