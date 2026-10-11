import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import type {
  LessonBlock,
  TaskBlock,
  QuizBlock,
} from "../../../../packages/lesson-engine/src/types";
import { practiceKey } from "../../../../packages/lesson-engine/src";
import {
  gradeQuiz,
  checkPractice,
} from "../../../../packages/lesson-engine/src/assessment";
import { useProgress } from "../stores/progress";
import { ArchitectureExperiment } from "./ArchitectureExperiments";
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
        Beantworte alle {block.questions.length} Fragen richtig, um die Theorie
        abzuschließen. Praxisaufgaben werden getrennt geprüft.
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
            ? "Alle Antworten sind richtig. Theorie verstanden und Lernstand aktualisiert."
            : "Theorie noch nicht abgeschlossen. Lies die Begründungen und versuche es erneut."}
        </p>
      )}
    </div>
  );
}
function PracticeTask({
  block,
  lessonId,
  evidence,
}: {
  block: TaskBlock;
  lessonId: string;
  evidence: Record<string, string[]>;
}) {
  const p = useProgress();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const v = block.verification;
  const observations =
    v.kind === "experiment" ? evidence[v.experimentId] || [] : [];
  const checks = checkPractice(block, answers, observations);
  const key = practiceKey(lessonId, block.id);
  const mastered = p.practiceCompleted.includes(key);
  const body = (
    <>
      <p>
        <Inline text={block.prompt} />
      </p>
      <details>
        <summary>Hinweis anzeigen</summary>
        <p>
          <Inline text={block.hint} />
        </p>
      </details>
      <details>
        <summary>Lösung und Begründung vergleichen</summary>
        <p>
          <Inline text={block.solution} />
        </p>
      </details>
      {v.kind === "reflection" ? (
        <p className="subtle">
          Offene Reflexion · kein automatischer Praxisnachweis.
        </p>
      ) : (
        <>
          <p>
            {v.kind === "matching"
              ? v.instruction
              : "Führe die Schritte im Experiment aus und prüfe anschließend deine Aufgabe. Zwischenstände gelten für diesen Lektionsbesuch; ein Experiment-Reset löscht sie."}
          </p>
          {v.kind === "matching" &&
            v.items.map((item, i) => (
              <label className="matching-row" key={item.prompt}>
                <span>
                  <Inline text={item.prompt} />
                </span>
                <select
                  value={answers[i] || ""}
                  onChange={(e) => {
                    setAnswers((old) => ({ ...old, [i]: e.target.value }));
                    setChecked(false);
                  }}
                >
                  <option value="">Zuordnung wählen</option>
                  {v.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          {(v.kind === "experiment" || checked) && (
            <ul className="practice-checks">
              {checks.map((c, i) => (
                <li key={i}>
                  {v.kind === "experiment" || checked
                    ? c.passed
                      ? "✓ "
                      : "○ "
                    : ""}
                  {c.label}
                  {checked && !c.passed ? " – noch offen" : ""}
                </li>
              ))}
            </ul>
          )}
          <button
            className="button primary"
            onClick={() => {
              setChecked(true);
              if (checks.length > 0 && checks.every((c) => c.passed))
                p.update({
                  practiceCompleted: [
                    ...new Set([...p.practiceCompleted, key]),
                  ],
                });
            }}
          >
            Praxisaufgabe prüfen
          </button>
          {checked && (
            <p
              role="status"
              className={
                checks.every((c) => c.passed) ? "result-ok" : "result-fail"
              }
            >
              {checks.every((c) => c.passed)
                ? "Praxisaufgabe erfolgreich geprüft."
                : "Noch nicht gelöst. Prüfe die offenen Schritte oder Zuordnungen."}
            </p>
          )}
          <p className="subtle">
            {mastered
              ? "Praxisnachweis im Lernstand erfasst."
              : "Noch kein gespeicherter Praxisnachweis."}{" "}
            Der Nachweis gilt für diese Modellaufgabe, nicht für einen echten
            Clusterbetrieb.
          </p>
        </>
      )}
    </>
  );
  if (v.kind === "reflection")
    return (
      <details className="expert-task">
        <summary>{block.title}</summary>
        {body}
      </details>
    );
  return (
    <section className="lesson-task" data-testid={`practice-${block.id}`}>
      <h3>{block.title}</h3>
      {body}
    </section>
  );
}
export function LessonBlocks({
  blocks,
  lessonId,
  evidence,
  onEvidence,
}: {
  blocks: LessonBlock[];
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
