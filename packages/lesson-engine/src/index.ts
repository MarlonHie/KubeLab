import { lessonDocuments } from "../../../content/lessons/catalog";
import { parseCatalog } from "./schema";
import type { Lesson, QuizBlock, TaskBlock } from "./types";
import { curriculum } from "./curriculum";
export const lessons = parseCatalog(lessonDocuments);
export const architectureLessons = lessons.filter((l) => l.moduleId === "03");
export const phases = curriculum.map((module) => [
  module.title,
  module.topics,
  module.id,
]);
export function quizFor(lesson: Lesson): QuizBlock | undefined {
  return lesson.sections
    .flatMap((s) => s.blocks)
    .find((b): b is QuizBlock => b.type === "quiz");
}
export function practiceTasks(lesson: Lesson): TaskBlock[] {
  return lesson.sections
    .flatMap((s) => s.blocks)
    .filter(
      (b): b is TaskBlock =>
        b.type === "task" && b.verification.kind !== "reflection",
    );
}
export const practiceKey = (lessonId: string, taskId: string) =>
  `${lessonId}/${taskId}`;
export function practiceMastered(lesson: Lesson, completed: string[]) {
  const tasks = basicPracticeTasks(lesson);
  return (
    tasks.length > 0 &&
    tasks.every((t) => completed.includes(practiceKey(lesson.id, t.id)))
  );
}
export { curriculum };
export type * from "./types";

export const basicPracticeTasks = (lesson: Lesson) =>
  practiceTasks(lesson).filter((t) => !t.tier || t.tier === "practice");
export const deepDiveTasks = (lesson: Lesson) =>
  practiceTasks(lesson).filter((t) => t.tier === "deep-dive");
export function deepDiveMastered(
  lesson: Lesson,
  progress: {
    theoryCompleted: string[];
    practiceCompleted: string[];
    independentCompleted: string[];
  },
) {
  const tasks = deepDiveTasks(lesson);
  return (
    progress.theoryCompleted.includes(lesson.id) &&
    practiceMastered(lesson, progress.practiceCompleted) &&
    tasks.length > 0 &&
    tasks.every((t) =>
      progress.independentCompleted.includes(practiceKey(lesson.id, t.id)),
    )
  );
}
