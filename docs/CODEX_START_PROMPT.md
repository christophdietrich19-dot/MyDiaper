# Startprompt für Codex — MyDiaper

Diesen Text kann Christoph als Ausgangspunkt in Codex verwenden:

---

Du arbeitest am Projekt **MyDiaper**. Lies zuerst vollständig:
1. `AGENTS.md`
2. `docs/PRODUCT_SPEC.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATA_MODEL.md`
5. `docs/ROADMAP.md`
6. `README.md`

Prüfe danach die bestehende Codebasis, bevor du etwas änderst.

Wichtige Regeln:
- Die aktuelle App darf nicht unnötig neu geschrieben werden.
- Die Root-`index.html` muss als direkter Teststart erhalten bleiben.
- Der Code muss modular, wartbar und für späteren App-Store-/Play-Store-Ausbau geeignet bleiben.
- Keine großen Monolith-Dateien.
- Keine bestehenden Funktionen oder Designentscheidungen eigenmächtig entfernen.
- Mehrere Kinderprofile müssen bei jedem datenbezogenen Feature mitgedacht werden.
- Web-/Native-Funktionen hinter Services kapseln.
- Externe Preise/Händlerdaten niemals erfinden; Demo-Daten klar kennzeichnen.
- Nach jeder Änderung passende Checks/Tests ausführen und README/Docs anpassen, falls sich Setup oder Architektur ändert.

Aktuelle Designrichtung:
- Basis Konzept Nr. 8
- funktionale Details aus Konzept Nr. 3
- Navigation: Heute | Windeln | Angebote | Börse | Profil

Credits:
- Idee: Felix & Christoph
- Konzept, Aufbau & Code: Christoph · christoph-it

Arbeite bei neuen Features in kleinen, nachvollziehbaren Schritten. Wenn ein Feature eine Architekturentscheidung erfordert, dokumentiere die Entscheidung in `docs/DECISIONS.md`.

---

## Gute erste Codex-Aufgabe

> Analysiere die bestehende MyDiaper-v1-Codebasis anhand von AGENTS.md und den Dateien im docs-Ordner. Erstelle noch keine neue UI und führe keinen Framework-Rewrite durch. Refaktoriere zuerst die Datenmodelle für Kinderprofile, Windelsets, Vorrat und Fit-Check so, dass mehrere Kinder und mehrere aktive Windelarten pro Kind sauber unterstützt werden. Halte die bestehende Optik und Navigation unverändert. Ergänze Unit-Tests für Preis-pro-Windel, Reichweitenberechnung und Größen-/Fit-Regeln. Root-index.html und npm run build:web müssen danach weiterhin funktionieren.
