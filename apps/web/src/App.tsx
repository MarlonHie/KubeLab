import {
  Home,
  Discover,
  Paths,
  PathDetail,
  TopicPreview,
} from "./pages/Learning";
import { Academy } from "./pages/Academy";
import { LessonPage } from "./pages/LessonPage";
import { LabBackup } from "./components/LabBackup";
import { Badge, Heading } from "./components/Page";
import { Operations } from "./pages/Operations";
import { useLab } from "./stores/lab";
import { ExecutionNotice } from "./components/ExecutionNotice";
import { useEffect, useState } from "react";
import {
  NavLink,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  BookOpen,
  Box,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  HardDrive,
  Layers3,
  Menu,
  Moon,
  Network,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sun,
  TerminalSquare,
  Upload,
  X,
} from "lucide-react";
import { useProgress, parseProgress } from "./stores/progress";
import { lessons, deepDiveMastered } from "../../../packages/lesson-engine/src";
import { schedule } from "../../../packages/cluster-model/src";
import { ClusterGraph } from "./components/ClusterGraph";
import { buildSteps } from "./pages/buildSteps";
const nav = [
  { to: "/discover", label: "Entdecken", icon: BookOpen },
  { to: "/paths", label: "Lernpfade", icon: GraduationCap },
  { to: "/playground", label: "Playground", icon: TerminalSquare },
];
function App() {
  const progress = useProgress();
  const labReady = useLab((s) => s.ready);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    document.documentElement.dataset.theme = progress.theme;
  }, [progress.theme]);
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
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
              {n.to === "/academy" && (
                <span className="nav-count">{lessons.length}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-path">
          <span className="path-icon">
            <GraduationCap size={21} />
          </span>
          <strong>
            Kubernetes verstehen.
            <br />
            In deinem Tempo.
          </strong>
          <p>
            Deine Fragen. Dein Lernweg.
            <br />
            In deinem Tempo.
          </p>
          <Link to="/paths">
            Lernpfad entdecken <ChevronRight size={16} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="local-state">
            <HardDrive size={15} />
            <span>
              {progress.error ? "Speicherfehler" : "Lokaler Lernstand"}
            </span>
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
            KubeLab <span>v0.3.0 · Local first</span>
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
                  )?.label ||
                  (location.pathname.startsWith("/academy")
                    ? "Entdecken"
                    : location.pathname.startsWith("/topics")
                      ? "Entdecken"
                      : ["/operations", "/visualizer", "/build"].includes(
                            location.pathname,
                          )
                        ? "Playground"
                        : "Startseite")}
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
          {!progress.ready || !labReady ? (
            <div className="panel">Lernstand wird geladen …</div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/academy" element={<Discover />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/paths" element={<Paths />} />
              <Route path="/paths/:id" element={<PathDetail />} />
              <Route path="/topics/:id" element={<TopicPreview />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/academy/:id" element={<Lesson />} />
              <Route path="/build" element={<Playground forced="build" />} />
              <Route
                path="/operations"
                element={<Playground forced="editor" />}
              />
              <Route
                path="/visualizer"
                element={<Playground forced="visualizer" />}
              />
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
function Playground({ forced }: { forced?: string }) {
  const [search] = useSearchParams();
  const tool = forced || search.get("tool") || "editor";
  return (
    <>
      <nav className="playground-nav" aria-label="Playground-Werkzeuge">
        {[
          ["editor", "Editor & Terminal"],
          ["visualizer", "Visualizer"],
          ["build", "Build-Leitfaden"],
        ].map(([id, label]) => (
          <Link
            key={id}
            className={tool === id ? "selected" : ""}
            aria-current={tool === id ? "page" : undefined}
            to={"/playground?tool=" + id}
          >
            {label}
          </Link>
        ))}
        <Link to="/discover?category=Architektur+%26+Interna">
          Architektur-Simulationen
        </Link>
      </nav>
      {tool === "visualizer" ? (
        <Visualizer />
      ) : tool === "build" ? (
        <BuildLab />
      ) : (
        <Operations />
      )}
    </>
  );
}
function Lesson() {
  const { id } = useParams();
  const lesson = lessons.find((l) => l.id === id);
  return lesson ? (
    <LessonPage lesson={lesson} />
  ) : (
    <Navigate to="/academy" replace />
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
  const lab = useLab();
  const [view, setView] = useState<"lab" | "example">("lab");
  return (
    <>
      <Heading
        eyebrow="CLUSTER VISUALIZER"
        title="Sieh, wie alles zusammenhängt."
        description="Erkunde die Control Plane. Klicke auf eine Komponente oder folge dem Weg eines Pods."
        action={
          <Badge color="purple">
            {view === "lab" ? "Deine Simulation" : "Beispielarchitektur"}
          </Badge>
        }
      />
      <ExecutionNotice mode="simulation" />
      <div className="visualizer-toolbar">
        <div className="segmented">
          <button
            className={view === "lab" ? "selected" : ""}
            onClick={() => setView("lab")}
          >
            Mein gespeichertes Lab
          </button>
          <button
            className={view === "example" ? "selected" : ""}
            onClick={() => setView("example")}
          >
            Beispielarchitektur
          </button>
        </div>
        <Link className="button primary" to="/operations">
          Im Editor bearbeiten
        </Link>
      </div>
      <section className="panel visualizer-panel">
        <div className="panel-bar">
          <span>
            <Network size={18} />
            Kubernetes-Architektur
          </span>
          <span className="subtle">1 Control Plane · 2 Worker</span>
        </div>
        <ClusterGraph cluster={view === "lab" ? lab.cluster : undefined} />
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
      <ExecutionNotice mode="external" />
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
        <LabBackup />
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
          <p data-testid="progress-save-status">
            {p.saveStatus === "saved"
              ? "Lernstand lokal gespeichert"
              : p.saveStatus === "pending"
                ? "Lernstand wird gespeichert …"
                : p.saveStatus === "error"
                  ? "Lernstand nicht gespeichert"
                  : "Lernstand wird geladen …"}
          </p>
          <p>
            {p.readCompleted.length} als gelesen markiert ·{" "}
            {p.theoryCompleted.length} optionale Wissenschecks ·{" "}
            {p.practiceCompleted.length} Praxisaufgaben · {p.checkpoints.length}{" "}
            Lab-Schritte · {p.completedChallenges.length} Challenges
            abgeschlossen
          </p>
          <p>
            {p.independentCompleted.length} eigenständige Vertiefungsnachweise ·{" "}
            {lessons.filter((l) => deepDiveMastered(l, p)).length} Deep Dives
            gemeistert
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
            Setze Grundlagenabschlüsse, Praxisnachweise, Lab-Schritte und
            Challenges auf diesem Gerät zurück. Exportiere vorher einen
            Lernstand, den du behalten möchtest.
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
