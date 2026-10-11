import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Check,
  CheckCircle2,
  Code2,
  FlaskConical,
  Play,
  RotateCcw,
  ShieldCheck,
  TerminalSquare,
  X,
} from "lucide-react";
import { Badge, Heading } from "../components/Page";
import { ExecutionNotice } from "../components/ExecutionNotice";
import { ClusterGraph } from "../components/ClusterGraph";
import { Terminal } from "../components/Terminal";
import { useProgress } from "../stores/progress";
import { useLab } from "../stores/lab";
import { freshLab } from "../../../../packages/lab-state/src";
import {
  apply,
  command,
  pods,
} from "../../../../packages/simulation-engine/src";
import {
  scenarios,
  taskChecks,
  serviceEndpoints,
  type ScenarioId,
} from "../../../../packages/simulation-engine/src/scenarios";
import { validateYaml } from "../../../../packages/validation/src";
const YamlEditor = lazy(() => import("../components/YamlEditor"));
export function Operations() {
  const p = useProgress();
  const lab = useLab();
  const { source, cluster, lastOutput: output } = lab;
  const [resetKey, setResetKey] = useState(0);
  const [hint, setHint] = useState(false);
  const [terminalInput, setTerminalInput] = useState("kubectl get pods");
  const [width, setWidth] = useState(56);
  const [tab, setTab] = useState<"graph" | "resources">("graph");
  const [pendingScenario, setPendingScenario] = useState<
    ScenarioId | "sandbox" | null
  >(null);
  const scenario = scenarios.find((s) => s.id === lab.scenario);
  const checks = lab.scenario ? taskChecks(cluster, lab.scenario) : [];
  const validation = validateYaml(source);
  function run(input: string) {
    const current = useLab.getState();
    const result = command(current.cluster, input, current.source);
    current.update(
      {
        cluster: result.cluster,
        lastOutput: result.output,
        ...(result.ok && input.trim() === "kubectl apply -f deployment.yaml"
          ? { appliedSource: current.source }
          : {}),
      },
      true,
    );
    return result.output;
  }
  function applyManifest() {
    const current = useLab.getState();
    const result = apply(current.cluster, current.source);
    current.update(
      {
        cluster: result.cluster,
        lastOutput: result.output,
        ...(result.ok ? { appliedSource: current.source } : {}),
      },
      true,
    );
  }
  function start(id: ScenarioId | "sandbox") {
    const target = scenarios.find((s) => s.id === id);
    lab.replace(
      target
        ? {
            ...freshLab(),
            source: target.source,
            cluster: target.initial,
            scenario: target.id,
            lastOutput: `Szenario geladen: ${target.title}. Der Startzustand ist simuliert.`,
            appliedSource: target.initial.resources.length
              ? target.source
              : null,
          }
        : freshLab(),
    );
    setResetKey((x) => x + 1);
    setHint(false);
    setPendingScenario(null);
  }
  function checkTask() {
    if (!lab.scenario) return;
    const result = taskChecks(cluster, lab.scenario);
    const passed = result.every((c) => c.passed);
    if (passed)
      p.update({
        challenge: p.challenge || lab.scenario === "selector",
        completedChallenges: [
          ...new Set([...p.completedChallenges, lab.scenario]),
        ],
      });
    lab.update(
      {
        lastOutput: passed
          ? "Geschafft! Alle Prüfkriterien im angewendeten Simulationszustand sind erfüllt. Challenge abgeschlossen."
          : "Noch nicht fertig:\n" +
            result
              .filter((c) => !c.passed)
              .map((c) => "• " + c.label)
              .join("\n"),
      },
      true,
    );
  }
  const services = cluster.resources.filter((r) => r.kind === "Service");
  return (
    <>
      <Heading
        eyebrow="OPERATIONS LAB"
        title="Ausprobieren ist der beste Lehrer."
        description="Dein YAML-Entwurf und dein simulierter Cluster bleiben auf diesem Gerät erhalten."
        action={
          <Badge color="orange">
            <FlaskConical size={13} />
            Simulation
          </Badge>
        }
      />
      <ExecutionNotice mode="simulation" />
      <div className="workspace-state">
        <span role="status" data-testid="lab-save-status">
          {lab.saveStatus === "saved"
            ? "Lab lokal gespeichert"
            : lab.saveStatus === "pending"
              ? "Lab wird gespeichert …"
              : lab.saveStatus === "error"
                ? "Speichern fehlgeschlagen"
                : "Lab wird geladen …"}
        </span>
        <Link to="/settings">Lab sichern oder importieren</Link>
      </div>
      {lab.error && (
        <div className="notice warning" role="alert">
          {lab.error}
        </div>
      )}
      <div className="lab-challenge panel">
        <div>
          <span className="feature-icon orange">
            <TerminalSquare size={23} />
          </span>
          <div>
            <div className="eyebrow">
              {scenario ? "GEFÜHRTES FEHLERSZENARIO" : "DEIN SPIELPLATZ"}
            </div>
            <h3>{scenario?.title || "Dein erstes Deployment"}</h3>
            <p>
              {scenario?.description ||
                "Starte zwei nginx-Pods, ändere Replikate oder ergänze einen Service."}
            </p>
          </div>
        </div>
        <div className="inline-actions">
          {scenario ? (
            <>
              <button
                className="button secondary small"
                onClick={() => setHint(!hint)}
              >
                Hinweis
              </button>
              <button className="button primary small" onClick={checkTask}>
                <Check size={15} />
                Aufgabe prüfen
              </button>
            </>
          ) : (
            <button
              className="button secondary"
              onClick={() => setPendingScenario("selector")}
            >
              Challenge starten
            </button>
          )}
        </div>
      </div>
      <div className="scenario-selector">
        <label>
          Szenario auswählen
          <select
            aria-label="Szenario auswählen"
            value={lab.scenario || "sandbox"}
            onChange={(e) =>
              setPendingScenario(e.target.value as ScenarioId | "sandbox")
            }
          >
            <option value="sandbox">Freier Spielplatz</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <Link className="text-link" to="/academy/networking">
          Services und Cilium verstehen
        </Link>
      </div>
      {pendingScenario && (
        <div className="notice warning reset-confirm" role="alert">
          <p>
            <strong>Aktuelles Lab ersetzen?</strong> Der gespeicherte
            YAML-Entwurf und Clusterzustand werden durch den definierten
            Startzustand ersetzt. Abgeschlossene Lernziele bleiben erhalten.
          </p>
          <div className="inline-actions">
            <button
              className="button danger"
              onClick={() => start(pendingScenario)}
            >
              Lab ersetzen
            </button>
            <button
              className="button secondary"
              onClick={() => setPendingScenario(null)}
            >
              Abbrechen
            </button>
            <Link to="/settings" className="text-link">
              Vorher exportieren
            </Link>
          </div>
        </div>
      )}
      {hint && scenario && <div className="notice">{scenario.hint}</div>}
      {scenario && (
        <section
          className="task-feedback panel"
          aria-label="Aufgabenfortschritt"
        >
          <h3>Prüfung des angewendeten Clusters</h3>
          <ul>
            {checks.map((c) => (
              <li key={c.label} className={c.passed ? "passed" : ""}>
                {c.passed ? <CheckCircle2 size={17} /> : <Box size={17} />}
                <span>{c.label}</span>
                <strong>{c.passed ? "Erfüllt" : "Offen"}</strong>
              </li>
            ))}
          </ul>
          <p>
            Änderungen im Editor zählen erst nach „Simuliert anwenden“.
            Terminaländerungen und Diagramm verwenden denselben Clusterzustand.
          </p>
        </section>
      )}
      <div className="lab-controls">
        <label>
          Panelbreite
          <input
            aria-label="Editorbreite"
            type="range"
            min="35"
            max="70"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>
        <button
          className="text-button"
          onClick={() => setPendingScenario(lab.scenario || "sandbox")}
        >
          <RotateCcw size={15} />
          Übung zurücksetzen
        </button>
      </div>
      <div
        className="lab-workspace"
        style={{ "--editor-width": `${width}%` } as React.CSSProperties}
      >
        <section className="editor-panel panel">
          <div className="panel-bar">
            <span>
              <Code2 size={17} />
              deployment.yaml
            </span>
            <button className="button primary small" onClick={applyManifest}>
              <Play size={14} />
              Simuliert anwenden
            </button>
          </div>
          <Suspense
            fallback={
              <div className="editor-loading">Editor wird geladen …</div>
            }
          >
            <YamlEditor
              value={source}
              onChange={(value) => {
                if (value.length <= 100000) lab.update({ source: value });
                else
                  lab.update({
                    lastOutput:
                      "Das Manifest darf höchstens 100.000 Zeichen enthalten.",
                  });
              }}
              dark={p.theme === "dark"}
            />
          </Suspense>
          <div
            className={`validation-status ${validation.errors.length ? "invalid" : ""}`}
            role="status"
          >
            {validation.errors.length ? (
              <>
                <X size={15} />
                {validation.errors[0]}
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                YAML gültig · {validation.resources.length} Ressource(n)
              </>
            )}
          </div>
          <div className="draft-status">
            {lab.appliedSource === source
              ? "Dieser Entwurf wurde angewendet. Terminaländerungen können den Cluster zusätzlich verändern."
              : "Entwurf noch nicht angewendet. Das Diagramm zeigt weiterhin den letzten Clusterzustand."}
          </div>
          <div className="terminal-header">
            <span>
              <TerminalSquare size={15} />
              Browserterminal
            </span>
            <span>NUR SIMULATION</span>
          </div>
          <Terminal run={run} resetKey={resetKey} />
          <form
            className="command-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(terminalInput);
            }}
          >
            <label className="sr-only" htmlFor="command">
              Simulierten Befehl eingeben
            </label>
            <span>$</span>
            <input
              id="command"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              spellCheck={false}
            />
            <button aria-label="Simulierten Befehl ausführen" type="submit">
              <Play size={16} />
            </button>
          </form>
        </section>
        <section className="lab-graph panel">
          <div className="panel-bar">
            <div className="segmented">
              <button
                className={tab === "graph" ? "selected" : ""}
                onClick={() => setTab("graph")}
              >
                Cluster
              </button>
              <button
                className={tab === "resources" ? "selected" : ""}
                onClick={() => setTab("resources")}
              >
                Ressourcen
              </button>
            </div>
            <Badge color="green">{pods(cluster).length} Pods</Badge>
          </div>
          {tab === "graph" ? (
            <>
              <ClusterGraph cluster={cluster} compact />
              <Link className="graph-open-link" to="/visualizer">
                Diesen Cluster im Visualizer untersuchen
              </Link>
              {pods(cluster).length > 6 && (
                <p className="subtle graph-note">
                  Die ersten 6 Pods sind im Diagramm sichtbar.
                </p>
              )}
            </>
          ) : (
            <div className="resource-list">
              {!cluster.resources.length ? (
                <p>Noch keine Ressourcen. Wende dein Manifest an.</p>
              ) : (
                cluster.resources.map((r) => (
                  <div
                    key={`${r.kind}-${r.metadata.namespace}-${r.metadata.name}`}
                  >
                    <Box size={19} />
                    <div>
                      <strong>{r.metadata.name}</strong>
                      <span>
                        {r.kind} · {r.metadata.namespace || "default"}
                      </span>
                    </div>
                    <Badge color="blue">Simuliert</Badge>
                  </div>
                ))
              )}
            </div>
          )}
          {services.length > 0 && (
            <div className="endpoint-feedback" aria-label="Service-Endpunkte">
              {services.map((s) => (
                <p key={`${s.metadata.namespace}/${s.metadata.name}`}>
                  <strong>{s.metadata.name}</strong>:{" "}
                  {serviceEndpoints(cluster, s).length} passende Pod-Endpunkte
                  {serviceEndpoints(cluster, s).length === 0
                    ? " · Selektor und Namespace prüfen"
                    : ""}
                </p>
              ))}
            </div>
          )}
          <div className="lab-output">
            <div className="eyebrow">LETZTES SIMULATIONSERGEBNIS</div>
            <pre role="status">{output}</pre>
          </div>
        </section>
      </div>
      <div className="notice lab-notice">
        <ShieldCheck size={18} />
        <span>
          Unterstützt: Deployment, Pod und Service. Die Simulation prüft einen
          begrenzten Schemasatz und nimmt erfolgreiche Containerstarts an.
          Netzwerkpakete, Images und Policies werden nicht ausgeführt.{" "}
          <code>help</code> zeigt die erlaubten Befehle.
        </span>
      </div>
    </>
  );
}
