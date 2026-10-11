import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Clock3,
  Network,
  CheckCircle2,
  Box,
  Layers3,
  Database,
} from "lucide-react";
import { lessons, curriculum } from "../../../../packages/lesson-engine/src";
import { architectureLessons } from "../../../../content/architecture/lessons";
import { useProgress } from "../stores/progress";
import { Badge, Heading } from "../components/Page";
export function Academy() {
  const p = useProgress();
  const [search, setSearch] = useSearchParams();
  const moduleId = search.get("module") || "03";
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const visible = lessons.filter(
    (l) =>
      (moduleId === "all" || l.moduleId === moduleId) &&
      (level === "all" || l.level === level) &&
      `${l.title} ${l.description} ${l.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const completed = architectureLessons.filter((l) =>
    p.completed.includes(l.id),
  ).length;
  return (
    <>
      <Heading
        eyebrow="ACADEMY · CONTENT FIRST"
        title="Kubernetes von innen verstehen."
        description="Ein Lehrplan mit 16 Themenbereichen. Unser Referenzmodul: Kubernetes Architecture."
      />
      <section className="reference-module panel">
        <div>
          <div className="eyebrow">MODUL 03 · PHASE A</div>
          <h2>Kubernetes Architecture</h2>
          <p>
            Neun Lektionen verbinden Architektur, API-Lebenszyklus, etcd,
            Regelkreise und Ausfallanalyse. Mit Experimenten, begründeten
            Lösungen und 27 Verständnisfragen.
          </p>
          <div className="inline-actions">
            <Link
              className="button primary"
              to={`/academy/${architectureLessons.find((l) => !p.completed.includes(l.id))?.id || "cluster-basics"}`}
            >
              {completed
                ? "Im Referenzmodul weiterlernen"
                : "Referenzmodul starten"}
            </Link>
            <Badge color="green">{completed} / 9 abgeschlossen</Badge>
          </div>
        </div>
        <Network size={76} />
      </section>
      <div className="academy-filters">
        <label>
          Themenbereich
          <select
            aria-label="Themenbereich"
            value={moduleId}
            onChange={(e) => setSearch({ module: e.target.value })}
          >
            <option value="all">Alle verfügbaren Lektionen</option>
            {curriculum
              .filter((m) => lessons.some((l) => l.moduleId === m.id))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} · {m.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          Schwierigkeitsgrad
          <select
            aria-label="Schwierigkeitsgrad"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="all">Alle Niveaus</option>
            <option>Fundamentals</option>
            <option>Deep Dive</option>
            <option>Expert</option>
          </select>
        </label>
        <label>
          Lektion suchen
          <input
            aria-label="Lektionen durchsuchen"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z. B. etcd oder Scheduler"
          />
        </label>
      </div>
      <div className="section-heading">
        <h2>
          {moduleId === "all"
            ? "Alle Lektionen"
            : curriculum.find((m) => m.id === moduleId)?.title || "Lernpfad"}
        </h2>
        <span className="subtle">{visible.length} Lektionen</span>
      </div>
      <div className="curriculum-lessons">
        {visible.map((l) => (
          <Link
            className="curriculum-lesson panel"
            to={`/academy/${l.id}`}
            key={l.id}
          >
            <span className="lesson-number">
              {l.moduleId === "03"
                ? `03.${String(architectureLessons.findIndex((a) => a.id === l.id) + 1).padStart(2, "0")}`
                : l.moduleId}
            </span>
            <div>
              <div className="eyebrow">{l.level}</div>
              <h3>{l.title}</h3>
              <p>{l.description}</p>
              <span className="subtle">
                <Clock3 size={14} /> {l.duration} Min.
              </span>
            </div>
            {p.completed.includes(l.id) ? (
              <CheckCircle2 className="result-ok" size={22} />
            ) : (
              <BookOpen size={20} />
            )}
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="panel empty-lessons">
          Keine Lektion passt zu diesem Filter. Wähle ein anderes Niveau oder
          lösche den Suchbegriff.
        </div>
      )}
      <section className="teamboard panel">
        <div className="eyebrow">EIN PRAXISPROJEKT ALS ROTER FADEN</div>
        <h2>Teamboard: von der Anwendung zur Plattform</h2>
        <p>
          Wir planen ein Frontend, eine Backend-API und PostgreSQL. Modul 03
          erklärt ihre Architekturgrundlagen; spätere Module ergänzen die
          Plattform. Die folgende Darstellung ist das geplante Zielbild.
        </p>
        <div className="project-flow">
          <span>
            <Box />
            Frontend
          </span>
          <span>
            <Layers3 />
            Backend API<small>Deployment · Service · HPA</small>
          </span>
          <span>
            <Database />
            PostgreSQL<small>Operator · PVC · Replikation</small>
          </span>
        </div>
        <p className="subtle">
          Später: Prometheus · Argo CD · Kyverno. Diese Komponenten werden im
          Browser nicht tatsächlich installiert.
        </p>
      </section>
      <div className="section-heading">
        <div>
          <h2>Der vollständige Lehrplan</h2>
          <p>
            80–120 Lektionen als Planungsrahmen. Qualität und technische Tiefe
            bestimmen den Ausbau.
          </p>
        </div>
        <Badge color="gray">16 THEMENBEREICHE</Badge>
      </div>
      <div className="roadmap-grid">
        {curriculum.map((m) => {
          const count = lessons.filter((l) => l.moduleId === m.id).length;
          return (
            <div className={`phase panel ${count ? "" : "planned"}`} key={m.id}>
              <span>{m.id}</span>
              <div>
                <h3>{m.title}</h3>
                <p>{m.topics}</p>
                {count > 0 && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setSearch({ module: m.id });
                      setLevel("all");
                      setQuery("");
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    Lektionen anzeigen
                  </button>
                )}
              </div>
              <Badge color={m.id === "03" ? "green" : count ? "blue" : "gray"}>
                {m.id === "03"
                  ? "Referenzmodul"
                  : count
                    ? "Einführung"
                    : "Geplant"}
              </Badge>
            </div>
          );
        })}
      </div>
      <div className="content-phases">
        {[
          ["A", "Fundament", "Module 01–04"],
          ["B", "Kubernetes Core", "Module 05–08"],
          ["C", "Plattform aufbauen", "Module 09–13"],
          ["D", "Enterprise Operations", "Module 14–16"],
          [
            "E",
            "Content Quality",
            "Fachprüfung, Didaktik, Tests und Kollegen-Beta",
          ],
        ].map(([id, title, desc]) => (
          <div className="panel" key={id}>
            <strong>
              {id} · {title}
            </strong>
            <p>{desc}</p>
          </div>
        ))}
      </div>
      <div className="notice">
        Der lokale Agent folgt erst nach der Content-Phase. Lerninhalte und
        Übungen benötigen weder Registrierung noch kostenpflichtige
        Cluster-Infrastruktur.
      </div>
    </>
  );
}
