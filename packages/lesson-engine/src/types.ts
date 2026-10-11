export type Level = "Fundamentals" | "Deep Dive" | "Expert";
export type Experiment =
  | "architecture"
  | "api"
  | "quorum"
  | "reconciliation"
  | "scheduler"
  | "runtime"
  | "flow"
  | "failure"
  | "raft-internals"
  | "scheduler-internals";
export interface Question {
  id: string;
  prompt: string;
  answers: string[];
  correct: number;
  explanation: string;
}
export type Verification =
  | {
      kind: "state-machine";
      experimentId: string;
      challengeId: "raft-partition-v1" | "scheduler-pipeline-v1";
    }
  | { kind: "reflection" }
  | {
      kind: "matching";
      instruction: string;
      options: string[];
      items: { prompt: string; answer: string }[];
    }
  | {
      kind: "experiment";
      experimentId: string;
      requirements: { event: string; label: string }[];
    };
export type LessonBlock =
  | { type: "text"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | {
      type: "code";
      language: "bash" | "yaml" | "json" | "text";
      code: string;
      execution: "external" | "simulation" | "example" | "output";
      caption: string;
      filename?: string;
    }
  | { type: "table"; caption: string; headers: string[]; rows: string[][] }
  | {
      type: "callout";
      tone: "note" | "warning" | "tip";
      title: string;
      text: string;
    }
  | { type: "experiment"; id: string; kind: Experiment }
  | {
      type: "task";
      id: string;
      title: string;
      prompt: string;
      hint: string;
      solution: string;
      verification: Verification;
    }
  | { type: "quiz"; id: string; title: string; questions: Question[] };
export type TaskBlock = Extract<LessonBlock, { type: "task" }>;
export type QuizBlock = Extract<LessonBlock, { type: "quiz" }>;
export interface Lesson {
  schemaVersion: 1;
  $schema?: string;
  id: string;
  moduleId: string;
  title: string;
  description: string;
  category: string;
  level: Level;
  duration: number;
  goals: string[];
  sections: {
    id: string;
    title: string;
    navLabel: string;
    collapsible?: boolean;
    blocks: LessonBlock[];
  }[];
  sources: { title: string; url: string }[];
  reviewedOn: string;
}
