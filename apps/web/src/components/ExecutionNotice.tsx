import { FlaskConical, TerminalSquare } from "lucide-react";
export function ExecutionNotice({ mode }: { mode: "simulation" | "external" }) {
  return (
    <div className={`execution-notice ${mode}`}>
      <span className="execution-label">
        {mode === "simulation" ? (
          <FlaskConical size={20} />
        ) : (
          <TerminalSquare size={20} />
        )}
        <strong>
          {mode === "simulation"
            ? "Browser-Simulation"
            : "Echte Ausführung · externes VM-Terminal"}
        </strong>
      </span>
      <p>
        {mode === "simulation"
          ? "Befehle ändern nur das lokale Lernmodell. Es starten keine Container; es besteht keine Verbindung zu deinem Rechner oder Cluster."
          : "Diese Webseite zeigt Anleitungen. Erst wenn du die Befehle selbst im Terminal deiner isolierten Lab-VM ausführst, verändern sie echte Systeme. Checkpoints bestätigst du manuell."}
      </p>
    </div>
  );
}
