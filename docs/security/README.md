# Sicherheitsgrenzen

Die Anwendung stellt keine Verbindung zur Kubernetes-API oder zu localhost-Agenten her. kubeconfig, Tokens und andere Zugangsdaten werden weder verlangt noch verarbeitet. Das Browserterminal führt nur die explizit unterstützten Simulationsbefehle aus. Nicht unterstützte Befehle und Flags liefern Fehler.

MDX und strukturierte Lektionen kommen ausschließlich aus dem Repository und werden beim Build kompiliert. Importierte Lern- und Lab-Stände sind JSON mit Versions-, Größen- und Werteprüfung; fremde Dateien werden nicht als Code ausgeführt. YAML wird als Daten geparst (100-KB-Grenze und begrenzte Aliase). IndexedDB enthält Theme, Fortschritt, YAML-Entwurf, angewendete Ressourcen, Szenario und letzte Simulationsausgabe. Lab-Import und Reset verlangen eine Bestätigung in der Oberfläche. Keine echten Secrets in Übungsmanifeste oder Sicherungen eintragen. Browser-Speicher ist kein dauerhaft garantiertes Backup.

Die Build-Lab-Befehle sind für eigene, frische und isolierte Übungs-VMs bestimmt. Versionspins sind reproduzierbare Lernstände, keine aktuellen Produktionsempfehlungen. Der Reset erfolgt über vorab angelegte Snapshots. Das Lab wurde hier nicht auf echten VMs ausgeführt.

Vor einem künftigen Agenten sind lokale explizite Autorisierung, Origin-Prüfung, kurzlebige Pairing-Tokens, eine enge API, sichere Session-Beendigung und eine unabhängige Sicherheitsprüfung erforderlich. In der aktuellen Version wird kein Agent installiert.
