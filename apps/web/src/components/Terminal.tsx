import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
export function Terminal({
  run,
  resetKey,
}: {
  run: (command: string) => string;
  resetKey: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handler = useRef(run);
  handler.current = run;
  useEffect(() => {
    if (!root.current) return;
    const term = new XTerm({
      fontFamily: '"SFMono-Regular", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#111827",
        foreground: "#cbd5e1",
        cursor: "#7fa2ff",
      },
      rows: 10,
      scrollback: 300,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(root.current);
    fit.fit();
    let buffer = "";
    term.writeln("\x1b[38;5;111mKubeLab · Kubernetes-Simulation\x1b[0m");
    term.writeln("Kein Zugriff auf deinen Rechner. Gib help ein.");
    const prompt = () =>
      term.write("\r\n\x1b[38;5;78mkubelab\x1b[0m \x1b[38;5;111m❯\x1b[0m ");
    prompt();
    const data = term.onData((input) => {
      for (const char of input) {
        if (char === "\r") {
          term.write("\r\n");
          if (buffer === "clear") term.clear();
          else if (buffer.trim()) term.writeln(handler.current(buffer));
          buffer = "";
          prompt();
        } else if (char === "\u007f") {
          if (buffer.length) {
            buffer = buffer.slice(0, -1);
            term.write("\b \b");
          }
        } else if (char === "\u0003") {
          buffer = "";
          term.write("^C");
          prompt();
        } else if (char >= " " && char <= "~" && buffer.length < 300) {
          buffer += char;
          term.write(char);
        }
      }
    });
    const resize = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* Unmounted terminal. */
      }
    });
    resize.observe(root.current);
    return () => {
      resize.disconnect();
      data.dispose();
      term.dispose();
    };
  }, [resetKey]);
  return (
    <div ref={root} className="terminal" aria-label="Simuliertes Terminal" />
  );
}
