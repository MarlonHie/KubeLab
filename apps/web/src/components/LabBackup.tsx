import { useState } from "react";
import { Download, Upload, HardDrive } from "lucide-react";
import { useLab } from "../stores/lab";
import { parseLab } from "../../../../packages/lab-state/src";
export function LabBackup() {
  const lab = useLab();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<ReturnType<typeof parseLab> | null>(
    null,
  );
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(parseLab(lab), null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "kubelab-lab-v1.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Lab-Export enthält YAML-Entwurf, Clusterzustand und aktives Szenario.",
    );
  }
  async function read(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2000000) throw new Error("Maximal 2 MB pro Lab-Import.");
      setPending(parseLab(JSON.parse(await file.text())));
      setMessage(
        "Datei geprüft. Bestätige das Ersetzen deines aktuellen Labs.",
      );
    } catch (e) {
      setPending(null);
      setMessage(e instanceof Error ? e.message : "Lab-Import fehlgeschlagen.");
    }
  }
  return (
    <section className="panel settings-card">
      <span className="feature-icon teal">
        <HardDrive size={22} />
      </span>
      <h2>Gespeichertes Lab</h2>
      <p>
        YAML-Entwurf, angewendete Ressourcen und Szenario werden automatisch in
        IndexedDB gesichert. Auch ungültige, noch nicht angewendete Entwürfe
        bleiben erhalten. Die Speicherung gilt für diesen Browser und diese
        Website-Adresse.
      </p>
      <p>
        {lab.cluster.resources.length} Ressourcen ·{" "}
        {lab.scenario || "Freier Spielplatz"}
      </p>
      <div className="inline-actions">
        <button className="button primary" onClick={download}>
          <Download size={17} />
          Lab exportieren
        </button>
        <label className="button secondary upload-label">
          <Upload size={17} />
          Lab importieren
          <input
            type="file"
            aria-label="Lab importieren"
            accept=".json,application/json"
            onChange={(e) => {
              void read(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {message && <p role="status">{message}</p>}
      {pending && (
        <div className="notice warning reset-confirm">
          <p>
            Gespeichertes Lab durch die geprüfte Datei ersetzen? Dein
            Academy-Lernstand bleibt erhalten.
          </p>
          <div className="inline-actions">
            <button
              className="button danger"
              onClick={() => {
                lab.replace(pending);
                setPending(null);
                setMessage("Lab erfolgreich importiert.");
              }}
            >
              Lab-Import bestätigen
            </button>
            <button
              className="button secondary"
              onClick={() => {
                setPending(null);
                setMessage("Import abgebrochen.");
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {lab.error && <p role="alert">{lab.error}</p>}
    </section>
  );
}
