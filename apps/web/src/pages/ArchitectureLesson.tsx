import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, GraduationCap } from "lucide-react";
import {
  architectureLessons,
  type ArchitectureLesson as Lesson,
} from "../../../../content/architecture/lessons";
import { ArchitectureExperiment } from "../components/ArchitectureExperiments";
import { Heading, Badge } from "../components/Page";
import { useProgress } from "../stores/progress";
export function ArchitectureLesson({ lesson }: { lesson: Lesson }) {
  const p = useProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const index = architectureLessons.indexOf(lesson);
  const next = architectureLessons[index + 1];
  useEffect(() => {
    useProgress.getState().update({ lastLesson: lesson.id });
  }, [lesson.id]);
  const passed = lesson.questions.every((q, i) => answers[i] === q.correct);
  function submit() {
    setChecked(true);
    if (passed)
      p.update({ completed: [...new Set([...p.completed, lesson.id])] });
  }
  return (
    <>
      <Link className="text-link back-link" to="/academy?module=03">
        Academy / Modul 03 · Kubernetes Architecture
      </Link>
      <Heading
        eyebrow={`MODUL 03 · LEKTION ${String(index + 1).padStart(2, "0")} VON 09`}
        title={lesson.title}
        description={`${lesson.duration} Minuten · ${lesson.level} · Praxisprojekt Teamboard`}
        action={
          <Badge color="blue">
            {p.completed.includes(lesson.id) ? "Abgeschlossen" : lesson.level}
          </Badge>
        }
      />
      <div className="lesson-layout">
        <article className="prose panel architecture-lesson">
          <section className="learning-goals">
            <h2>Nach dieser Lektion kannst du …</h2>
            <ul>
              {lesson.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>
          <nav className="lesson-toc" aria-label="Abschnitte der Lektion">
            {[
              "Einführung",
              "Deep Dive",
              "Experiment",
              "Praxis",
              "Wissenscheck",
            ].map((label, i) => (
              <button
                key={label}
                onClick={() =>
                  document
                    .getElementById(`lesson-section-${i}`)
                    ?.scrollIntoView({
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                      block: "start",
                    })
                }
              >
                {label}
              </button>
            ))}
          </nav>
          <section id="lesson-section-0">
            <h2>1 · Das Problem verstehen</h2>
            {lesson.introduction.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section id="lesson-section-1">
            <h2>2 · Technischer Deep Dive</h2>
            {lesson.deepDive.map((item) => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </section>
          <section id="lesson-section-2">
            <h2>3 · Erkunden und experimentieren</h2>
            <ArchitectureExperiment kind={lesson.experiment} />
            <div className="lesson-task">
              <h3>Deine Aufgabe</h3>
              <p>{lesson.task.prompt}</p>
              <details>
                <summary>Hinweis anzeigen</summary>
                <p>{lesson.task.hint}</p>
              </details>
              <details>
                <summary>Lösung und Begründung vergleichen</summary>
                <p>{lesson.task.solution}</p>
              </details>
            </div>
          </section>
          <section id="lesson-section-3">
            <h2>4 · Im Teamboard-Projekt anwenden</h2>
            {lesson.practice.map((text) => (
              <p key={text}>{text}</p>
            ))}
            <div className="hint">
              <strong>5 · Fehleranalyse</strong>
              <p>{lesson.troubleshooting}</p>
            </div>
            <details className="expert-task">
              <summary>Expert-Challenge · Transfer auf die Architektur</summary>
              <p>
                <strong>{lesson.expert.prompt}</strong>
              </p>
              <details>
                <summary>Begründete Lösung</summary>
                <p>{lesson.expert.answer}</p>
              </details>
            </details>
          </section>
          <section className="quiz" id="lesson-section-4">
            <div className="eyebrow">6 · WISSENSCHECK</div>
            <h2>Kannst du die Zusammenhänge erklären?</h2>
            <p>
              Beantworte alle drei Fragen richtig. Erst dann wird diese Lektion
              als abgeschlossen gespeichert.
            </p>
            {lesson.questions.map((q, i) => (
              <fieldset key={q.prompt} className="architecture-question">
                <legend>
                  {i + 1}. {q.prompt}
                </legend>
                {q.answers.map((answer, a) => (
                  <label
                    className={`quiz-option ${answers[i] === a ? "chosen" : ""}`}
                    key={answer}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      checked={answers[i] === a}
                      onChange={() => {
                        setAnswers((old) => ({ ...old, [i]: a }));
                        setChecked(false);
                      }}
                    />
                    {answer}
                  </label>
                ))}
                {checked && (
                  <p
                    className={
                      answers[i] === q.correct ? "result-ok" : "result-fail"
                    }
                  >
                    {answers[i] === q.correct
                      ? "Richtig. "
                      : "Noch nicht richtig. "}
                    {q.explanation}
                  </p>
                )}
              </fieldset>
            ))}
            <button
              className="button primary"
              disabled={Object.keys(answers).length !== lesson.questions.length}
              onClick={submit}
            >
              Wissenscheck auswerten
            </button>
            {checked && (
              <div
                role="status"
                className={`notice ${passed ? "success" : "warning"}`}
              >
                {passed
                  ? "Alle drei Antworten sind richtig. Lektion abgeschlossen und Lernstand aktualisiert."
                  : "Noch nicht abgeschlossen. Lies die Begründungen und versuche es erneut."}
              </div>
            )}
          </section>
          <div className="lesson-navigation">
            {index > 0 && (
              <Link
                className="button secondary"
                to={`/academy/${architectureLessons[index - 1].id}`}
              >
                Vorherige Lektion
              </Link>
            )}
            <Link
              className="button primary"
              to={next ? `/academy/${next.id}` : "/academy?module=03"}
            >
              {next ? "Nächste Lektion" : "Zur Modulübersicht"}
            </Link>
          </div>
          <section className="lesson-sources">
            <h3>Technische Quellen</h3>
            <p>
              Inhaltlich an den offiziellen Dokumentationen ausgerichtet.
              Redaktioneller Stand: 11. Oktober 2026. Die Lernmodelle sind keine
              Ausführung eines echten Kubernetes-Clusters.
            </p>
            <ul>
              {lesson.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
        <aside className="lesson-aside panel">
          <GraduationCap size={25} />
          <h3>Modul 03 · Dein Lernpfad</h3>
          <p className="subtle">
            {
              architectureLessons.filter((l) => p.completed.includes(l.id))
                .length
            }{" "}
            / 9 Lektionen abgeschlossen
          </p>
          {architectureLessons.map((l, i) => (
            <Link
              className={l.id === lesson.id ? "current" : ""}
              to={`/academy/${l.id}`}
              key={l.id}
            >
              <span>
                {p.completed.includes(l.id) ? (
                  <Check size={16} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              {l.title}
            </Link>
          ))}
          <Link to="/operations">YAML-Spielplatz öffnen</Link>
          <Link to="/visualizer">Gespeicherten Cluster erkunden</Link>
        </aside>
      </div>
    </>
  );
}
