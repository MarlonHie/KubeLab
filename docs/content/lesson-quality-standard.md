# Redaktioneller Qualitätsstandard · Lernplattform 2.0

Stand: 28. Oktober 2026. KubeLab erklärt Kubernetes für Einsteiger und Menschen, die einzelne Konzepte im Arbeitsalltag verstehen möchten. Tiefe ist willkommen; Pflichtprüfungen, Mindestlängen und eine Expertenlaufbahn sind es nicht.

## Inhalt und Aufbau

Eine Lektion beantwortet eine verständliche Frage oder behandelt ein konkretes Problem. Sie erklärt die benötigten Begriffe, zeigt bei Bedarf ein nachvollziehbares Beispiel und benennt Grenzen sowie hilfreiche nächste Themen. Eine kleine zusammenhängende Erklärung kann bereits eine vollständige Lektion sein. Eine lange Liste von Fachworten ohne Erklärung genügt nicht.

Empfohlener Aufbau: Einstieg → schrittweise Erklärung → passendes Beispiel → bei Bedarf Interaktion → bei Bedarf optionaler Deep Dive → verwandte Themen. Diese Reihenfolge ist kein starres Blockschema. Nicht jede Lektion benötigt alle Elemente. Bestehende Inhalte werden nicht gekürzt, nur damit sie in eine künstliche Seitenlänge passen.

Es gibt ausdrücklich **keine** Mindestanzahl an Lektionen, Mindestlernzeit, Mindestwortzahl, Quizpflicht, Aufgabenpflicht oder Expert-Challenge-Pflicht. Auch KubeShop ist optional: Für einen Netzwerkpfad, ein Betriebssystemsignal oder Raft kann ein anderes Beispiel verständlicher sein. Lernpfade empfehlen eine Reihenfolge, sperren aber keine Inhalte.

## Technische Tiefe und Wiederverwendung

Grundlegende Erklärungen sollen ohne Internals lesbar sein. Technische Details sind klar abgegrenzt, direkt verlinkbar und dürfen anspruchsvoll bleiben. Vorhandene Raft-/MVCC-, Scheduler-, Informer-, PLEG-, Linux- und Container-Inhalte werden erhalten. Im Text notwendiges Vorwissen wird kurz erklärt oder empfohlen, nicht als Freischaltbedingung implementiert.

Eine Erklärung wird einmal gepflegt. Themen, Pfade und Empfehlungen verweisen auf dieselbe Inhalts-ID und dieselben Abschnitte. Wiederholung ist sinnvoll, wenn eine neue Perspektive hinzukommt; die gleichen Absätze in drei Pfaden zu kopieren ist es nicht. Zentrale Metadaten enthalten Kategorie, Tags, Synonyme, empfohlenes Vorwissen, Beziehungen, optionale Deep-Dive-Abschnitte, Werkzeuge und optional KubeShop-Bezug.

## Wenn eine Interaktion oder Aufgabe verwendet wird

Sie muss dem Verständnis dienen. Eine reine Animation oder ein Klickpfad ist nicht automatisch besser als ein klar erläutertes Diagramm. Jede tatsächlich bewertete Aufgabe benennt Startzustand, Ziel, ausgewertete Belege, Grenzen und Reset. Eine Konfigurationsaufgabe prüft nach Möglichkeit das Ergebnis, nicht nur eine beliebige Zeichenfolge oder die Reihenfolge der Klicks.

Geführte Exploration darf Schritte vormachen. Eigenständige optionale Diagnosen lassen Untersuchungsreihenfolge und zulässige Alternativen offen. Hinweise und Lösungen werden bewusst aufgedeckt. Eine Lösung anzusehen vergibt keinen unabhängigen Nachweis. Bei Freitext ohne Prüfer wird eine Vergleichserklärung angeboten, kein angeblich automatisch geprüftes Verständnis.

Beispiel für eine geeignete Service-Aufgabe: Service selektiert zwei API-Pods im richtigen Namespace; ähnliche Labels im anderen Namespace sind eine Gegenprobe. Die Rückmeldung erklärt, dass der vorhandene Graph nur Labelzuordnung prüft, keine HTTP-Verbindung. Eine solche Aufgabe ist eine mögliche Ergänzung, keine Pflicht für jede Service-Erklärung.

Quizfragen sind freiwillige Selbstkontrolle. Wenn vorhanden, braucht jede Antwort eine fachliche Begründung und die Frage ein sinnvolles Lernziel. Die Anzahl folgt dem Inhalt. Kein Abschluss darf von einem Quiz, einer Aufgabe oder einem Deep Dive abhängen.

## Fortschritt ohne Prüfungsdruck

Primär gibt es einen zentralen Lesestatus pro Lektion: bewusst markieren oder wieder aufheben. Er gilt in allen Pfaden. Lesen allein wird nicht als geprüfte Kompetenz ausgegeben; der Button ist eine Selbsteinschätzung.

Historische Theorie-, Praxis- und unabhängige Nachweise bleiben erhalten und exportierbar. Ihre alten fachlichen Bedingungen bleiben für diesen Nachweistyp gültig, beeinflussen aber den neuen Lesestatus nicht. Die UI zeigt sie sekundär. Hilfe entwertet keine früheren Nachweise. Ein Moduswechsel setzt den aktuellen Übungsversuch zurück; gewöhnliches Auf- und Zuklappen erhält Antworten. Modellnachweis, manuelle Selbstauskunft und echte externe Ausführung bleiben unterschiedliche Aussagen.

## Dauer und Umfang

Dauer ist optional. Eine angegebene Zeit beschreibt grob die erwartete Beschäftigung mit dem Inhalt, kein Lernziel und keine Vorgabe. Optionale Internals, externe Einrichtung und Downloadzeiten sollen bei Bedarf getrennt erklärt werden. Historische Schätzungen dürfen nicht als gemessene Lernzeiten beworben werden.

Bei größeren Überarbeitungen helfen freiwillige Probedurchläufe: unklare Begriffe, tatsächliche aktive Zeit und unnötige Wiederholungen notieren. Es gibt keine verbindliche Testpersonenquote, die eine kurze Begriffserklärung unnötig blockiert. Keine Registrierung oder Telemetriepflicht. Texte werden nie verlängert, um eine Minutenzahl zu erreichen.

## Fachreview und Ausführungsgrenzen

Anspruchsvolle Aussagen benötigen nachvollziehbare Primärquellen und Versionskontext. Reviewdatum ist kein Beweis einer getesteten Installation. Beispiele unterscheiden vollständige Ressourcen und Fragmente mit Einfügeort. Versionsabhängige APIs oder Einstellungen werden vor einer ausführbaren Anleitung gegen die passenden Projektquellen geprüft.

Ausgaben sind entweder tatsächlich aufgezeichnet und anonymisiert, redaktionell verfasste Befunde oder Modellzustände. Herkunft deutlich benennen. Das Browserterminal bleibt eine begrenzte Simulation. Es startet weder Linux-Prozesse noch Kubernetes-Cluster. Keine echte Clusteranbindung und keine lokale Agentenentwicklung gehören zu diesem Auftrag.

Ein optionaler externer Leitfaden benötigt Voraussetzungen, getestete Versionen, Startzustand, erwartete Zwischenbefunde und Reset, bevor er als verifiziert bezeichnet wird. Der vorhandene kubeadm-Leitfaden bleibt bis zu einer tatsächlichen vollständigen Reproduktion entsprechend gekennzeichnet. Ein Cluster ist für keinen Lernpfad vorausgesetzt. Fiktive Secrets verwenden; keine echten kubeconfigs oder Zugangsdaten im Browser verlangen.

## Benutzerführung und Zugänglichkeit

Zusammenhängende Fachkapitel statt gleichgewichtiger Kartenberge. Optionale Aufgaben, Nachweise und Internals einklappbar; Suchtreffer dürfen direkt zu einem Deep Dive führen. Verwandte Themen und Vorwissen kommen aus der gemeinsamen Bibliothek, nicht aus einzelnen React-Komponenten.

Tastaturbedienung, sichtbarer Fokus, verständliche Beschriftungen, schmale Bildschirme und Textalternativen für wesentliche Modellzustände gehören zur Qualität. Navigation darf beim Öffnen einer Lektion keine alten YAML-Entwürfe überschreiben. GitHub-Pages-Unterpfad, relative Assets und Hash-Routing bleiben unterstützt. Kein kostenpflichtiger Backenddienst, kein Konto und keine neue Dependency ohne konkreten Bedarf.

## Angemessene Abnahme

| Änderung | Prüfung |
| --- | --- |
| Erklärung/Beispiel | Fachliche Aussage, verständlicher Einstieg, Quellen, keine unnötigen Wiederholungen |
| Metadaten/Pfad | Gültige IDs/Abschnitte, passende Empfehlungen, Synonymsuche, keine Zugangssperre |
| Optionale Aufgabe | Richtige/falsche Fälle, Modellgrenze, Hilfestatus, gegebenenfalls Alternativlösung |
| UI | Navigation, Direktlink, Tastatur, Mobilansicht, keine Pflicht zum Bearbeiten optionaler Elemente |
| Speicherung | Alte IDs/Nachweise erhalten, Import/Export, Fehler ohne stillen Reset, gemeinsamer Lesestatus |
| Externes Lab | Reproduktionsprotokoll oder ausdrückliche Kennzeichnung als nicht verifiziert |

Fehlerhafte Kernbehauptungen, Datenverlust, vorgetäuschte Ausführung und unzugängliche notwendige Navigation verhindern die Freigabe. Umfang der Tests und Reviews folgt dem Risiko der Änderung. Fachreview und Pilotierung bleiben menschliche redaktionelle Arbeit; Tests allein bestätigen keine Lernwirksamkeit.
