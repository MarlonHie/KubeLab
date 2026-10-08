import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
self.MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });
export default function YamlEditor({
  value,
  onChange,
  dark,
}: {
  value: string;
  onChange: (v: string) => void;
  dark: boolean;
}) {
  return (
    <Editor
      height="350px"
      language="yaml"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme={dark ? "vs-dark" : "light"}
      loading={<p>YAML-Editor wird geladen …</p>}
      options={{
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 18 },
        tabSize: 2,
        wordWrap: "on",
        ariaLabel: "Kubernetes YAML-Manifest",
        fixedOverflowWidgets: true,
      }}
    />
  );
}
