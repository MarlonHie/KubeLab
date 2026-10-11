import {
  replayRaft,
  replayScheduler,
  raftActions,
  schedulerActions,
  type DeepModel,
} from "../../../../packages/simulation-engine/src/deep-labs";
import {
  challengeSteps,
  checkChallenge,
  type ChallengeId,
} from "../../../../packages/lesson-engine/src/challenges";
export function DeepDiveExperiment({
  kind,
  actions,
  onAction,
}: {
  kind: DeepModel;
  actions: string[];
  onAction: (action: string | null) => void;
}) {
  const raft = kind === "raft-internals";
  const state = raft ? replayRaft(actions) : replayScheduler(actions);
  const labels = raft ? raftActions : schedulerActions;
  const id: ChallengeId = raft ? "raft-partition-v1" : "scheduler-pipeline-v1";
  const steps = challengeSteps(id),
    checks = checkChallenge(id, actions);
  const count = checks.filter((c) => c.passed).length;
  const invalid = actions.length > 0 && count !== actions.length;
  return (
    <section
      className="experiment deep-experiment"
      data-testid={kind}
      aria-label={
        raft ? "Raft Deep Dive Simulator" : "Scheduler Deep Dive Simulator"
      }
    >
      <div className="eyebrow">
        DEEP DIVE SIMULATOR · BROWSER-MODELL · KEINE ECHTE AUSFÜHRUNG
      </div>
      <h3>
        {raft
          ? "Raft: Partition, Log und Commit"
          : "Scheduler: Filter bis Bind"}
      </h3>
      <p>
        {raft
          ? "Drei feste Voter; die Schaltflächen liefern Nachrichten, lösen eine Wahl aus oder wenden Commits an. Zeitgeber sind angehalten, um Zwischenschritte sichtbar zu machen."
          : "Fester Pod mit Request 2 CPU, PV in Zone b und harter Pod-Anti-Affinity. Die freie CPU ist bereits um Requests anderer Pods vermindert. Jeder Erweiterungspunkt wird manuell ausgelöst."}
      </p>
      {"members" in state ? (
        <>
          <p>
            Netz: <strong>{state.network}</strong> · adressierter Leader: etcd-
            {state.leader + 1} · Quorum: 2
          </p>
          <div
            className="lesson-table"
            tabIndex={0}
            role="region"
            aria-label="Raft-Zustand"
          >
            <table>
              <caption>Simulationszustand · Log = Index:Term:Operation</caption>
              <thead>
                <tr>
                  {[
                    "Mitglied",
                    "Term",
                    "Log",
                    "Commit",
                    "Applied",
                    "KV-Revision",
                    "Wert",
                  ].map((x) => (
                    <th key={x} scope="col">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.members.map((m, i) => (
                  <tr key={i}>
                    <th scope="row">etcd-{i + 1}</th>
                    <td>{m.term}</td>
                    <td>
                      {m.log
                        .map((e, j) => `${j + 1}:${e.term}:${e.kind}`)
                        .join(" · ") || "leer"}
                    </td>
                    <td>{m.commit}</td>
                    <td>{m.applied}</td>
                    <td>{m.revision}</td>
                    <td>{m.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <p>
            Phase: <strong>{state.stage}</strong> · Auswahl:{" "}
            {state.selected || "–"} · Reserviert:{" "}
            {state.reserved ? "ja" : "nein"} · Gebunden:{" "}
            {state.bound ? "ja" : "nein"}
          </p>
          <div
            className="lesson-table"
            tabIndex={0}
            role="region"
            aria-label="Scheduler-Zustand"
          >
            <table>
              <caption>Modellentscheidungen pro Node</caption>
              <thead>
                <tr>
                  {[
                    "Node",
                    "Freie CPU",
                    "Zone",
                    "Gleiche App",
                    "Filtergrund",
                    "Score",
                  ].map((x) => (
                    <th key={x} scope="col">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.candidates.map((c) => (
                  <tr key={c.name}>
                    <th scope="row">{c.name}</th>
                    <td>{c.free}</td>
                    <td>{c.zone}</td>
                    <td>{c.sameApp}</td>
                    <td>
                      {state.stage === "queue"
                        ? "noch nicht geprüft"
                        : c.reasons.join("; ") || "zulässig"}
                    </td>
                    <td>{c.score ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="deep-actions">
        {Object.entries(labels).map(([action, label]) => (
          <button
            className="button secondary"
            key={action}
            onClick={() => onAction(action)}
          >
            {label}
          </button>
        ))}
        <button className="button secondary" onClick={() => onAction(null)}>
          Deep Dive zurücksetzen
        </button>
      </div>
      <p role="status" className="notice">
        {state.message}
      </p>
      <p
        className={invalid ? "result-fail" : "subtle"}
        data-testid="challenge-guide"
      >
        {invalid
          ? "Vom Prüfpfad abgewichen. Du kannst weiter erkunden; für den Praxisnachweis bitte zurücksetzen."
          : count === steps.length
            ? "Prüfpfad vollständig. Bestätige die Praxisaufgabe unter dem Experiment."
            : `Prüfpfad ${count}/${steps.length} · Nächster Schritt: ${labels[steps[count].action]} — ${steps[count].label}`}
      </p>
      <p className="model-limit">
        <strong>Modellgrenze:</strong>{" "}
        {raft
          ? "Keine Netzwerkpakete, Festplatten, echten Wahl-Timer, ReadIndex-, Snapshot- oder Membership-Protokolle. Die Wahl nimmt zwei identische Follower-Logs an. Der isolierte alte Leader darf vor Erkennung des Quorumverlusts nur unbestätigte Vorschläge anhängen; im echten etcd tritt er nach Quorumprüfung bzw. höherem Term zurück. KV-Revision startet hier didaktisch bei 0."
          : "Vier feste Nodes; Zone und Anti-Affinity sind harte Filter. Lehr-Score = (freie CPU − 2) × 10, keine echten Plugin-Gewichte. QueueSort, NormalizeScore und PostBind sind zusammengefasst; kein paralleler Binding-Zyklus, keine echte Volume-Provisionierung oder Preemption. Topology Spread wird im Text behandelt."}
      </p>
    </section>
  );
}
