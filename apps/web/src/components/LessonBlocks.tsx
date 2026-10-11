import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import type {
  LessonBlock,
  TaskBlock,
  QuizBlock,
  LearningMode,
} from "../../../../packages/lesson-engine/src/types";
import { practiceKey } from "../../../../packages/lesson-engine/src";
import {
  gradeQuiz,
  checkPractice,
} from "../../../../packages/lesson-engine/src/assessment";
import { useProgress } from "../stores/progress";
import { ArchitectureExperiment } from "./ArchitectureExperiments";
import { DeepDiveExperiment } from "./DeepDiveExperiments";
import { diagnosticCases } from "../../../../packages/simulation-engine/src/diagnosis";
// Deliberately small inline vocabulary. React escapes all text; no raw HTML or executable MDX.
export function Inline({ text }: { text: string }) {
  const parts = text.split(
    /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https:\/\/[^\s)]+\))/g,
  );
  return (
    <>
      {parts.map((s, i) => {
        if (s.startsWith("**"))
          return <strong key={i}>{s.slice(2, -2)}</strong>;
        if (s.startsWith("`")) return <code key={i}>{s.slice(1, -1)}</code>;
        const link = s.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
        if (link)
          return (
            <a key={i} href={link[2]} target="_blank" rel="noreferrer">
              {link[1]}
            </a>
          );
        return s;
      })}
    </>
  );
}
function highlight(code: string, language: string): ReactNode {
  if (language === "text") return code;
  // Lightweight token colouring for teaching snippets, not a language parser.
  const pattern =
    /("(?:[^"\\]|\\.)*"|'[^']*'|#[^\n]*|\b(?:true|false|null|sudo|kubectl|cat|ps|lsns|systemctl)\b|\b\d+(?:\.\d+)?\b|[\w.-]+(?=:\s|:$)|--?[a-z][\w-]*)/gm;
  return code.split(pattern).map((s, i) =>
    i % 2 ? (
      <span
        key={i}
        className={`syntax-${s.startsWith("#") ? "comment" : /^['"]/.test(s) ? "string" : /^\d/.test(s) ? "number" : "keyword"}`}
      >
        {s}
      </span>
    ) : (
      s
    ),
  );
}
function CodeBlock({
  block,
}: {
  block: Extract<LessonBlock, { type: "code" }>;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const labels = {
    external: "Externes VM-Terminal",
    simulation: "Browser-Simulation",
    example: "Beispiel · keine Ausführung",
    output: "Beispielausgabe · nicht live",
  };
  return (
    <figure className="lesson-code">
      <figcaption>
        <span>
          {block.filename || block.language} · {labels[block.execution]}
        </span>
        <button
          className="text-button"
          aria-label={`Code kopieren: ${block.filename || block.caption}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(block.code);
              setCopied(true);
              setError(false);
            } catch {
              setError(true);
            }
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}Kopieren
        </button>
      </figcaption>
      <pre tabIndex={0}>
        <code className={`language-${block.language}`}>
          {highlight(block.code, block.language)}
        </code>
      </pre>
      <p>{block.caption}</p>
      {(copied || error) && (
        <small role="status">
          {error
            ? "Kopieren nicht möglich. Markiere den Code manuell."
            : "Code kopiert."}
        </small>
      )}
    </figure>
  );
}
function KnowledgeCheck({
  block,
  lessonId,
}: {
  block: QuizBlock;
  lessonId: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const progress = useProgress();
  const passed = gradeQuiz(block.questions, answers);
  return (
    <div className="quiz" data-testid="knowledge-check">
      <h2>{block.title}</h2>
      <p>
        Beantworte alle {block.questions.length} Fragen richtig, um die
        Grundlagen abzuschließen. Praxisaufgaben werden getrennt geprüft.
      </p>
      {block.questions.map((q, i) => (
        <fieldset key={q.id} className="architecture-question">
          <legend>
            {i + 1}. {q.prompt}
          </legend>
          {q.answers.map((a, index) => (
            <label
              className={`quiz-option ${answers[q.id] === index ? "chosen" : ""}`}
              key={a}
            >
              <input
                type="radio"
                name={`${lessonId}-${block.id}-${q.id}`}
                checked={answers[q.id] === index}
                onChange={() => {
                  setAnswers((old) => ({ ...old, [q.id]: index }));
                  setChecked(false);
                }}
              />
              <Inline text={a} />
            </label>
          ))}
          {checked && (
            <p
              className={
                answers[q.id] === q.correct ? "result-ok" : "result-fail"
              }
            >
              {answers[q.id] === q.correct
                ? "Richtig. "
                : "Noch nicht richtig. "}
              {q.explanation}
            </p>
          )}
        </fieldset>
      ))}
      <button
        className="button primary"
        disabled={Object.keys(answers).length !== block.questions.length}
        onClick={() => {
          setChecked(true);
          if (passed)
            progress.update({
              theoryCompleted: [
                ...new Set([...progress.theoryCompleted, lessonId]),
              ],
            });
        }}
      >
        Wissenscheck auswerten
      </button>
      {checked && (
        <p role="status" className={`notice ${passed ? "success" : "warning"}`}>
          {passed
            ? "Alle Antworten sind richtig. Grundlagen abgeschlossen und Lernstand aktualisiert."
            : "Grundlagen noch nicht abgeschlossen. Lies die Begründungen und versuche es erneut."}
        </p>
      )}
    </div>
  );
}
function PracticeTask({
  block,
  lessonId,
  evidence,
  mode,
}: {
  block: TaskBlock;
  lessonId: string;
  evidence: Record<string, string[]>;
  mode: LearningMode;
}) {
  const p = useProgress();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [inspected, setInspected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const [hint, setHint] = useState(false);
  const [solution, setSolution] = useState(false);
  const v = block.verification;
  const diagnostic = v.kind === "diagnosis" ? diagnosticCases[v.caseId] : null;
  const observations =
    v.kind === "experiment" || v.kind === "state-machine"
      ? evidence[v.experimentId] || []
      : inspected;
  const checks = checkPractice(block, answers, observations);
  const passed = checks.length > 0 && checks.every((c) => c.passed);
  const key = practiceKey(lessonId, block.id);
  const independent = block.tier === "deep-dive";
  const choose = (i: number, value: string) => {
    setAnswers((old) => ({ ...old, [i]: value }));
    setChecked(false);
  };
  const options = (label: string, i: number, values: string[]) => (
    <label className="matching-row">
      <span>
        <Inline text={label} />
      </span>
      <select
        value={answers[i] || ""}
        onChange={(e) => choose(i, e.target.value)}
      >
        <option value="">Antwort wählen</option>
        {values.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  if (mode === "challenge" && v.kind === "state-machine") return null;
  return (
    <section className="lesson-task" data-testid={`practice-${block.id}`}>
      <h3>{block.title}</h3>
      <p className="subtle">
        {independent
          ? "Optionaler Deep-Dive-Nachweis"
          : block.tier === "exploration"
            ? "Optionale Modellübung"
            : "Grundlegende Praxis"}{" "}
        ·{" "}
        {mode === "challenge"
          ? "Eigenständige Challenge"
          : "Geführter Lernmodus"}
      </p>
      <p>
        <Inline
          text={
            mode === "challenge" && v.kind === "state-machine"
              ? "Zeige im Modell einen fehlgeschlagenen Übergang und die korrekte Wiederherstellung. Prüfe den vollständigen Ablauf ohne eingeblendeten Prüfpfad. Diese Modellübung ersetzt die eigenständige Diagnose nicht."
              : block.prompt
          }
        />
      </p>
      {diagnostic && (
        <div className="diagnostic-workbench">
          <div className="eyebrow">
            MODELLFALL · KEINE ECHTEN MESSWERTE ODER TERMINALAUSGABEN
          </div>
          <h4>{diagnostic.title}</h4>
          <p>{diagnostic.symptom}</p>
          <div className="deep-actions">
            {diagnostic.evidence.map((e) => (
              <button
                className="button secondary"
                key={e.id}
                onClick={() => {
                  setInspected((old) => [...new Set([...old, e.id])]);
                  setChecked(false);
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
          {diagnostic.evidence
            .filter((e) => inspected.includes(e.id))
            .map((e) => (
              <p className="notice" key={e.id}>
                <strong>{e.label}: </strong>
                {e.observation}
              </p>
            ))}
          {mode === "guided" && (
            <p>
              Erhebe die verfügbaren Befunde und vergleiche die Ursachen. Es
              gibt keine vorgeschriebene Untersuchungsreihenfolge.
            </p>
          )}
          {options("Wahrscheinlichste Ursache", 0, diagnostic.causes)}
          {options("Begründete Korrektur", 1, diagnostic.remedies)}
        </div>
      )}
      {v.kind === "matching" && (
        <>
          <p>{v.instruction}</p>
          {v.items.map((item, i) => (
            <div key={item.prompt}>{options(item.prompt, i, v.options)}</div>
          ))}
        </>
      )}
      <div className="deep-actions">
        <button
          className="button secondary"
          onClick={() => {
            setHint(true);
            setAssisted(true);
          }}
        >
          Hinweis anzeigen
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setSolution(true);
            setAssisted(true);
          }}
        >
          Lösung bewusst aufdecken
        </button>
      </div>
      {hint && (
        <p className="notice">
          <Inline text={block.hint} />
        </p>
      )}
      {solution && (
        <p className="notice">
          <strong>Lösung: </strong>
          <Inline text={diagnostic?.explanation || block.solution} />
        </p>
      )}
      {assisted && independent && (
        <p className="subtle">
          Dieser Versuch nutzt Hilfe und zählt als Übung. Für einen
          eigenständigen Nachweis starte einen neuen Versuch ohne Hilfe.
        </p>
      )}
      {v.kind !== "reflection" ? (
        <>
          {mode === "guided" &&
            (v.kind === "experiment" ||
              v.kind === "state-machine" ||
              checked) && (
              <ul className="practice-checks">
                {checks.map((c, i) => (
                  <li key={i}>
                    {c.passed ? "✓ " : "○ "}
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          <button
            className="button primary"
            onClick={() => {
              setChecked(true);
              if (passed)
                p.update({
                  practiceCompleted: [
                    ...new Set([...p.practiceCompleted, key]),
                  ],
                  independentCompleted:
                    independent && mode === "challenge" && !assisted
                      ? [...new Set([...p.independentCompleted, key])]
                      : p.independentCompleted,
                });
            }}
          >
            Praxisaufgabe prüfen
          </button>
          {checked && (
            <p role="status" className={passed ? "result-ok" : "result-fail"}>
              {passed
                ? "Praxisaufgabe erfolgreich geprüft."
                : "Noch nicht gelöst. Prüfe Befunde, Ursache und Korrektur beziehungsweise deinen Modellablauf."}
              {passed && independent && (mode !== "challenge" || assisted)
                ? " Als Übung gespeichert; eigenständiger Nachweis noch offen."
                : ""}
            </p>
          )}
          <p className="subtle">
            {p.practiceCompleted.includes(key)
              ? "Praxisnachweis im Lernstand erfasst."
              : "Noch kein gespeicherter Praxisnachweis."}
            {independent
              ? p.independentCompleted.includes(key)
                ? " Eigenständiger Nachweis erfasst."
                : " Eigenständiger Nachweis offen."
              : ""}{" "}
            Gilt für diese Modellaufgabe, nicht für echten Systembetrieb.
          </p>
        </>
      ) : (
        <p className="subtle">
          Offene Reflexion · kein automatischer Praxisnachweis.
        </p>
      )}
    </section>
  );
}
export function LessonBlocks({
  blocks,
  lessonId,
  evidence,
  onEvidence,
  mode = "guided",
}: {
  blocks: LessonBlock[];
  mode?: LearningMode;
  lessonId: string;
  evidence: Record<string, string[]>;
  onEvidence: (id: string, event: string | null) => void;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = "id" in block ? block.id : i;
        switch (block.type) {
          case "text":
            return (
              <p key={key}>
                <Inline text={block.text} />
              </p>
            );
          case "heading":
            return (
              <h3 key={key}>
                <Inline text={block.text} />
              </h3>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={key}>
                {block.items.map((s, i) => (
                  <li key={i}>
                    <Inline text={s} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "code":
            return <CodeBlock key={key} block={block} />;
          case "table":
            return (
              <div
                className="lesson-table"
                key={key}
                role="region"
                aria-label={block.caption}
                tabIndex={0}
              >
                <table>
                  <caption>{block.caption}</caption>
                  <thead>
                    <tr>
                      {block.headers.map((h, i) => (
                        <th scope="col" key={i}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((s, j) => (
                          <td key={j}>
                            <Inline text={s} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <aside className={`lesson-callout ${block.tone}`} key={key}>
                <strong>{block.title}</strong>
                <p>
                  <Inline text={block.text} />
                </p>
              </aside>
            );
          case "experiment":
            if (
              block.kind === "raft-internals" ||
              block.kind === "scheduler-internals"
            ) {
              if (mode === "challenge")
                return (
                  <p className="notice" key={key}>
                    Das geführte Modell ist im Lernmodus verfügbar. Bearbeite
                    hier die eigenständigen Transfer- und Diagnoseaufgaben ohne
                    vorgeschriebenen Aktionspfad.
                  </p>
                );
              return (
                <DeepDiveExperiment
                  key={key}
                  kind={block.kind}
                  actions={evidence[block.id] || []}
                  onAction={(action) => onEvidence(block.id, action)}
                />
              );
            }
            return (
              <ArchitectureExperiment
                key={key}
                kind={block.kind}
                onEvidence={(event) => onEvidence(block.id, event)}
              />
            );
          case "task":
            return (
              <PracticeTask
                key={key}
                block={block}
                lessonId={lessonId}
                evidence={evidence}
                mode={mode}
              />
            );
          case "quiz":
            return (
              <KnowledgeCheck key={key} block={block} lessonId={lessonId} />
            );
          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}
    </>
  );
}
