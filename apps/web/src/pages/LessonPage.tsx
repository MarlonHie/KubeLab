import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, GraduationCap } from "lucide-react";
import {
  lessons,
  curriculum,
  practiceTasks,
  basicPracticeTasks,
  deepDiveTasks,
  deepDiveMastered,
  practiceMastered,
  type Lesson,
} from "../../../../packages/lesson-engine/src";
import { LessonBlocks } from "../components/LessonBlocks";
import { Heading, Badge } from "../components/Page";
import { useProgress } from "../stores/progress";
// The key belongs to this public boundary, so *any* caller changing the lesson resets quizzes, tasks and models.
export function LessonPage({ lesson }: { lesson: Lesson }) {
  return <LessonSession key={lesson.id} lesson={lesson} />;
}
function LessonSession({ lesson }: { lesson: Lesson }) {
  const p = useProgress();
  const [evidence, setEvidence] = useState<Record<string, string[]>>({});
  const moduleLessons = lessons.filter((l) => l.moduleId === lesson.moduleId);
  const index = moduleLessons.indexOf(lesson);
  const next = moduleLessons[index + 1];
  const module = curriculum.find((m) => m.id === lesson.moduleId)!;
  const theory = p.theoryCompleted.includes(lesson.id);
  const tasks = basicPracticeTasks(lesson);
  const advanced = deepDiveTasks(lesson);
  const [mode, setMode] = useState<"guided" | "challenge">("guided");
  const [attempt, setAttempt] = useState(0);
  const mastered = practiceMastered(lesson, p.practiceCompleted);
  useEffect(() => {
    const progress = useProgress.getState();
    // A passive visit must not overwrite a saved record that failed migration.
    if (!progress.error) progress.update({ lastLesson: lesson.id });
  }, [lesson.id]);
  return (
    <>
      <Link
        className="text-link back-link"
        to={`/academy?module=${lesson.moduleId}`}
      >
        Academy / Modul {lesson.moduleId} · {module.title}
      </Link>
      <Heading
        eyebrow={`MODUL ${lesson.moduleId} · LEKTION ${String(index + 1).padStart(2, "0")} VON ${String(moduleLessons.length).padStart(2, "0")}`}
        title={lesson.title}
        description={`${lesson.duration} Minuten · ${lesson.level}`}
        action={
          <div className="lesson-progress-badges">
            <Badge color={theory ? "green" : "blue"}>
              <span data-testid="theory-status">
                {theory ? "Grundlagen abgeschlossen" : "Grundlagen offen"}
              </span>
            </Badge>
            <Badge color={mastered ? "green" : "gray"}>
              <span data-testid="practice-status">
                {mastered
                  ? "Praxis abgeschlossen"
                  : tasks.length
                    ? "Praxis offen"
                    : "Praxis nicht automatisch geprüft"}
              </span>
            </Badge>
            <Badge color={deepDiveMastered(lesson, p) ? "green" : "gray"}>
              <span data-testid="deep-dive-status">
                {deepDiveMastered(lesson, p)
                  ? "Deep Dive gemeistert"
                  : advanced.length
                    ? "Deep Dive offen · optional"
                    : "Deep Dive noch nicht verfügbar"}
              </span>
            </Badge>
          </div>
        }
      />
      <p className="subtle" role="status" data-testid="progress-save-status">
        {p.saveStatus === "saved"
          ? "Lernstand lokal gespeichert"
          : p.saveStatus === "pending"
            ? "Lernstand wird gespeichert … Bitte vor dem Neuladen warten."
            : p.saveStatus === "error"
              ? "Lernstand nicht gespeichert. Exportiere eine Sicherung in den Einstellungen."
              : "Lernstand wird geladen …"}
      </p>
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
                {m === "guided" ? "Geführt lernen" : "Eigenständige Challenge"}
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
            von {advanced.length} eigenständigen Nachweisen. Deep Dive setzt
            außerdem Grundlagen und grundlegende Praxis voraus.
          </p>
        </div>
      )}
      <div className="lesson-layout">
        <article className="prose panel architecture-lesson">
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
          <div className="lesson-navigation">
            {index > 0 && (
              <Link
                className="button secondary"
                to={`/academy/${moduleLessons[index - 1].id}`}
              >
                Vorherige Lektion
              </Link>
            )}
            <Link
              className="button primary"
              to={
                next
                  ? `/academy/${next.id}`
                  : `/academy?module=${lesson.moduleId}`
              }
            >
              {next ? "Nächste Lektion" : "Zur Modulübersicht"}
            </Link>
          </div>
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
        <aside className="lesson-aside panel">
          <GraduationCap size={25} />
          <h3>Modul {lesson.moduleId} · Dein Lernpfad</h3>
          <p className="subtle">
            Grundlagen:{" "}
            {
              moduleLessons.filter((l) => p.theoryCompleted.includes(l.id))
                .length
            }{" "}
            / {moduleLessons.length} · Praxis:{" "}
            {
              moduleLessons.filter((l) =>
                practiceMastered(l, p.practiceCompleted),
              ).length
            }{" "}
            /{" "}
            {
              moduleLessons.filter((l) => basicPracticeTasks(l).length > 0)
                .length
            }{" "}
            prüfbare Lektionen · Deep Dive:{" "}
            {moduleLessons.filter((l) => deepDiveMastered(l, p)).length} /{" "}
            {moduleLessons.filter((l) => deepDiveTasks(l).length > 0).length}
          </p>
          {moduleLessons.map((l, i) => (
            <Link
              className={l.id === lesson.id ? "current" : ""}
              to={`/academy/${l.id}`}
              key={l.id}
              aria-current={l.id === lesson.id ? "page" : undefined}
            >
              <span>
                {p.theoryCompleted.includes(l.id) ? (
                  <Check size={16} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                {l.title}
                <small>
                  {p.theoryCompleted.includes(l.id)
                    ? "Grundlagen ✓"
                    : "Grundlagen offen"}{" "}
                  ·{" "}
                  {practiceMastered(l, p.practiceCompleted)
                    ? "Praxis ✓"
                    : basicPracticeTasks(l).length
                      ? "Praxis offen"
                      : "Praxis ungeprüft"}
                  {" · "}
                  {deepDiveMastered(l, p)
                    ? "Deep Dive ✓"
                    : deepDiveTasks(l).length
                      ? "Deep Dive offen"
                      : "Deep Dive geplant"}
                </small>
              </div>
            </Link>
          ))}
          <Link to="/operations">YAML-Spielplatz öffnen</Link>
          <Link to="/visualizer">Gespeicherten Cluster erkunden</Link>
        </aside>
      </div>
    </>
  );
}
