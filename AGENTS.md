# AGENTS.md — MyDiaper

## Projektziel
MyDiaper ist ein Windel-Assistent für Eltern und Betreuungspersonen. Die App soll langfristig als Web/PWA sowie als Android- und iOS-App funktionieren. Der aktuelle Stand ist eine direkt startbare Testversion mit `index.html` und modularer Vanilla-JS-Struktur.

## Verbindliche Produktentscheidungen
- Zielgruppe: Eltern/Betreuungspersonen; Nutzung ohne feste Altersgrenze, solange Windeln benötigt werden.
- Mehrere Kinderprofile pro Account sind Pflicht.
- Alle relevanten Windelarten sollen unterstützt werden: klassische Windeln, Pants, Nachtwindeln, Schwimmwindeln und später weitere Kategorien.
- Grundempfehlung automatisch; auf Wunsch detaillierter Fit-Check per Knopfdruck.
- Vorrat über Packungen und Einzelstücke erfassen; Verbrauch und Reichweite berechnen.
- Angebote lokal und online, klar getrennt.
- Börse: verkaufen, tauschen, verschenken; originalverschlossene und geöffnete Restbestände erlaubt, Zustand klar kennzeichnen.
- Community bewusst klein halten. Kein soziales Netzwerk.
- Mehrkind-Umschaltung spielerisch mit runden Avataren/Farben, aber keine fremden Marken-/Figurennamen übernehmen.
- Credits in der Testversion:
  - Idee: Felix & Christoph
  - Konzept, Aufbau & Code: Christoph · christoph-it
- Datenschutz und Impressum sind in der Testphase noch nicht Bestandteil; vor öffentlichem Release zwingend ergänzen.

## Designrichtung
- Visuelle Basis: Konzept Nr. 8.
- Funktionale/UI-Details: Konzept Nr. 3.
- Freundlich, modern, hochwertig, weich, nicht kindisch.
- Farbwelt: Mint, Babyblau, zartes Lavendel, Apricot, Creme/Weiß.
- Elefant als mögliche Markenfigur/Assistent; dezent einsetzen.
- Bottom-Navigation bleibt: `Heute | Windeln | Angebote | Börse | Profil`.

## Technische Leitlinien
- Sauber, modular, wartbar, erweiterbar.
- Keine großen Monolith-Dateien.
- Keine kurzfristigen Bastellösungen, wenn eine saubere Abstraktion sinnvoll ist.
- Bestehende Optik, Navigation oder Funktionen nicht eigenmächtig verändern.
- Direkter Teststart über Root-`index.html` muss erhalten bleiben.
- PWA-Funktionalität über Webserver/Hosting; Kernfunktionen sollen auch beim direkten Öffnen der `index.html` funktionieren.
- Native Store-Fähigkeit über Capacitor oder eine gleichwertige Hülle vorbereiten.
- Web-/Native-spezifische APIs hinter Services/Adaptern kapseln.
- Keine echten Händler-, Preis-, Standort- oder Produktdaten erfinden. Externe Daten nur über dokumentierte APIs/Feeds oder eindeutig als Demo-/Testdaten.
- Keine medizinischen Aussagen oder Diagnosen. Größenempfehlungen sind Richtwerte + Fit-Check.
- Nutzerstandort niemals voraussetzen; immer manuelle Ort/PLZ-Alternative vorsehen.

## Zielarchitektur
Kurzfristig darf die vorhandene modulare Vanilla-JS-Struktur weiterentwickelt werden. Für die produktive Store-Version soll die Codebasis schrittweise in eine stärker typisierte, testbare Struktur überführt werden. Ein möglicher Zielpfad ist TypeScript + Build-Pipeline + Capacitor, ohne den direkt startbaren Test-Build aufzugeben.

Empfohlene Schichten:
- `ui/` bzw. Feature-Komponenten
- `features/`
- `domain/` für Regeln/Modelle
- `services/` für Backend, Angebote, Standort, Push, Kamera/Barcode
- `repositories/` für Datenzugriff
- `platform/` für Web/Capacitor-spezifische Brücken
- `storage/` für lokal/offline
- `tests/`

## Backend-Zielbild
Bevorzugt relationales Backend, z. B. Supabase/Postgres oder gleichwertig:
- Auth
- Postgres-Datenbank
- Realtime für Chat/Marketplace-Status
- Storage für Profil-/Listing-Bilder
- Row Level Security bzw. vergleichbare Zugriffskontrolle
- serverseitige Funktionen für Benachrichtigungen, Moderation und Preis-/Angebotsimport

Nicht hart an einen Anbieter koppeln: Frontend spricht mit eigenen Repository-/Service-Schnittstellen.

## Sicherheits-/Privacy-Regeln
- Datenminimierung.
- Keine exakten Adressen öffentlich anzeigen.
- Standort optional; manuelle PLZ/Ort-Eingabe immer möglich.
- Kinderprofile nicht öffentlich sichtbar.
- Chat/Marktplatz nur mit Account.
- Öffentliche Börse benötigt Melden, Blockieren, Moderation und Nutzungsregeln.
- Tokens/Secrets niemals im Frontend oder Repository ablegen.
- Serverseitige Berechtigungen nicht nur im UI erzwingen.

## Arbeitsweise für Codex
- Vor Änderungen zuerst vorhandene Dateien und Architektur prüfen.
- Keine unnötigen Komplett-Rewrites.
- Änderungen möglichst klein, modular und nachvollziehbar halten.
- Bei größeren Features zuerst Datenfluss und Zuständigkeiten festlegen.
- Bestehende Funktionen nicht entfernen, außer die Aufgabe verlangt es ausdrücklich.
- Vollständige Dateien liefern; keine halben Patch-Snippets als Endergebnis.
- Nach Änderungen mindestens Syntax-/Build-/Smoke-Checks ausführen.
- Wenn Tests vorhanden sind, ausführen und Fehler beheben.
- README/Docs aktualisieren, wenn sich Architektur, Setup oder Verhalten ändert.

## Qualitätscheck vor Abschluss jeder Aufgabe
- Funktioniert Root-`index.html` weiterhin für den Testmodus?
- Funktioniert `npm run build:web` weiterhin?
- Bleiben Web und Capacitor sauber getrennt?
- Ist die neue Logik feature-/servicebasiert statt global verteilt?
- Wurde keine externe Datenquelle simuliert, ohne sie als Demo zu kennzeichnen?
- Sind Mehrkind-Profile berücksichtigt?
- Sind mobile Bedienbarkeit und Barrierefreiheit berücksichtigt?
- Sind neue Datenmodelle migrationsfähig?
