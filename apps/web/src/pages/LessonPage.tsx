import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, GraduationCap } from "lucide-react";
import {
  lessons,
  curriculum,
  practiceTasks,
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
  const tasks = practiceTasks(lesson);
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
                {theory ? "Theorie verstanden" : "Theorie offen"}
              </span>
            </Badge>
            <Badge color={mastered ? "green" : "gray"}>
              <span data-testid="practice-status">
                {mastered
                  ? "Praxis gemeistert"
                  : tasks.length
                    ? "Praxis offen"
                    : "Praxis nicht automatisch geprüft"}
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
                onClick={() =>
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  })
                }
              >
                {s.navLabel}
              </button>
            ))}
          </nav>
          {lesson.sections.map((s) => (
            <section id={`section-${s.id}`} key={s.id}>
              <h2>{s.title}</h2>
              <LessonBlocks
                blocks={s.blocks}
                lessonId={lesson.id}
                evidence={evidence}
                onEvidence={(id, event) =>
                  setEvidence((old) => ({
                    ...old,
                    [id]:
                      event === null
                        ? []
                        : [...new Set([...(old[id] || []), event])],
                  }))
                }
              />
            </section>
          ))}
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
            Theorie:{" "}
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
            / {moduleLessons.filter((l) => practiceTasks(l).length > 0).length}{" "}
            prüfbare Lektionen
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
                    ? "Theorie ✓"
                    : "Theorie offen"}{" "}
                  ·{" "}
                  {practiceMastered(l, p.practiceCompleted)
                    ? "Praxis ✓"
                    : practiceTasks(l).length
                      ? "Praxis offen"
                      : "Praxis ungeprüft"}
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
