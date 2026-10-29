import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowRight, Search, BookOpen, Compass } from "lucide-react";
import {
  topics,
  categories,
  searchTopics,
  learningPaths,
  pathTopics,
  topicPaths,
  topicById,
  topicUrl,
  type Topic,
  type LearningPath,
} from "../../../../packages/lesson-engine/src/library";
import { useProgress } from "../stores/progress";

function SearchBox({ initial = "" }: { initial?: string }) {
  const [query, setQuery] = useState(initial);
  const navigate = useNavigate();
  function submit(e: FormEvent) {
    e.preventDefault();
    navigate("/discover?q=" + encodeURIComponent(query));
  }
  return (
    <form className="topic-search" onSubmit={submit} role="search">
      <label htmlFor="home-search">
        Was möchtest du über Kubernetes lernen?
      </label>
      <div>
        <Search aria-hidden="true" size={21} />
        <input
          id="home-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z. B. Services, PostgreSQL oder Scheduler"
        />
        <button className="button primary" type="submit">
          Suchen
        </button>
      </div>
    </form>
  );
}
export function PathCard({ path }: { path: LearningPath }) {
  return (
    <article className="path-card">
      <p className="eyebrow">{path.audience}</p>
      <h2>{path.title}</h2>
      <p>{path.description}</p>
      <p className="topic-tags">{path.highlights.join(" · ")}</p>
      <Link
        className="text-link"
        to={"/paths/" + path.id}
        aria-label={`${path.title} starten`}
      >
        Lernpfad starten <ArrowRight size={16} />
      </Link>
    </article>
  );
}
export function Home() {
  const p = useProgress();
  const recent = p.recentLesson
    ? topics.find((t) => t.lessonId === p.recentLesson)
    : undefined;
  const path = learningPaths.find((x) => x.id === p.lastPath);
  return (
    <div className="learning-home">
      <section className="learning-hero">
        <p className="eyebrow">OFFEN · INTERAKTIV · IN DEINEM BROWSER</p>
        <h1>
          Kubernetes verstehen.
          <br />
          In deinem Tempo.
        </h1>
        <p>
          Finde Antworten für deinen Arbeitsalltag oder lerne die Grundlagen
          kennen. Mit verständlichen Erklärungen, Modellen und freiwilligen
          technischen Vertiefungen.
        </p>
        <SearchBox />
        <div className="home-entry">
          <Link className="button primary" to="/paths">
            <BookOpen size={18} />
            Lernpfad starten
          </Link>
          <Link className="button secondary" to="/discover">
            <Compass size={18} />
            Themen entdecken
          </Link>
        </div>
      </section>
      {(recent || path) && (
        <aside className="resume-note" aria-label="Weiterlernen">
          <strong>Weiterlernen</strong>
          {recent && (
            <Link
              to={topicUrl(
                recent,
                path && pathTopics(path).some((t) => t.id === recent.id)
                  ? path.id
                  : undefined,
              )}
            >
              {recent.title}
            </Link>
          )}
          {path && (
            <Link to={"/paths/" + path.id}>
              Zuletzt verwendet: {path.title}
            </Link>
          )}
          <span>Dein Lesestatus bleibt auf diesem Gerät.</span>
        </aside>
      )}
      <section aria-labelledby="paths-title">
        <div className="section-heading">
          <div>
            <h2 id="paths-title">Drei Wege. Deine Wahl.</h2>
            <p>
              Empfehlungen zum Einstieg – jedes Thema ist auch einzeln
              zugänglich.
            </p>
          </div>
        </div>
        <div className="path-cards">
          {learningPaths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </section>
      <p className="learning-footnote">
        Ohne Konto und ohne eigenen Cluster. Die Modelle führen keine echten
        Kubernetes-Befehle aus. KubeShop verbindet passende Beispiele; andere
        Themen stehen für sich.
      </p>
    </div>
  );
}
export function TopicCard({ topic, path }: { topic: Topic; path?: string }) {
  const read = useProgress(
    (s) => !!topic.lessonId && s.readCompleted.includes(topic.lessonId),
  );
  return (
    <article className="topic-card" data-testid={"topic-" + topic.id}>
      <div className="topic-card-meta">
        <span>{topic.lessonId ? "Lektion verfügbar" : "Thema geplant"}</span>
        {read && <span className="result-ok">Gelesen ✓</span>}
      </div>
      <h3>
        <Link to={topicUrl(topic, path)}>{topic.title}</Link>
      </h3>
      <p>{topic.description}</p>
      <p className="topic-tags">{topic.tags.slice(0, 4).join(" · ")}</p>
      {topic.deepDives.map((d) => (
        <Link
          key={d.section}
          className="deep-link"
          to={topicUrl(topic, path, d.section)}
        >
          Deep Dive: {d.title} →
        </Link>
      ))}
    </article>
  );
}
export function Discover() {
  const [search, setSearch] = useSearchParams();
  const query = search.get("q") || "";
  const category = search.get("category") || "";
  const availability = search.get("status") || "";
  const [expanded, setExpanded] = useState<string[]>([]);
  const legacyModule = search.get("module");
  const results = searchTopics(query, category, availability).filter(
    (t) =>
      !legacyModule || legacyModule === "all" || t.moduleId === legacyModule,
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(search);
    value ? next.set(key, value) : next.delete(key);
    next.delete("module");
    setSearch(next, { replace: true });
    setExpanded([]);
  }
  return (
    <>
      <header className="learning-heading">
        <p className="eyebrow">ENTDECKEN</p>
        <h1>Deine Frage. Dein Thema.</h1>
        <p>
          Erkunde die gemeinsame Inhaltsbibliothek. Du brauchst keinen
          abgeschlossenen Lernpfad.
        </p>
      </header>
      <div className="discover-controls">
        <label className="discover-query">
          Themen durchsuchen
          <input
            type="search"
            value={query}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Titel, Begriff oder Synonym …"
          />
        </label>
        <label>
          Kategorie
          <select
            aria-label="Kategorie"
            value={category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Verfügbarkeit
          <select
            aria-label="Verfügbarkeit"
            value={availability}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="">Verfügbar und geplant</option>
            <option value="available">Nur verfügbare Lektionen</option>
            <option value="planned">Geplante Themen</option>
          </select>
        </label>
      </div>
      {legacyModule && (
        <p className="subtle">
          Bisheriger Modulfilter: {legacyModule}{" "}
          <button className="text-button" onClick={() => update("module", "")}>
            Filter aufheben
          </button>
        </p>
      )}
      <p role="status" className="subtle">
        {results.length} Themen · {results.filter((t) => t.lessonId).length}{" "}
        Lektionen verfügbar
      </p>
      {!results.length && (
        <div className="panel">
          <h2>Keine passenden Themen</h2>
          <p>Versuche einen kürzeren Begriff oder entferne die Filter.</p>
          <button className="button secondary" onClick={() => setSearch({})}>
            Suche zurücksetzen
          </button>
        </div>
      )}
      {categories.map((c) => {
        const group = results.filter((t) => t.category === c);
        if (!group.length) return null;
        const showAll =
          !!query || !!category || !!legacyModule || expanded.includes(c);
        return (
          <section className="topic-group" key={c} aria-label={c}>
            <div className="section-heading">
              <h2>{c}</h2>
              <span>{group.length} Themen</span>
            </div>
            <div className="topic-grid">
              {(showAll ? group : group.slice(0, 4)).map((t) => (
                <TopicCard topic={t} key={t.id} />
              ))}
            </div>
            {!showAll && group.length > 4 && (
              <button
                className="text-button show-topics"
                onClick={() => setExpanded([...expanded, c])}
              >
                Alle {group.length} Themen in {c} anzeigen
              </button>
            )}
          </section>
        );
      })}
    </>
  );
}
export function Paths() {
  return (
    <>
      <header className="learning-heading">
        <p className="eyebrow">LERNPFADE</p>
        <h1>Ein Einstieg, der zu dir passt.</h1>
        <p>
          Du kannst jederzeit wechseln, überspringen oder ein Thema direkt
          öffnen. Dein Lesestatus gehört zur Lektion und gilt in jedem Lernpfad.
        </p>
      </header>
      <div className="path-cards">
        {learningPaths.map((p) => (
          <PathCard key={p.id} path={p} />
        ))}
      </div>
    </>
  );
}
export function PathDetail() {
  const { id } = useParams();
  const path = learningPaths.find((p) => p.id === id);
  const p = useProgress();
  useEffect(() => {
    if (path && !useProgress.getState().error)
      useProgress.getState().update({ lastPath: path.id });
  }, [path?.id]);
  if (!path) return <Missing />;
  const available = pathTopics(path).filter((t) => t.lessonId);
  const unread = available.find((t) => !p.readCompleted.includes(t.lessonId!));
  const next = unread || available[0];
  return (
    <>
      <Link className="text-link" to="/paths">
        ← Alle Lernpfade
      </Link>
      <header className="learning-heading">
        <p className="eyebrow">{path.audience}</p>
        <h1>{path.title}</h1>
        <p>{path.description}</p>
        <p>
          {
            available.filter((t) => p.readCompleted.includes(t.lessonId!))
              .length
          }{" "}
          von {available.length} verfügbaren Lektionen gelesen. Weitere Themen
          sind noch geplant.
        </p>
        {next && (
          <Link className="button primary" to={topicUrl(next, path.id)}>
            {unread
              ? "Zur nächsten ungelesenen Lektion"
              : "Noch einmal erkunden"}
          </Link>
        )}
      </header>
      <p className="notice">
        Die Reihenfolge ist eine Empfehlung. Kein Thema ist gesperrt; Übungen
        und Deep Dives bleiben freiwillig. Geplante Themen enthalten noch keine
        vollständige Lektion.
      </p>
      <ol className="path-outline">
        {path.steps.map((s, i) => (
          <li key={s.title}>
            <div className="path-step-heading">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h2>{s.title}</h2>
            </div>
            <div className="topic-grid">
              {s.topics.map((id) => (
                <TopicCard key={id} topic={topicById(id)!} path={path.id} />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
export function TopicLinks({ topic, path }: { topic: Topic; path?: string }) {
  const active = learningPaths.find(
    (p) => p.id === path && pathTopics(p).some((t) => t.id === topic.id),
  );
  const sequence = active ? pathTopics(active) : [];
  const next = sequence[sequence.findIndex((t) => t.id === topic.id) + 1];
  return (
    <aside className="topic-connections" aria-label="Weiterführende Themen">
      {topic.recommended.length > 0 && (
        <section>
          <h2>Hilfreiches Vorwissen</h2>
          <p className="subtle">Empfohlen, keine Zugangsvoraussetzung.</p>
          <ul>
            {topic.recommended.map((id) => (
              <li key={id}>
                <Link to={topicUrl(topicById(id)!)}>
                  {topicById(id)!.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {topic.related.length > 0 && (
        <section>
          <h2>Verwandte Themen</h2>
          <ul>
            {topic.related.map((id) => (
              <li key={id}>
                <Link to={topicUrl(topicById(id)!)}>
                  {topicById(id)!.title}
                  {!topicById(id)!.lessonId ? " · geplant" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {topic.deepDives.length > 0 && (
        <section>
          <h2>Optionale Deep Dives</h2>
          <ul>
            {topic.deepDives.map((d) => (
              <li key={d.section}>
                <Link to={topicUrl(topic, path, d.section)}>{d.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {active && (
        <section>
          <h2>Im Lernpfad</h2>
          <Link to={"/paths/" + active.id}>{active.title}</Link>
          {next && (
            <p>
              <Link to={topicUrl(next, active.id)}>
                Nächstes Thema: {next.title}
                {!next.lessonId ? " · geplant" : ""} →
              </Link>
            </p>
          )}
        </section>
      )}
      {!active && topicPaths(topic.id).length > 0 && (
        <section>
          <h2>Passende Lernpfade</h2>
          <ul>
            {topicPaths(topic.id).map((p) => (
              <li key={p.id}>
                <Link to={"/paths/" + p.id}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!topic.tools?.length && (
        <section>
          <h2>Im Playground erkunden</h2>
          <ul>
            {topic.tools.map((tool) => (
              <li key={tool}>
                <Link to={"/playground?tool=" + tool}>
                  {tool === "editor"
                    ? "YAML-Editor und Terminal"
                    : tool === "visualizer"
                      ? "Visualizer"
                      : "Externer Build-Leitfaden"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
export function TopicPreview() {
  const { id } = useParams();
  const topic = topicById(id || "");
  const [search] = useSearchParams();
  if (!topic) return <Missing />;
  if (topic.lessonId)
    return (
      <Navigate
        replace
        to={topicUrl(
          topic,
          search.get("path") || undefined,
          search.get("section") || undefined,
        )}
      />
    );
  return (
    <>
      <Link className="text-link" to="/discover">
        ← Themen entdecken
      </Link>
      <header className="learning-heading">
        <p className="eyebrow">{topic.category}</p>
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </header>
      <div className="notice">
        <strong>Dieses Thema ist geplant.</strong>
        <p>
          Eine vollständige Lektion ist noch nicht verfügbar. Die verknüpften
          Grundlagen kannst du bereits unabhängig davon lesen.
        </p>
      </div>
      <TopicLinks topic={topic} path={search.get("path") || undefined} />
    </>
  );
}
function Missing() {
  return (
    <div className="panel">
      <h1>Thema nicht gefunden</h1>
      <Link to="/discover">Zur Themenübersicht</Link>
    </div>
  );
}
