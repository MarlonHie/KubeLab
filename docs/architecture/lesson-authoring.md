# Deklarative Lektionen · Content-System 1

Seit KubeLab 0.2.1 verwenden alle 13 vorhandenen Lektionen denselben Renderer. Der Inhalt wächst in einzelnen JSON-Dokumenten; neue Lektionen benötigen keine neue React-Seite. Modul 03 wurde vollständig migriert, die vier Einführungen ebenfalls. Der Ausbau weiterer Module ist nicht Teil dieses Updates.

## Dateien und Zuständigkeiten

| Ort                                          | Verantwortung                                               |
| -------------------------------------------- | ----------------------------------------------------------- |
| `content/lessons/*.json`                     | Eine deklarative Lektion pro Datei                          |
| `content/lessons/catalog.ts`                 | Explizite Registrierung und Reihenfolge                     |
| `packages/lesson-engine/lesson.schema.json`  | JSON Schema für Editor-Unterstützung und Laufzeitprüfung    |
| `packages/lesson-engine/src/types.ts`        | TypeScript-Blocktypen                                       |
| `packages/lesson-engine/src/schema.ts`       | Schema- und Referenzprüfung des vollständigen Katalogs      |
| `packages/lesson-engine/src/assessment.ts`   | Reine Theorie- und Praxisprüfung                            |
| `packages/lesson-engine/src/experiments.ts`  | Erlaubte Experimentarten und Beobachtungskennungen          |
| `apps/web/src/pages/LessonPage.tsx`          | Gemeinsame Seite, Navigation, Lernstand und Lektionssitzung |
| `apps/web/src/components/LessonBlocks.tsx`   | Darstellung der Inhaltsblöcke                               |
| `packages/simulation-engine/src/evidence.ts` | Modellzustände in überprüfbare Beobachtungen übersetzen     |

Die Katalogregistrierung ist bewusst explizit: Ein Entwurf wird erst durch den Import und den Eintrag im Array veröffentlicht. JSON-Imports verwenden `with { type: "json" }`, damit Vite, Node und die Browsertests dieselben Dokumente lesen können.

## Eine Lektion erstellen

1. Eine bestehende JSON-Datei kopieren; `$schema` verweist auf `../../packages/lesson-engine/lesson.schema.json`.
2. Eine stabile `id` und `moduleId` von `01` bis `16` vergeben. Titel, Beschreibung, Kategorie, Niveau, Dauer, Lernziele, Quellen und redaktionelles Datum ergänzen. Die Zeitangabe ist eine Lernzeit-Schätzung.
3. `sections` mit stabilen IDs, sichtbaren Titeln und kurzen `navLabel`-Bezeichnungen aufbauen. Darin werden `blocks` in Darstellungsreihenfolge eingetragen.
4. Genau einen `quiz`-Block ergänzen. Jede Frage braucht eine eindeutige ID, mindestens zwei unterschiedliche Antworten, einen gültigen nullbasierten `correct`-Index und eine Begründung.
5. Die JSON-Datei in `catalog.ts` importieren und an der gewünschten Position eintragen.
6. `npm test` und `npm run build` ausführen, anschließend die Seite und `npm run test:e2e` prüfen. Inhalt und Modellgrenzen benötigen zusätzlich ein Fachreview.

IDs sind Bestandteil gespeicherter Fortschritte. Bestehende Lektionen oder Aufgaben nicht nebenbei umbenennen oder ihre Prüfbedeutung austauschen. Änderungen an diesen Verträgen brauchen eine ausdrückliche Datenmigration und Tests.

## Unterstützte Blöcke

| `type`       | Inhalt                                                          |
| ------------ | --------------------------------------------------------------- |
| `text`       | Absatz in `text`                                                |
| `heading`    | Zwischenüberschrift in `text`                                   |
| `list`       | `ordered` und `items`                                           |
| `code`       | `language`, `code`, `caption`, `execution`, optional `filename` |
| `table`      | `caption`, `headers` und gleich breite `rows`                   |
| `callout`    | `tone` (`note`, `warning`, `tip`), `title`, `text`              |
| `experiment` | Instanz-ID und registriertes `kind`                             |
| `task`       | ID, Titel, Aufgabe, Hinweis, Lösung und `verification`          |
| `quiz`       | ID, Titel und Fragen                                            |

Text unterstützt gezielt **Fettschrift**, Inline-Code mit Backticks und Markdown-Links mit HTTPS-Zielen. Es gibt kein frei ausführbares HTML, JavaScript oder importiertes MDX. Unbekannte Blocktypen und zusätzliche Eigenschaften werden abgelehnt.

Codeblöcke unterstützen `bash`, `yaml`, `json` und `text`. Einfache Token-Färbung verbessert die Lesbarkeit; sie ist keine Syntaxprüfung. `execution` ist verpflichtend: `external` für das externe VM-Terminal, `simulation` für unterstützte Browserbefehle, `example` für Illustrationen und `output` für Beispielausgaben. Eine Ausgabe muss als nicht live erkennbar sein. Dateien und Befehle werden kopiert, aber nicht ausgeführt.

```json
{
  "type": "code",
  "language": "yaml",
  "execution": "example",
  "filename": "replicas.yaml",
  "caption": "Nur ein Konfigurationsausschnitt, kein vollständiges Manifest.",
  "code": "spec:\n  replicas: 3\n"
}
```

## Theorie und Praxis

Ein vollständig richtig beantworteter Wissenscheck vergibt ausschließlich **Theorie verstanden**. **Praxis gemeistert** bedeutet, dass alle automatisch prüfbaren Aufgaben dieser Lektion erfolgreich geprüft wurden. Eine Lektion ohne solche Aufgaben zeigt **Praxis nicht automatisch geprüft**. Das ist insbesondere für die unveränderten Einführungen und externen VM-Übungen relevant.

Es gibt drei Prüfarten:

- `reflection`: Offene Frage mit Hinweis und Lösung, ausdrücklich ohne automatische Bewertung. Dazu gehören die Expert-Reflexionen; das Öffnen ihrer Lösung vergibt keinen Abschluss.
- `matching`: Deklarative `options` sowie `items` mit `prompt` und `answer`. Alle Zuordnungen müssen stimmen. Beispiel: Komponenten ihren Zuständigkeiten zuordnen. Diese Prüfung belegt eine Lernmodell-Aufgabe, keine praktische Administration eines echten Clusters.
- `experiment`: Verweis auf eine vorher platzierte Experiment-Instanz über `experimentId`, dazu `requirements` mit erlaubter `event`-Kennung und lesbarem `label`. Alle geforderten Beobachtungen müssen während dieses Lektionsbesuchs tatsächlich ausgelöst werden; dann bestätigt „Praxisaufgabe prüfen“ den Nachweis.

```json
{
  "kind": "experiment",
  "experimentId": "model",
  "requirements": [
    {
      "event": "quorum.no-majority",
      "label": "Schreibversuch ohne Mehrheit blockiert"
    }
  ]
}
```

Die Prüfungen benötigen keine zusätzliche VM-Infrastruktur. etcd und API melden Beobachtungen bei Schreibversuchen. Scheduling und Runtime melden sie über „Zustand für Aufgabe prüfen“. Nur registrierte Ereignisse des referenzierten Modells sind zulässig. Die Anforderungen bilden eine Menge beobachteter Fälle, keine zeitliche Reihenfolgenprüfung. Ein Modell-Reset verwirft die zugehörigen noch nicht gespeicherten Beobachtungen; ein bereits erworbener Abschluss bleibt als historischer Nachweis erhalten.

Quizantworten, Zuordnungen, Rückmeldungen und Experimentzustände sind an die Lektions-ID gebunden und werden bei Navigation neu erzeugt. Nur bestandene Abschlüsse werden dauerhaft gespeichert. Hinweise und Lösungen bleiben frei zugänglich; dies ist ein selbstgesteuertes Lernwerkzeug, keine manipulationssichere Zertifizierungsprüfung.

Neue Aufgaben mit vorhandenen Prüfarten sind reine Inhaltsänderungen. Ein neues Experiment oder eine neue Prüfart benötigt einmalig eine registrierte, getestete Implementierung. Der JSON-Inhalt enthält keine ausführbaren Prüfskripte.

## Fortschrittsmigration

Der IndexedDB-Schlüssel bleibt `kubelab-progress`. Schema-Version 3 enthält:

- `theoryCompleted`: stabile Lektions-IDs;
- `practiceCompleted`: qualifizierte Aufgaben-IDs, etwa `etcd/practice`;
- unverändert Theme, letzte Lektion, Build-Lab-Checkpoints und Operations-Challenges.

Version 2 migriert alle bisherigen `completed`-IDs zu Theorieabschlüssen. Version 1 behält die bestehende Ausnahme für den früheren einzelnen Control-Plane-Wissenscheck bei. Alte Stände erhalten **keine** Praxisabschlüsse, da dafür keine überprüften Nachweise vorliegen. Der geladene Altstand wird serialisiert als Version 3 zurückgeschrieben. Export und Import unterstützen beide Lernspuren; unbekannte oder offene Reflexionsaufgaben sind keine gültigen Praxisabschlüsse. Das separate gespeicherte Lab bleibt unverändert.

Die Originalinhalte von 0.2 liegen ausschließlich als Migrations-Testfixtures unter `tests/fixtures/`. Tests vergleichen sämtliche Textwerte und Quizfragen der neun Architekturlektionen sowie die Inhaltszeilen der vier ehemaligen MDX-Einführungen. Aktiver Inhalt wird ausschließlich in `content/lessons/` gepflegt.
