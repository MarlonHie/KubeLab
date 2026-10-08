import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  NavLink,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Command,
  Copy,
  Download,
  ExternalLink,
  FlaskConical,
  Github,
  GraduationCap,
  HardDrive,
  Layers3,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  Play,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  TerminalSquare,
  Upload,
  X,
} from "lucide-react";
import { useProgress, parseProgress } from "./stores/progress";
import { lessons, phases } from "../../../packages/lesson-engine/src";
import { schedule, type Cluster } from "../../../packages/cluster-model/src";
import {
  apply,
  command,
  defaultManifest,
  brokenManifest,
  emptyCluster,
  pods,
} from "../../../packages/simulation-engine/src";
import { validateYaml } from "../../../packages/validation/src";
import { ClusterGraph } from "./components/ClusterGraph";
import { Terminal } from "./components/Terminal";
import { buildSteps } from "./pages/buildSteps";
import Linux from "../../../content/fundamentals/linux.mdx";
import Containers from "../../../content/fundamentals/containers.mdx";
import ControlPlane from "../../../content/fundamentals/control-plane.mdx";
const YamlEditor = lazy(() => import("./components/YamlEditor"));
const nav = [
  { to: "/", label: "Übersicht", icon: LayoutDashboard },
  { to: "/academy", label: "Academy", icon: BookOpen },
  { to: "/build", label: "Build Lab", icon: Layers3 },
  { to: "/operations", label: "Operations Lab", icon: TerminalSquare },
  { to: "/visualizer", label: "Visualizer", icon: Network },
];
function Badge({
  children,
  color = "blue",
}: {
  children: ReactNode;
  color?: string;
}) {
  return <span className={`badge ${color}`}>{children}</span>;
}
function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function App() {
  const progress = useProgress();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    document.documentElement.dataset.theme = progress.theme;
  }, [progress.theme]);
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const pct = Math.round((progress.completed.length / lessons.length) * 100);
  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Box size={24} />
          </span>
          KubeLab<span className="brand-version">BETA</span>
        </Link>
        <div className="sidebar-group">DEIN WORKSPACE</div>
        <nav aria-label="Hauptnavigation">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}>
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.to === "/academy" && <span className="nav-count">3</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-path">
          <span className="path-icon">
            <GraduationCap size={21} />
          </span>
          <strong>
            Schritt für Schritt zum
            <br />
            Kubernetes Engineer.
          </strong>
          <p>
            Dein Wissen. Dein Cluster.
            <br />
            In deinem Tempo.
          </p>
          <Link to="/academy">
            Lernpfad entdecken <ChevronRight size={16} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="local-state">
            <HardDrive size={15} />
            <span>Lokal gespeichert</span>
            <span className="live-dot" />
          </div>
          <NavLink to="/settings">
            <Settings2 size={18} />
            Einstellungen
          </NavLink>
          <a
            href="https://github.com/MarlonHie/KubeLab"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            Auf GitHub ansehen
            <ExternalLink size={13} />
          </a>
          <div className="sidebar-footer">
            KubeLab <span>v1.0 · Local first</span>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="backdrop"
          aria-label="Menü schließen"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="app">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label={menu ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {location.pathname.startsWith("/settings")
                ? "Einstellungen"
                : nav.find(
                    (n) => n.to !== "/" && location.pathname.startsWith(n.to),
                  )?.label || "Übersicht"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="no-account">
              <ShieldCheck size={15} />
              Ohne Konto. Ohne Cloud.
            </span>
            <button
              className="icon-button"
              aria-label={
                progress.theme === "light"
                  ? "Dunkles Design aktivieren"
                  : "Helles Design aktivieren"
              }
              onClick={() =>
                progress.update({
                  theme: progress.theme === "light" ? "dark" : "light",
                })
              }
            >
              {progress.theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>
            <span className="avatar">DU</span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {progress.error && (
            <div role="alert" className="notice warning">
              {progress.error}
            </div>
          )}
          {!progress.ready ? (
            <div className="panel">Lernstand wird geladen …</div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard pct={pct} />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/academy/:id" element={<Lesson />} />
              <Route path="/build" element={<BuildLab />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="/visualizer" element={<Visualizer />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <div className="panel">
                    <h1>Hier gibt es noch kein Lab.</h1>
                    <Link to="/">Zur Übersicht</Link>
                  </div>
                }
              />
            </Routes>
          )}
        </main>
        <footer className="main-footer">
          <span>
            <Box size={14} />
            Mit Neugier gebaut. Für alle, die Kubernetes verstehen wollen.
          </span>
          <span>Kostenlos & ohne Registrierung</span>
        </footer>
      </div>
    </>
  );
}
function Dashboard({ pct }: { pct: number }) {
  const p = useProgress();
  const next = lessons.find((l) => !p.completed.includes(l.id)) || lessons[2];
  return (
    <>
      <Heading
        eyebrow="DEIN KUBERNETES-WORKSPACE"
        title="Verstehen. Bauen. Meistern."
        description="Dein Weg von den Linux-Grundlagen zum eigenen Kubernetes-Cluster."
        action={
          <Badge color="green">
            <span className="live-dot" />
            Alles läuft lokal
          </Badge>
        }
      />
      <div className="dashboard-grid">
        <section className="continue-card">
          <div className="continue-content">
            <div className="eyebrow light">
              <span className="tiny-square" />
              DEIN NÄCHSTER SCHRITT
            </div>
            <Badge color="glass">{next.category}</Badge>
            <h2>{next.title}</h2>
            <p>{next.description}</p>
            <div className="lesson-meta">
              <span>
                <Clock3 size={15} />
                {next.duration} Minuten
              </span>
              <span>
                <Activity size={15} />
                Interaktives Lernmodul
              </span>
            </div>
            <Link className="button white" to={`/academy/${next.id}`}>
              <Play size={16} />
              {p.completed.length ? "Weiterlernen" : "Lernen starten"}
            </Link>
          </div>
          <div
            className="cluster-hero"
            aria-label="Architektur: Control Plane verbindet zwei Worker Nodes"
          >
            <div className="hero-orbit" />
            <div className="hero-plane">
              <Box size={28} />
              <div>
                <small>CONTROL PLANE</small>
                <strong>Dein Cluster beginnt hier.</strong>
              </div>
              <span className="hero-node-dot" />
            </div>
            <div className="hero-branches">
              <span />
              <span />
            </div>
            <div className="hero-workers">
              <div>
                <Layers3 size={23} />
                <span>worker-01</span>
                <small>kubelet · containerd</small>
              </div>
              <div>
                <Layers3 size={23} />
                <span>worker-02</span>
                <small>kubelet · containerd</small>
              </div>
            </div>
            <div className="hero-caption">
              <span className="hero-node-dot" />
              Ein System. Viele Möglichkeiten.
            </div>
          </div>
        </section>
        <section className="progress-card panel">
          <div className="section-title">
            <h3>Dein Fortschritt</h3>
            <GraduationCap size={19} />
          </div>
          <div
            className="progress-ring"
            style={{ "--progress": `${pct}%` } as React.CSSProperties}
          >
            <div>
              <strong>
                {pct}
                <small>%</small>
              </strong>
              <span>Grundlagen</span>
            </div>
          </div>
          <p>
            <strong>{p.completed.length} von 3</strong> Modulen abgeschlossen
          </p>
          <div className="progress-stats">
            <span>
              <CheckCircle2 size={17} />
              Abgeschlossene Labs
            </span>
            <strong>{p.checkpoints.length === 7 ? 1 : 0}</strong>
          </div>
          <div className="progress-stats">
            <span>
              <FlaskConical size={17} />
              Gelöste Challenges
            </span>
            <strong>{p.challenge ? 1 : 0}</strong>
          </div>
        </section>
      </div>
      <div className="section-heading">
        <div>
          <h2>Dein Lernraum</h2>
          <p>Vom ersten Aha-Moment bis zum funktionierenden Cluster.</p>
        </div>
        <span className="subtle">Lernen durch Ausprobieren</span>
      </div>
      <div className="feature-grid">
        {[
          {
            to: "/academy",
            icon: BookOpen,
            color: "blue",
            tag: "VERSTEHEN",
            title: "Academy",
            description:
              "Die Konzepte hinter Kubernetes. Verständlich, interaktiv und Schritt für Schritt.",
            meta: "3 Module verfügbar",
          },
          {
            to: "/build",
            icon: Layers3,
            color: "purple",
            tag: "AUFBAUEN",
            title: "Build Lab",
            description:
              "Baue deinen eigenen Cluster. Von der Linux-VM bis zum ersten Deployment.",
            meta: "7 geführte Schritte",
          },
          {
            to: "/operations",
            icon: TerminalSquare,
            color: "orange",
            tag: "ANWENDEN",
            title: "Operations Lab",
            description:
              "Schreibe YAML, repariere Deployments und trainiere dein Troubleshooting.",
            meta: "Browser-Simulation",
          },
          {
            to: "/visualizer",
            icon: Network,
            color: "teal",
            tag: "ENTDECKEN",
            title: "Visualizer",
            description:
              "Mach Zusammenhänge sichtbar und erkunde die Architektur deines Clusters.",
            meta: "Interaktive Clusteransicht",
          },
        ].map((f) => (
          <Link className="feature-card" to={f.to} key={f.to}>
            <div className="feature-top">
              <span className={`feature-icon ${f.color}`}>
                <f.icon size={23} />
              </span>
              <ArrowUpRight size={18} />
            </div>
            <div className="eyebrow">{f.tag}</div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <div className="feature-meta">
              {f.meta}
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
      <div className="bottom-grid">
        <section className="panel learning-path">
          <div className="section-heading">
            <div>
              <h2>Ein klarer Weg. Dein Tempo.</h2>
              <p>Dein Lernpfad zum Kubernetes Engineer</p>
            </div>
            <Link className="text-link" to="/academy">
              Alle Phasen
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="path-row">
            {phases.slice(0, 4).map(([name, desc, num], i) => (
              <div className={`path-item ${i === 0 ? "active" : ""}`} key={num}>
                <span className="path-step">{num}</span>
                <strong>{name}</strong>
                <span>{i < 2 ? "Jetzt verfügbar" : "Demnächst"}</span>
              </div>
            ))}
          </div>
          <div className="path-foot">
            <Sparkles size={15} />
            12 Phasen · Von den Grundlagen bis zu High Availability
          </div>
        </section>
        <section className="local-card">
          <span className="feature-icon blue">
            <ShieldCheck size={22} />
          </span>
          <h3>Dein Rechner. Dein Lernstand.</h3>
          <p>
            Kein Account, keine Infrastrukturkosten. Dein Fortschritt bleibt in
            deinem Browser.
          </p>
          <Link className="text-link" to="/settings">
            Lernstand verwalten
            <ChevronRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
function Academy() {
  const p = useProgress();
  const [query, setQuery] = useState("");
  const filtered = lessons.filter((l) =>
    (l.title + " " + l.description + " " + l.category)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="ACADEMY"
        title="Wissen, das zusammenwächst."
        description="Erst das Konzept verstehen. Dann selbst ausprobieren."
      />
      <div className="academy-toolbar">
        <div className="tabs-label">
          <BookOpen size={18} />
          Deine Grundlagen<span className="count-pill">3 Module</span>
        </div>
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Module durchsuchen"
            placeholder="Module durchsuchen …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="lesson-grid">
        {filtered.map((l, i) => (
          <Link
            to={`/academy/${l.id}`}
            className="lesson-card panel"
            key={l.id}
          >
            <div className={`lesson-art art-${l.id}`}>
              <span className="art-number">0{lessons.indexOf(l) + 1}</span>
              {l.id === "linux" ? (
                <TerminalSquare size={62} />
              ) : l.id === "containers" ? (
                <Box size={66} />
              ) : (
                <Network size={66} />
              )}
              <span className="art-caption">
                {l.id === "linux"
                  ? "$ understand --the-basics"
                  : l.id === "containers"
                    ? "image → runtime → container"
                    : "desired state → reconciliation"}
              </span>
            </div>
            <div className="lesson-card-content">
              <div className="eyebrow">{l.category}</div>
              <h2>{l.title}</h2>
              <p>{l.description}</p>
              <div className="lesson-card-footer">
                <span>
                  <Clock3 size={15} />
                  {l.duration} Min.
                </span>
                <Badge color={p.completed.includes(l.id) ? "green" : "blue"}>
                  {p.completed.includes(l.id)
                    ? "Abgeschlossen"
                    : "Modul öffnen"}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="panel">
          Keine passenden Module. Versuche „Linux“, „Container“ oder „Control
          Plane“.
        </div>
      )}
      <div className="section-heading">
        <div>
          <h2>Das große Ganze</h2>
          <p>Zwölf Phasen. Ein vollständiges Verständnis.</p>
        </div>
        <Badge color="gray">ROADMAP</Badge>
      </div>
      <div className="roadmap-grid">
        {phases.map(([name, desc, num], i) => (
          <div className={`phase panel ${i > 1 ? "planned" : ""}`} key={num}>
            <span>{num}</span>
            <div>
              <h3>{name}</h3>
              <p>{desc}</p>
            </div>
            {i < 2 ? (
              <Badge color="green">Verfügbar</Badge>
            ) : (
              <Badge color="gray">Geplant</Badge>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
function Lesson() {
  const { id } = useParams();
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return <Navigate to="/academy" replace />;
  return <LessonBody key={id} lesson={lesson} />;
}
function LessonBody({ lesson }: { lesson: (typeof lessons)[number] }) {
  const p = useProgress();
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, check] = useState(false);
  useEffect(() => {
    p.update({ lastLesson: lesson.id });
  }, [lesson.id]);
  const Content =
    lesson.id === "linux"
      ? Linux
      : lesson.id === "containers"
        ? Containers
        : ControlPlane;
  const next = lessons[lessons.indexOf(lesson) + 1];
  return (
    <>
      <Link className="text-link back-link" to="/academy">
        Academy / Grundlagen
      </Link>
      <Heading
        eyebrow={`MODUL 0${lessons.indexOf(lesson) + 1} · ${lesson.category}`}
        title={lesson.title}
        description={`${lesson.duration} Minuten · Konzept → Erkunden → Aufgabe → Wissenscheck`}
      />
      <div className="lesson-layout">
        <article className="prose panel">
          <Content />
          {lesson.id === "control-plane" && <Scheduler />}
          <section className="quiz">
            <div className="eyebrow">WISSENSCHECK</div>
            <h3>{lesson.question}</h3>
            <fieldset>
              <legend className="sr-only">Wähle eine Antwort</legend>
              {lesson.answers.map((a, i) => (
                <label
                  className={`quiz-option ${answer === i ? "chosen" : ""}`}
                  key={a}
                >
                  <input
                    type="radio"
                    name="quiz"
                    checked={answer === i}
                    onChange={() => {
                      setAnswer(i);
                      check(false);
                    }}
                  />
                  {a}
                </label>
              ))}
            </fieldset>
            <button
              className="button primary"
              disabled={answer === null}
              onClick={() => {
                check(true);
                if (answer === lesson.correct)
                  p.update({
                    completed: [...new Set([...p.completed, lesson.id])],
                  });
              }}
            >
              Antwort prüfen
            </button>
            {checked && (
              <div
                className={`notice ${answer === lesson.correct ? "success" : "warning"}`}
                role="status"
              >
                {answer === lesson.correct
                  ? "Richtig! Dein Modul ist abgeschlossen. "
                  : "Noch nicht ganz. "}
                {lesson.explanation}
              </div>
            )}
          </section>
          {p.completed.includes(lesson.id) && (
            <Link
              className="button secondary"
              to={next ? `/academy/${next.id}` : "/build"}
            >
              {next ? "Nächstes Modul" : "Weiter zum Build Lab"}
            </Link>
          )}
        </article>
        <aside className="lesson-aside panel">
          <span className="feature-icon blue">
            <GraduationCap size={22} />
          </span>
          <h3>Dein Lernpfad</h3>
          {lessons.map((l, i) => (
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
          <div className="notice">
            <HardDrive size={17} />
            Dein Fortschritt wird auf diesem Gerät gespeichert.
          </div>
        </aside>
      </div>
    </>
  );
}
function Scheduler() {
  const [cpu, setCpu] = useState(1);
  const [node, setNode] = useState("auto");
  const result = schedule(cpu, node);
  return (
    <section className="scheduler">
      <div className="eyebrow">INTERAKTIVES EXPERIMENT</div>
      <h3>Wo landet dein Pod?</h3>
      <label>
        CPU-Request: <strong>{cpu} vCPU</strong>
        <input
          aria-label="CPU-Anforderung"
          type="range"
          min="1"
          max="6"
          value={cpu}
          onChange={(e) => setCpu(Number(e.target.value))}
        />
      </label>
      <label>
        Node-Auswahl
        <select value={node} onChange={(e) => setNode(e.target.value)}>
          <option value="auto">Automatisch auswählen</option>
          <option value="worker-01">worker-01 erzwingen</option>
          <option value="worker-02">worker-02 erzwingen</option>
        </select>
      </label>
      <div className="scheduler-nodes">
        {["worker-01", "worker-02"].map((n, i) => (
          <div className={result === n ? "selected" : ""} key={n}>
            <Layers3 size={22} />
            <strong>{n}</strong>
            <span>{i === 0 ? 2 : 4} vCPU verfügbar</span>
            <Badge color={result === n ? "green" : "gray"}>
              {result === n ? "Pod platziert" : "Unverändert"}
            </Badge>
          </div>
        ))}
      </div>
      <p role="status">
        {result
          ? `Der Pod könnte auf ${result} eingeplant werden.`
          : "Pending: Kein passender Node hat genügend freie CPU."}
      </p>
      <small>
        Vereinfachte Simulation. Echte Scheduler berücksichtigen zusätzlich
        Affinity, Taints, Topologie und weitere Filter- und Scoring-Regeln.
      </small>
    </section>
  );
}
function Visualizer() {
  return (
    <>
      <Heading
        eyebrow="CLUSTER VISUALIZER"
        title="Sieh, wie alles zusammenhängt."
        description="Erkunde die Control Plane. Klicke auf eine Komponente oder folge dem Weg eines Pods."
        action={<Badge color="purple">Beispielarchitektur</Badge>}
      />
      <section className="panel visualizer-panel">
        <div className="panel-bar">
          <span>
            <Network size={18} />
            Kubernetes-Architektur
          </span>
          <span className="subtle">1 Control Plane · 2 Worker</span>
        </div>
        <ClusterGraph />
      </section>
      <div className="visualizer-bottom">
        <Scheduler />
        <section className="panel">
          <span className="feature-icon teal">
            <Code2 size={23} />
          </span>
          <h2>Vom Diagramm zum Deployment</h2>
          <p>
            Erstelle Ressourcen im Operations Lab und beobachte, wie Pods und
            Services im Clusterbild erscheinen.
          </p>
          <Link className="button primary" to="/operations">
            Operations Lab öffnen
          </Link>
          <div className="notice">
            Diese Ansicht verwendet Beispieldaten. Eine Verbindung zu einem
            echten Cluster ist in dieser Version nicht enthalten.
          </div>
        </section>
      </div>
    </>
  );
}
function BuildLab() {
  const p = useProgress();
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const b = buildSteps[step];
  async function copy() {
    try {
      await navigator.clipboard.writeText(b.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <>
      <Heading
        eyebrow="BUILD LAB · KUBEADM"
        title="Dein erster echter Cluster."
        description="Vom frischen Linux-System zum laufenden Workload. In deinem eigenen Terminal."
        action={<Badge color="purple">Geführtes Lab</Badge>}
      />
      <div className="build-summary panel">
        <div>
          <Layers3 size={20} />
          <strong>3 Linux-VMs</strong>
        </div>
        <div>
          <HardDrive size={20} />
          <span>6 vCPU · 8 GB RAM · 60 GB Disk</span>
        </div>
        <div>
          <Clock3 size={20} />
          <span>ca. 90–120 Min.</span>
        </div>
        <Badge color="green">{p.checkpoints.length}/7 geprüft</Badge>
      </div>
      <div className="build-layout">
        <nav className="build-nav panel" aria-label="Lab-Schritte">
          {buildSteps.map((s, i) => (
            <button
              key={s.title}
              className={step === i ? "current" : ""}
              onClick={() => {
                setStep(i);
                setCopied(false);
                setCopyError(false);
              }}
            >
              <span>
                {p.checkpoints.includes(i) ? (
                  <Check size={16} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              {s.title}
            </button>
          ))}
        </nav>
        <section className="panel build-content">
          <div className="eyebrow">
            SCHRITT {step + 1} VON 7 · {b.tag}
          </div>
          <h2>{b.title}</h2>
          <p>{b.text}</p>
          <div className="notice">
            <TerminalSquare size={18} />
            Führe diese Befehle im externen Terminal deiner Lab-VM aus.
          </div>
          <div className="code-block">
            <div>
              <span>bash · externes Terminal</span>
              <button onClick={copy} className="copy-button">
                <Copy size={14} />
                {copied ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <pre>
              <code>{b.code}</code>
            </pre>
          </div>
          {copyError && (
            <p role="alert">
              Kopieren nicht verfügbar. Markiere die Befehle im Codeblock.
            </p>
          )}
          <div className="hint">
            <strong>Gut zu wissen</strong>
            <p>{b.hint}</p>
          </div>
          <label className="checkpoint">
            <input
              type="checkbox"
              checked={p.checkpoints.includes(step)}
              onChange={(e) =>
                p.update({
                  checkpoints: e.target.checked
                    ? [...p.checkpoints, step]
                    : p.checkpoints.filter((x) => x !== step),
                })
              }
            />
            <span>
              <strong>Manuell geprüft</strong>
              {b.check}
            </span>
          </label>
          <div className="build-actions">
            <button
              className="button secondary"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Zurück
            </button>
            {step < 6 ? (
              <button
                className="button primary"
                onClick={() => setStep(step + 1)}
              >
                Nächster Schritt
              </button>
            ) : (
              <Link to="/" className="button primary">
                Zur Übersicht
              </Link>
            )}
          </div>
          <div className="source-links">
            <a
              href="https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/"
              target="_blank"
              rel="noreferrer"
            >
              kubeadm-Dokumentation <ExternalLink size={13} />
            </a>
            <a
              href="https://docs.cilium.io/en/v1.19/installation/k8s-install-kubeadm/"
              target="_blank"
              rel="noreferrer"
            >
              Cilium-Anleitung <ExternalLink size={13} />
            </a>
            <a
              href="https://helm.sh/docs/intro/install/"
              target="_blank"
              rel="noreferrer"
            >
              Helm installieren <ExternalLink size={13} />
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
function Operations() {
  const p = useProgress();
  const [source, setSource] = useState(defaultManifest);
  const [cluster, setCluster] = useState<Cluster>(emptyCluster);
  const clusterRef = useRef(cluster);
  const [output, setOutput] = useState(
    "Dein Cluster ist bereit. Wende dein erstes Manifest an.",
  );
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState(false);
  const [hint, setHint] = useState(false);
  const [terminalInput, setTerminalInput] = useState("kubectl get pods");
  const [width, setWidth] = useState(56);
  const [tab, setTab] = useState<"graph" | "resources">("graph");
  const validation = validateYaml(source);
  function updateCluster(c: Cluster) {
    clusterRef.current = c;
    setCluster(c);
  }
  function run(input: string) {
    const result = command(clusterRef.current, input, source);
    updateCluster(result.cluster);
    setOutput(result.output);
    return result.output;
  }
  function applyManifest() {
    const result = apply(clusterRef.current, source);
    updateCluster(result.cluster);
    setOutput(result.output);
  }
  function reset(broken = false) {
    setSource(broken ? brokenManifest : defaultManifest);
    updateCluster(emptyCluster);
    setResetKey((x) => x + 1);
    setOutput(
      broken
        ? "Challenge gestartet: Finde den Fehler im Deployment."
        : "Simulation zurückgesetzt.",
    );
    setChallenge(broken);
    setHint(false);
  }
  function checkTask() {
    const found = cluster.resources.find(
      (r) =>
        r.kind === "Deployment" &&
        r.metadata.name === "hello-kubelab" &&
        (r.metadata.namespace || "default") === "default",
    );
    if (found && found.spec.replicas === 3) {
      p.update({ challenge: true });
      setOutput(
        "Geschafft! Dein gültiges Deployment läuft mit 3 simulierten Pods. Challenge abgeschlossen.",
      );
    } else
      setOutput(
        "Noch nicht fertig: Wende das reparierte Deployment hello-kubelab im Namespace default mit genau 3 Replikaten an.",
      );
  }
  return (
    <>
      <Heading
        eyebrow="OPERATIONS LAB"
        title="Ausprobieren ist der beste Lehrer."
        description="Bearbeite dein Manifest, führe Befehle aus und beobachte deinen Cluster."
        action={
          <Badge color="orange">
            <FlaskConical size={13} />
            Simulation · kein echter Cluster
          </Badge>
        }
      />
      <div className="lab-challenge panel">
        <div>
          <span className="feature-icon orange">
            <TerminalSquare size={23} />
          </span>
          <div>
            <div className="eyebrow">
              {challenge ? "CHALLENGE 01" : "DEIN SPIELPLATZ"}
            </div>
            <h3>
              {challenge
                ? "Ein Deployment braucht deine Hilfe."
                : "Dein erstes Deployment"}
            </h3>
            <p>
              {challenge
                ? "Repariere den fehlerhaften Selektor und starte genau 3 Replikate."
                : "Starte zwei nginx-Pods. Ändere anschließend die Replikate oder füge einen Service hinzu."}
            </p>
          </div>
        </div>
        <div className="inline-actions">
          {challenge ? (
            <>
              <button
                className="button secondary small"
                onClick={() => setHint(!hint)}
              >
                Hinweis
              </button>
              <button className="button primary small" onClick={checkTask}>
                <Check size={15} />
                Aufgabe prüfen
              </button>
            </>
          ) : (
            <button className="button secondary" onClick={() => reset(true)}>
              Challenge starten
            </button>
          )}
        </div>
      </div>
      {hint && (
        <div className="notice">
          Vergleiche spec.selector.matchLabels mit
          spec.template.metadata.labels. Die Werte müssen zusammenpassen. Setze
          außerdem spec.replicas auf 3 und wende das Manifest an.
        </div>
      )}
      <div className="lab-controls">
        <label>
          Panelbreite{" "}
          <input
            aria-label="Editorbreite"
            type="range"
            min="35"
            max="70"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>
        <button className="text-button" onClick={() => reset(challenge)}>
          <RotateCcw size={15} />
          Übung zurücksetzen
        </button>
      </div>
      <div
        className="lab-workspace"
        style={{ "--editor-width": `${width}%` } as React.CSSProperties}
      >
        <section className="editor-panel panel">
          <div className="panel-bar">
            <span>
              <Code2 size={17} />
              deployment.yaml
            </span>
            <button className="button primary small" onClick={applyManifest}>
              <Play size={14} />
              Anwenden
            </button>
          </div>
          <Suspense
            fallback={
              <div className="editor-loading">Editor wird geladen …</div>
            }
          >
            <YamlEditor
              value={source}
              onChange={setSource}
              dark={p.theme === "dark"}
            />
          </Suspense>
          <div
            className={`validation-status ${validation.errors.length ? "invalid" : ""}`}
            role="status"
          >
            {validation.errors.length ? (
              <>
                <X size={15} />
                {validation.errors[0]}
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                YAML gültig · {validation.resources.length} Ressource(n)
              </>
            )}
          </div>
          <div className="terminal-header">
            <span>
              <TerminalSquare size={15} />
              Terminal
            </span>
            <span>SIMULIERT</span>
          </div>
          <Terminal run={run} resetKey={resetKey} />
          <form
            className="command-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(terminalInput);
            }}
          >
            <label className="sr-only" htmlFor="command">
              Simulierten Befehl eingeben
            </label>
            <span>$</span>
            <input
              id="command"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              spellCheck={false}
            />
            <button aria-label="Befehl ausführen" type="submit">
              <Play size={16} />
            </button>
          </form>
        </section>
        <section className="lab-graph panel">
          <div className="panel-bar">
            <div className="segmented">
              <button
                className={tab === "graph" ? "selected" : ""}
                onClick={() => setTab("graph")}
              >
                Cluster
              </button>
              <button
                className={tab === "resources" ? "selected" : ""}
                onClick={() => setTab("resources")}
              >
                Ressourcen
              </button>
            </div>
            <Badge color="green">{pods(cluster).length} Pods</Badge>
          </div>
          {tab === "graph" ? (
            <>
              <ClusterGraph cluster={cluster} compact />
              {pods(cluster).length > 6 && (
                <p className="subtle graph-note">
                  Im Diagramm sind die ersten 6 Pods sichtbar.
                </p>
              )}
            </>
          ) : (
            <div className="resource-list">
              {!cluster.resources.length ? (
                <p>Noch keine Ressourcen. Wende dein Manifest an.</p>
              ) : (
                cluster.resources.map((r) => (
                  <div
                    key={`${r.kind}-${r.metadata.namespace}-${r.metadata.name}`}
                  >
                    <Box size={19} />
                    <div>
                      <strong>{r.metadata.name}</strong>
                      <span>
                        {r.kind} · {r.metadata.namespace || "default"}
                      </span>
                    </div>
                    <Badge color="blue">Simuliert</Badge>
                  </div>
                ))
              )}
            </div>
          )}
          <div className="lab-output">
            <div className="eyebrow">LETZTES ERGEBNIS</div>
            <pre role="status">{output}</pre>
          </div>
        </section>
      </div>
      <div className="notice lab-notice">
        <ShieldCheck size={18} />
        <span>
          Unterstützt: Deployment, Pod und Service. Die Simulation prüft einen
          begrenzten Schemasatz und nimmt erfolgreiche Containerstarts an.
          Netzwerk, Images, Speicher und Policies werden nicht ausgeführt. Mit{" "}
          <code>help</code> siehst du die unterstützten Befehle.
        </span>
      </div>
    </>
  );
}
function Settings() {
  const p = useProgress();
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  function exportData() {
    const blob = new Blob([JSON.stringify(parseProgress(p), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kubelab-lernstand.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Dein Lernstand wurde für den Download vorbereitet.");
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      if (file.size > 100000)
        throw new Error("Die Datei darf höchstens 100 KB groß sein.");
      p.update(parseProgress(JSON.parse(await file.text())));
      setMessage("Dein Lernstand wurde erfolgreich importiert.");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Die Datei konnte nicht gelesen werden.",
      );
    }
  }
  return (
    <>
      <Heading
        eyebrow="EINSTELLUNGEN"
        title="Dein Workspace. Deine Regeln."
        description="Verwalte dein Design und deinen lokal gespeicherten Lernstand."
      />
      <div className="settings-grid">
        <section className="panel settings-card">
          <span className="feature-icon blue">
            <Sun size={22} />
          </span>
          <h2>Erscheinungsbild</h2>
          <p>Wähle die Oberfläche, mit der du am liebsten lernst.</p>
          <div className="theme-options">
            <button
              className={p.theme === "light" ? "selected" : ""}
              onClick={() => p.update({ theme: "light" })}
            >
              <Sun size={21} />
              Hell{p.theme === "light" && <Check size={16} />}
            </button>
            <button
              className={p.theme === "dark" ? "selected" : ""}
              onClick={() => p.update({ theme: "dark" })}
            >
              <Moon size={21} />
              Dunkel{p.theme === "dark" && <Check size={16} />}
            </button>
          </div>
          <p className="subtle">
            Sprache: Deutsch · Weitere Sprachen sind geplant.
          </p>
        </section>
        <section className="panel settings-card">
          <span className="feature-icon teal">
            <HardDrive size={22} />
          </span>
          <h2>Dein Lernstand</h2>
          <p>
            {p.completed.length} Module · {p.checkpoints.length} Lab-Schritte ·{" "}
            {p.challenge ? 1 : 0} Challenges abgeschlossen
          </p>
          <p>
            Der Lernstand liegt in IndexedDB in diesem Browser. Exportiere ihn
            für einen Gerätewechsel oder bevor du Browserdaten löschst. Ein
            Import ersetzt den vorhandenen Lernstand.
          </p>
          <div className="inline-actions">
            <button className="button primary" onClick={exportData}>
              <Download size={17} />
              Exportieren
            </button>
            <label className="button secondary upload-label">
              <Upload size={17} />
              Importieren
              <input
                aria-label="Lernstand importieren"
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  void importData(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </section>
        <section className="panel settings-card">
          <span className="feature-icon purple">
            <Network size={22} />
          </span>
          <h2>Lokaler Agent</h2>
          <Badge color="gray">Für einen späteren Meilenstein geplant</Badge>
          <p>
            Diese Version verbindet sich nicht mit deinem Rechner oder
            Kubernetes-Cluster. Echte Labs führst du im eigenen Terminal durch.
            Die Website benötigt keine kubeconfig und keine Zugangsdaten.
          </p>
          <Link className="text-link" to="/build">
            Zum geführten Build Lab
            <ChevronRight size={16} />
          </Link>
        </section>
        <section className="panel settings-card">
          <span className="feature-icon orange">
            <RotateCcw size={22} />
          </span>
          <h2>Neu anfangen</h2>
          <p>
            Setze abgeschlossene Module, Lab-Schritte und Challenges auf diesem
            Gerät zurück. Exportiere vorher einen Lernstand, den du behalten
            möchtest.
          </p>
          {!confirm ? (
            <button
              className="button secondary"
              onClick={() => setConfirm(true)}
            >
              Lernstand zurücksetzen
            </button>
          ) : (
            <div className="notice warning">
              <p>Gesamten Lernstand auf diesem Gerät löschen?</p>
              <div className="inline-actions">
                <button
                  className="button danger"
                  onClick={() => {
                    p.reset();
                    setConfirm(false);
                    setMessage("Lernstand zurückgesetzt.");
                  }}
                >
                  Ja, zurücksetzen
                </button>
                <button
                  className="button secondary"
                  onClick={() => setConfirm(false)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
    </>
  );
}
export default App;
