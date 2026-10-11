import { checkDiagnosis } from "../../simulation-engine/src/diagnosis";
import { checkChallenge } from "./challenges";
import type { Question, TaskBlock } from "./types";
export function gradeQuiz(
  questions: Question[],
  answers: Record<string, number>,
) {
  return (
    questions.length > 0 &&
    questions.every(
      (q) => Number.isInteger(answers[q.id]) && answers[q.id] === q.correct,
    )
  );
}
export function checkPractice(
  task: TaskBlock,
  answers: Record<number, string>,
  observations: readonly string[],
): { label: string; passed: boolean }[] {
  const v = task.verification;
  if (v.kind === "diagnosis")
    return checkDiagnosis(v.caseId, observations, answers);
  if (v.kind === "state-machine")
    return checkChallenge(v.challengeId, observations);
  if (v.kind === "reflection") return [];
  if (v.kind === "matching")
    return v.items.map((item, i) => ({
      label: item.prompt,
      passed: answers[i] === item.answer,
    }));
  return v.requirements.map((r) => ({
    label: r.label,
    passed: observations.includes(r.event),
  }));
}
