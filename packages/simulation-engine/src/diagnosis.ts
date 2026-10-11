// Authored teaching cases, explicitly not terminal output or measurements from a real host.
export interface DiagnosticCase {
  title: string;
  symptom: string;
  evidence: { id: string; label: string; observation: string }[];
  causes: string[];
  remedies: string[];
  cause: number;
  remedy: number;
  explanation: string;
}
function scenario(
  title: string,
  symptom: string,
  observations: [string, string][],
  causes: string[],
  remedies: string[],
  cause: number,
  remedy: number,
  explanation: string,
): DiagnosticCase {
  return {
    title,
    symptom,
    evidence: observations.map(([label, observation], i) => ({
      id: `observation-${i}`,
      label,
      observation,
    })),
    causes,
    remedies,
    cause,
    remedy,
    explanation,
  };
}
export const diagnosticCases: Record<string, DiagnosticCase> = {
  "cluster-basics": scenario(
    "Gleicher Name, anderes Objekt",
    "Teamboards Cache behandelt einen ersetzten Pod wie seinen Vorgänger.",
    [
      [
        "Identitäten vergleichen",
        "Alter Pod: UID A. Neu angelegter Pod gleichen Namens: UID B.",
      ],
      ["Besitz prüfen", "Ein gespeicherter Verweis nennt weiterhin UID A."],
    ],
    [
      "Die Objektidentität wurde nur über den Namen verglichen.",
      "Der Scheduler hat die UID umbenannt.",
      "Alle Pods im Namespace teilen eine UID.",
    ],
    [
      "Mehr CPU zuweisen.",
      "Referenzen anhand von UID und Eigentümer neu abgleichen.",
      "Den Namespace umbenennen.",
    ],
    0,
    1,
    "Ein neuer Pod ist trotz gleichem Namen ein anderes API-Objekt; alte Referenzen müssen erneut geprüft werden.",
  ),
  "control-plane": scenario(
    "API-Replikate ohne Fortschritt",
    "Drei API-Endpunkte sind erreichbar, neue Writes scheitern.",
    [
      [
        "Backend-Erreichbarkeit",
        "Von drei etcd-Votern kann nur einer erreicht werden.",
      ],
      [
        "Frontend prüfen",
        "Load Balancer erreicht alle drei API-Prozesse; deren Speicheranfragen warten.",
      ],
    ],
    [
      "Zu wenige API-Prozesse.",
      "Fehlendes etcd-Quorum.",
      "Fehlender Pod-Score.",
    ],
    [
      "Weitere API-Replikate starten.",
      "Scheduler neu starten.",
      "Erreichbarkeit einer intakten etcd-Mehrheit wiederherstellen.",
    ],
    1,
    2,
    "API-Replikate ersetzen keine Raft-Stimmen. Bei temporärer Partition zuerst die intakte Mehrheit wieder erreichbar machen.",
  ),
  "api-lifecycle": scenario(
    "Lesen möglich, Schreiben blockiert",
    "Teamboard-GETs funktionieren, passende CREATEs nicht.",
    [
      [
        "Request-Grenze",
        "Authentifizierung und Autorisierung erfolgreich; Admission-Aufruf läuft in Timeout.",
      ],
      [
        "Webhook-Konfiguration",
        "Passender Webhook: failurePolicy Fail; dessen Service hat keine erreichbaren Endpunkte.",
      ],
    ],
    [
      "SSA-Feldbesitzkonflikt.",
      "Scheduler-Kapazität fehlt.",
      "Admission-Webhook nicht erreichbar.",
    ],
    [
      "Webhook-Verfügbarkeit reparieren und Request erneut prüfen.",
      "Feldbesitz mit force übernehmen.",
      "CPU-Requests reduzieren.",
    ],
    2,
    0,
    "Fail blockiert bei Aufruffehlern. Dies ist weder ein SSA-Konflikt noch eine Scheduling-Frage.",
  ),
  etcd: scenario(
    "Watch nach langer Pause",
    "Ein Controller verliert nach Wiederverbindung seinen Watch.",
    [
      [
        "Historie prüfen",
        "Der angefragte Bezugspunkt liegt vor der verfügbaren Kompaktierungsgrenze.",
      ],
      [
        "Backend prüfen",
        "Die etcd-Mehrheit ist gesund; aktuelle Reads funktionieren.",
      ],
    ],
    [
      "Die Historie ist nicht mehr abrufbar.",
      "Quorum dauerhaft verloren.",
      "Jeder Read wurde verboten.",
    ],
    [
      "Den alten Watch unbegrenzt wiederholen.",
      "Ausgangsbestand neu lesen und Watch darauf aufbauen.",
      "Sofort einen alten Snapshot restoren.",
    ],
    0,
    1,
    "Kompaktierte Historie verlangt einen neuen Ausgangsbestand. Ein Restore wäre hier die falsche Fehlerklasse.",
  ),
  controllers: scenario(
    "Timeout nach Create",
    "Ein Controller will nach einem Timeout erneut ein Kind erzeugen.",
    [
      [
        "API prüfen",
        "Ein Kind mit dem vorgesehenen Namen und korrekter Owner-UID existiert bereits.",
      ],
      [
        "Cache prüfen",
        "Der lokale Informer hat den neuen Stand noch nicht verarbeitet.",
      ],
    ],
    [
      "Der API-Write muss fehlgeschlagen sein.",
      "Client-Timeout bei erfolgreichem Write und nachlaufendem Cache.",
      "Zwei gleichnamige Objekte können im selben Scope existieren.",
    ],
    [
      "Für jeden Retry einen neuen Zufallsnamen wählen.",
      "Das vorhandene Kind ungeprüft löschen.",
      "Existenz und Eigentümer abgleichen und idempotent fortfahren.",
    ],
    1,
    2,
    "Der Timeout verrät den Serverausgang nicht. Der API-Befund verhindert ein doppeltes Anlegen.",
  ),
  scheduling: scenario(
    "Freie CPU hilft nicht",
    "Ein höher priorisierter Pod bleibt ungebunden.",
    [
      [
        "Volume-Topologie",
        "Das gebundene PV verlangt Zone b; der untersuchte Node liegt in Zone a.",
      ],
      [
        "Ressourcen prüfen",
        "Dieser Node hat ausreichend freie CPU und tolerierte Taints.",
      ],
    ],
    [
      "CPU-Request zu hoch.",
      "Readiness-Probe fehlerhaft.",
      "Harte PV-Node-Affinity nicht erfüllt.",
    ],
    [
      "Einen geeigneten Node in Zone b bereitstellen oder die Storage-Planung korrekt ändern.",
      "Andere Pods auf dem Node verdrängen.",
      "Nur den CPU-Score erhöhen.",
    ],
    2,
    0,
    "Preemption kann die Zone des bestehenden PV nicht ändern. Die harte Bedingung muss erfüllt werden.",
  ),
  "kubelet-runtime": scenario(
    "Prozess läuft, Verkehr fehlt",
    "Ein gestarteter Container wird nicht als bereit angeboten.",
    [
      [
        "Probe-Zustand",
        "Startup und Liveness erfolgreich; Readiness schlägt fehl.",
      ],
      [
        "Runtime-Zustand",
        "Container läuft, Restart-Zähler bleibt unverändert.",
      ],
    ],
    [
      "Readiness meldet fehlende Anwendungsbereitschaft.",
      "Scheduler bindet immer wieder neu.",
      "Ein Image-Pull ist unmöglich.",
    ],
    [
      "Liveness beliebig aggressiver machen.",
      "Readiness-Endpunkt und seine Abhängigkeiten untersuchen.",
      "Pod-Priorität erhöhen.",
    ],
    0,
    1,
    "Readiness allein löst keinen Neustart aus. Die Beobachtungen liegen nach erfolgreichem Containerstart.",
  ),
  "apply-to-pod": scenario(
    "Generation aufgeholt",
    "Ein Rollout gilt im Team voreilig als fertig.",
    [
      ["Controller-Status", "observedGeneration entspricht generation."],
      [
        "Verfügbarkeit prüfen",
        "updatedReplicas erreicht das Ziel, availableReplicas noch nicht; neue Pods sind nicht bereit.",
      ],
    ],
    [
      "Alle Nutzerzugriffe sind garantiert erfolgreich.",
      "Ziel beobachtet, Bereitschaft noch nicht erreicht.",
      "Das Deployment wurde nicht gespeichert.",
    ],
    [
      "Nochmals unverändert apply ausführen.",
      "Den Scheduler durch etcd ersetzen.",
      "Pod-Bereitschaft und Rollout-Conditions prüfen.",
    ],
    1,
    2,
    "Beobachtung der Generation und Verfügbarkeit sind unterschiedliche Aussagen.",
  ),
  "component-failures": scenario(
    "Node unerreichbar",
    "Ein zweiter Datenbank-Primärprozess soll sofort erzwungen werden.",
    [
      [
        "Control-Plane-Sicht",
        "Node-Lease erneuert sich nicht, Node gilt als unerreichbar.",
      ],
      [
        "Lokale Sicht",
        "Die VM läuft weiter und hat weiterhin Zugang zum Datenträger.",
      ],
    ],
    [
      "Der Node ist sicher ausgeschaltet.",
      "etcd enthält die PostgreSQL-Daten.",
      "Eine Partition kann den alten Writer weiterlaufen lassen.",
    ],
    [
      "Schreibautorität und Fencing klären, dann datenbankspezifisch wiederherstellen.",
      "Ungeprüft einen zweiten Writer erzwingen.",
      "Nur den Pod-Namen ändern.",
    ],
    2,
    0,
    "API-Unerreichbarkeit beweist keine Abschaltung. Die Datenbank benötigt Schutz vor konkurrierenden Writern.",
  ),
  "linux-processes": scenario(
    "Zombie trotz Signal",
    "Ein beendeter Kindprozess bleibt in der Prozessliste.",
    [
      [
        "Prozesszustand",
        "Kind steht in Zustand Z; kein ausführender Prozesscode mehr.",
      ],
      [
        "Elternprozess",
        "Der Elternprozess lebt, hat aber noch keinen wait-Aufruf für das Kind abgeschlossen.",
      ],
    ],
    [
      "Das Kind verbraucht weiterhin CPU in einer Endlosschleife.",
      "Exit-Status wurde vom Elternprozess noch nicht abgeholt.",
      "Ein Netzwerk-Namespace blockiert SIGKILL.",
    ],
    [
      "Kind wiederholt mit SIGKILL beenden.",
      "CPU-Limit erhöhen.",
      "Reaping im Elternprozess korrigieren; dessen Verhalten prüfen.",
    ],
    1,
    2,
    "Ein Zombie ist bereits beendet. Die verbliebenen Verwaltungsdaten verschwinden durch Reaping, nicht durch erneutes Töten.",
  ),
  "linux-namespaces": scenario(
    "Unsichtbarer Prozess",
    "Ein Prozess erscheint im Host-ps, aber nicht im Container-ps.",
    [
      [
        "PID-Sichten",
        "Host und Container haben unterschiedliche PID-Namespace-Identitäten.",
      ],
      [
        "Ressourcen prüfen",
        "Beide Prozesse verwenden dieselbe cgroup; es wurde kein CPU-Limit geändert.",
      ],
    ],
    [
      "PID-Namespace begrenzt die Prozesssicht.",
      "cgroup macht Prozesse unsichtbar.",
      "Ein eigenes Image startet einen zweiten Kernel.",
    ],
    [
      "Nur cpu.max erhöhen.",
      "Die PID-Sicht im passenden Namespace vergleichen.",
      "Alle Host-Prozesse in den Container mounten.",
    ],
    0,
    1,
    "Prozesssicht und Ressourcenabrechnung sind getrennt. Die gleiche cgroup impliziert keinen gleichen PID-Namespace.",
  ),
  "linux-cgroups": scenario(
    "Freier Host, langsamer Dienst",
    "Teamboards CPU-lastiger Dienst ist langsam, obwohl der Host Reserven hat.",
    [
      [
        "CPU-Budget",
        "Die betreffende cgroup hat cpu.max mit Quote 50000 und Periode 100000 Mikrosekunden.",
      ],
      [
        "Zeitvergleich",
        "nr_throttled und throttled_usec steigen zwischen zwei Messpunkten; kein neuer oom_kill-Eintrag.",
      ],
    ],
    [
      "Sicher ein Speicher-OOM.",
      "DNS-Ausfall.",
      "CPU-Bandbreite der cgroup wird begrenzt.",
    ],
    [
      "CPU-Budget und Last abgleichen; bei Bedarf kontrolliert anpassen.",
      "Nur memory.max erhöhen.",
      "Neue PID-Namespace-ID vergeben.",
    ],
    2,
    0,
    "Die Quote entspricht langfristig 0,5 CPU-Zeitanteilen. Freie Host-CPU hebt diese Begrenzung nicht auf.",
  ),
  "linux-systemd": scenario(
    "Enabled, aber inaktiv",
    "Ein aktivierter Dienst ist nach einem Startversuch nicht verfügbar.",
    [
      [
        "Unit-Zustand",
        "Unit ist enabled, aber failed; ExecMainStatus ist ungleich null.",
      ],
      [
        "Journal untersuchen",
        "Der konfigurierte Startprozess beendet sich wegen einer fehlenden Konfigurationsdatei.",
      ],
    ],
    [
      "Enabled garantiert einen laufenden Prozess.",
      "Startprozess scheitert unabhängig von der Boot-Aktivierung.",
      "After erzeugt automatisch die fehlende Datei.",
    ],
    [
      "Nur daemon-reload wiederholen.",
      "Den Dienst immer schneller neu starten.",
      "Konfiguration korrigieren, Dienst starten und Status/Journal prüfen.",
    ],
    1,
    2,
    "Enabled betrifft die Einbindung beim Starten von Targets. Es ist keine Laufzeit- oder Bereitschaftsgarantie.",
  ),
  "linux-networking": scenario(
    "IP geht, Name nicht",
    "Teamboard erreicht einen Dienst per IP, nicht per DNS-Namen.",
    [
      [
        "Verbindung isolieren",
        "TCP-Verbindung zur erwarteten IP und zum Zielport ist erfolgreich.",
      ],
      [
        "Namensauflösung",
        "Die Namensauflösung im betroffenen Netzwerk-Kontext scheitert; Resolver-Adresse ist nicht erreichbar.",
      ],
    ],
    [
      "Resolver-Zugriff oder dessen Konfiguration ist gestört.",
      "Jede Route zum Anwendungsserver fehlt.",
      "Der Anwendungsprozess kann niemals lauschen.",
    ],
    [
      "Alle Routen löschen.",
      "Resolver-Konfiguration und Erreichbarkeit im gleichen Kontext prüfen.",
      "Nur Container-CPU erhöhen.",
    ],
    0,
    1,
    "Der erfolgreiche IP-Test grenzt den Fehler ein, beweist aber keine funktionierende Namensauflösung.",
  ),
  "container-images": scenario(
    "Image vorhanden, falsche Plattform",
    "Ein Image-Verweis kann auf dem Worker nicht passend aufgelöst werden.",
    [
      ["Index prüfen", "Der Image-Index bietet nur linux/amd64."],
      [
        "Node prüfen",
        "Der Worker benötigt linux/arm64; Registry und Zugang funktionieren.",
      ],
    ],
    [
      "Container ist nicht ready.",
      "Ein Digest erzwingt automatisch Emulation.",
      "Passendes Plattformmanifest fehlt.",
    ],
    [
      "Ein kompatibles Image bauen/veröffentlichen oder einen passenden Node wählen.",
      "Nur den gleichen Tag erneut versuchen.",
      "Das PV vergrößern.",
    ],
    2,
    0,
    "Ein Index verweist auf Plattformmanifeste; Inhaltsadressierung erzeugt keine fehlende Architekturvariante.",
  ),
  "container-runtime": scenario(
    "Metadaten ohne Prozess",
    "Eine containerd-Ressource existiert, aber die Anwendung läuft nicht.",
    [
      [
        "Container-Metadaten",
        "Containerdefinition und Snapshot sind vorhanden.",
      ],
      [
        "Task prüfen",
        "Kein laufender Task zu dieser Definition; der Startschritt wurde nicht erfolgreich abgeschlossen.",
      ],
    ],
    [
      "Containerd-Metadaten beweisen bereits einen laufenden Prozess.",
      "Definition und ausführender Task sind getrennte Zustände.",
      "Ein anderes Kubernetes-Namespace löst den Start aus.",
    ],
    [
      "Nur das Image neu taggen.",
      "etcd restoren.",
      "Task-/Startfehler, OCI-Konfiguration und Runtime-Zustand prüfen.",
    ],
    1,
    2,
    "containerd unterscheidet langlebige Metadaten von der Task-Ausführung. Ein Image- oder Container-Eintrag reicht nicht.",
  ),
  "container-cri": scenario(
    "Socket erreichbar, CRI fehlt",
    "crictl kann die Runtime nicht als CRI-Dienst verwenden.",
    [
      [
        "Transport prüfen",
        "containerd-Socket ist erreichbar, die CRI-RuntimeService-Abfrage ist dort nicht verfügbar.",
      ],
      [
        "Plugin prüfen",
        "Die CRI-Integration ist in dieser Konfiguration deaktiviert; ctr kann containerd-Metadaten lesen.",
      ],
    ],
    [
      "Erreichbarer containerd-Socket garantiert keine aktive CRI-Integration.",
      "ctr und crictl sprechen dasselbe Protokoll.",
      "Die Pod-Readiness verhindert CRI.",
    ],
    [
      "Das Deployment öfter anwenden.",
      "Passenden Endpunkt und versionsgerechte CRI-Konfiguration korrigieren.",
      "Einfach jeden Socket per HTTP abfragen.",
    ],
    0,
    1,
    "Transport, containerd-API und CRI-Vertrag sind verschiedene Schichten.",
  ),
  "container-lifecycle": scenario(
    "Wiederholt Exit 137",
    "Ein Container startet immer wieder; Exit 137 allein ist noch keine Diagnose.",
    [
      [
        "Exit-Befund",
        "Prozess durch SIGKILL beendet; Exit-Code 137 im beobachteten Lauf.",
      ],
      [
        "Speicher-Befund",
        "Im selben Zeitraum steigt oom_kill der zugehörigen cgroup; Speichergrenze wird erreicht.",
      ],
    ],
    [
      "137 beweist immer einen OOM ohne weitere Beobachtung.",
      "Image-Digest fehlt zwingend.",
      "Die zusätzlichen Befunde stützen einen cgroup-Speicher-OOM.",
    ],
    [
      "Speicherbedarf, Leak und Limit untersuchen; Änderung anschließend beobachten.",
      "Nur Readiness deaktivieren.",
      "Einen anderen Tag ohne Prüfung ziehen.",
    ],
    2,
    0,
    "Erst die korrelierten Speicherereignisse stützen OOM. Exit 137 kann auch durch andere SIGKILL-Ursachen entstehen.",
  ),
};
export function checkDiagnosis(
  caseId: string,
  inspected: readonly string[],
  answers: Record<number, string>,
) {
  const c = diagnosticCases[caseId];
  if (!Object.hasOwn(diagnosticCases, caseId))
    return [{ label: "Unbekannter Diagnosefall", passed: false }];
  return [
    {
      label: "Belege erhoben",
      passed: c.evidence.every((e) => inspected.includes(e.id)),
    },
    {
      label: "Ursache aus Befunden abgeleitet",
      passed: answers[0] === c.causes[c.cause],
    },
    {
      label: "Passende Korrektur gewählt",
      passed: answers[1] === c.remedies[c.remedy],
    },
  ];
}
