import {
  topicById,
  learningPaths,
  pathTopics,
} from "../../../../packages/lesson-engine/src/library";
import { TopicLinks } from "./Learning";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  quizFor,
  basicPracticeTasks,
  deepDiveTasks,
  deepDiveMastered,
  practiceMastered,
  type Lesson,
} from "../../../../packages/lesson-engine/src";
import { LessonBlocks } from "../components/LessonBlocks";
import { Heading } from "../components/Page";
import { useProgress } from "../stores/progress";
// The key belongs to this public boundary, so *any* caller changing the lesson resets quizzes, tasks and models.
export function LessonPage({ lesson }: { lesson: Lesson }) {
  return <LessonSession key={lesson.id} lesson={lesson} />;
}
function LessonSession({ lesson }: { lesson: Lesson }) {
  const p = useProgress();
  const [search] = useSearchParams();
  const topic = topicById(lesson.id)!;
  const activePath = learningPaths.find(
    (path) =>
      path.id === search.get("path") &&
      pathTopics(path).some((t) => t.id === topic.id),
  );
  const read = p.readCompleted.includes(lesson.id);
  const [evidence, setEvidence] = useState<Record<string, string[]>>({});
  const theory = p.theoryCompleted.includes(lesson.id);
  const tasks = basicPracticeTasks(lesson);
  const advanced = deepDiveTasks(lesson);
  const [mode, setMode] = useState<"guided" | "challenge">("guided");
  const [attempt, setAttempt] = useState(0);
  const mastered = practiceMastered(lesson, p.practiceCompleted);
  useEffect(() => {
    const progress = useProgress.getState();
    // A passive visit must not overwrite a saved record that failed migration.
    if (!progress.error)
      progress.update({
        lastLesson: lesson.id,
        recentLesson: lesson.id,
        ...(activePath ? { lastPath: activePath.id } : {}),
      });
  }, [lesson.id, activePath?.id]);
  useEffect(() => {
    const section = search.get("section");
    if (!section || !topic.deepDives.some((d) => d.section === section)) return;
    const target = document.getElementById(`section-${section}`);
    if (target instanceof HTMLDetailsElement) target.open = true;
    const frame = requestAnimationFrame(() => {
      target?.scrollIntoView({ block: "start" });
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [lesson.id, search.toString()]);
  return (
    <>
      <Link
        className="text-link back-link"
        to={activePath ? `/paths/${activePath.id}` : "/discover"}
      >
        ← {activePath ? activePath.title : "Themen entdecken"}
      </Link>
      <Heading
        eyebrow={topic.category}
        title={lesson.title}
        description={lesson.description}
      />
      <div className="reading-status">
        <button
          className="button secondary"
          aria-pressed={read}
          disabled={!!p.error}
          onClick={() =>
            p.update({
              readCompleted: read
                ? p.readCompleted.filter((id) => id !== lesson.id)
                : [...new Set([...p.readCompleted, lesson.id])],
            })
          }
        >
          {read ? "Gelesen ✓ · Markierung aufheben" : "Als gelesen markieren"}
        </button>
        <span>
          Dein Lesestatus gilt in allen Lernpfaden. Aufgaben und Vertiefungen
          sind freiwillig.
        </span>
      </div>
      {lesson.duration && (
        <p className="subtle">
          Orientierung: etwa {lesson.duration} Minuten, je nach gewählten
          Abschnitten. Kein Zeitziel.
        </p>
      )}
      <p className="subtle" role="status" data-testid="progress-save-status">
        {p.saveStatus === "saved"
          ? "Lernstand lokal gespeichert"
          : p.saveStatus === "pending"
            ? "Lernstand wird gespeichert … Bitte vor dem Neuladen warten."
            : p.saveStatus === "error"
              ? "Lernstand nicht gespeichert. Exportiere eine Sicherung in den Einstellungen."
              : "Lernstand wird geladen …"}
      </p>
      <details className="optional-records">
        <summary>Optionale Übungen und bisherige Nachweise</summary>
        <p>
          Diese Nachweise bleiben erhalten. Du kannst die Lektion unabhängig
          davon als gelesen markieren.
        </p>
        <div className="lesson-progress-badges">
          <span data-testid="theory-status">
            {theory ? "Grundlagen abgeschlossen" : quizFor(lesson) ? "Grundlagen offen" : "Kein Wissenscheck vorgesehen"}
          </span>
          <span data-testid="practice-status">
            {mastered
              ? "Praxis abgeschlossen"
              : tasks.length
                ? "Praxis offen"
                : "Praxis nicht automatisch geprüft"}
          </span>
          <span data-testid="deep-dive-status">
            {deepDiveMastered(lesson, p)
              ? "Deep Dive gemeistert"
              : advanced.length
                ? "Deep Dive offen · optional"
                : "Keine gesonderte Deep-Dive-Prüfung"}
          </span>
        </div>
        {tasks.length > 0 && (
          <p className="subtle" data-testid="practice-count">
            {
              tasks.filter((t) =>
                p.practiceCompleted.includes(`${lesson.id}/${t.id}`),
              ).length
            }{" "}
            von {tasks.length} Praxisaufgaben geprüft
            {lesson.sections.some((s) => s.collapsible)
              ? " · optionale Vertiefungen zählen separat"
              : ""}
            .
          </p>
        )}
        {advanced.length > 0 && (
          <div className="panel learning-mode">
            <strong>Lernmodus</strong>
            <div className="deep-actions">
              {(["guided", "challenge"] as const).map((m) => (
                <button
                  key={m}
                  className="button secondary"
                  aria-pressed={mode === m}
                  onClick={() => {
                    setMode(m);
                    setEvidence({});
                    setAttempt((a) => a + 1);
                  }}
                >
                  {m === "guided"
                    ? "Geführt lernen"
                    : "Eigenständige Challenge"}
                </button>
              ))}
              <button
                className="button secondary"
                onClick={() => {
                  setEvidence({});
                  setAttempt((a) => a + 1);
                }}
              >
                Neuen Versuch starten
              </button>
            </div>
            <p>
              {mode === "guided"
                ? "Hinweise und Prüfpfade unterstützen das Lernen. Ergebnisse werden als Übung gespeichert."
                : "Kein nächster Schritt und keine laufende Prüfliste. Diagnosefälle haben keine vorgeschriebene Reihenfolge. Aufgedeckte Hilfe macht diesen Versuch zur Übung."}{" "}
              Ein Moduswechsel startet einen neuen Versuch; gespeicherte
              Abschlüsse bleiben erhalten.
            </p>
            <p data-testid="deep-dive-count">
              {
                advanced.filter((t) =>
                  p.independentCompleted.includes(`${lesson.id}/${t.id}`),
                ).length
              }{" "}
              von {advanced.length} eigenständigen Nachweisen. Der historische
              Vertiefungsnachweis zählt Grundlagen und Praxis mit; dein
              Lesestatus ist davon unabhängig.
            </p>
          </div>
        )}
      </details>
      <div className="lesson-layout reading-layout">
        <article className="prose architecture-lesson reading-article">
          {lesson.goals.length > 0 && (
            <section className="learning-goals">
              <h2>Nach dieser Lektion kannst du …</h2>
              <ul>
                {lesson.goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          )}
          <nav className="lesson-toc" aria-label="Abschnitte der Lektion">
            {lesson.sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const target = document.getElementById(`section-${s.id}`);
                  if (target instanceof HTMLDetailsElement) target.open = true;
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  });
                }}
              >
                {s.navLabel}
              </button>
            ))}
          </nav>
          {lesson.sections.map((s) => {
            const Tag = s.collapsible ? "details" : "section";
            return (
              <Tag
                className={s.collapsible ? "internals-section" : undefined}
                id={`section-${s.id}`}
                tabIndex={-1}
                key={s.id}
              >
                {s.collapsible ? (
                  <summary>{s.title} · optional</summary>
                ) : (
                  <h2>{s.title}</h2>
                )}
                <LessonBlocks
                  key={`${mode}-${attempt}`}
                  mode={mode}
                  blocks={s.blocks}
                  lessonId={lesson.id}
                  evidence={evidence}
                  onEvidence={(id, event) =>
                    setEvidence((old) => ({
                      ...old,
                      [id]: event === null ? [] : [...(old[id] || []), event],
                    }))
                  }
                />
              </Tag>
            );
          })}
          {topic.kubeshop && (
            <p className="notice">
              <strong>KubeShop-Bezug: </strong>
              {topic.kubeshop}
            </p>
          )}
          <section className="lesson-sources">
            <h3>Technische Quellen</h3>
            <p>
              Redaktioneller Stand:{" "}
              {lesson.reviewedOn.split("-").reverse().join(".")}. Die
              Lernmodelle sind keine Ausführung eines echten
              Kubernetes-Clusters.
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
        <TopicLinks topic={topic} path={activePath?.id} />
      </div>
    </>
  );
}
