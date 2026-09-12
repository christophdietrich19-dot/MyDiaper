# MyDiaper — Entwicklungsroadmap

## Phase 0 — aktueller Prototyp
Status: vorhanden

- direkte `index.html`
- modulare Feature-Dateien
- lokale Testdaten
- Mehrkind-Grundidee
- Windel-Finder/Fit-Check
- Vorrat
- lokale/online Angebote als Demo
- Börse/Chat als Demo
- PWA-Grundlage
- Capacitor-Vorbereitung

## Phase 1 — Prototyp stabilisieren
Ziel: sauberer lokaler MVP ohne Backend.

### Aufgaben
Bereits umgesetzt (11.–12.09.2026): normalisierte kinder-/setgebundene lokale Daten, v1/v2→v3-Migration, getrennte Domain-Regeln, Fit-/Erfahrungs-/Produkt-/Größenverlauf, bedienbarer Erfahrungseditor, persönliche Finder-Signale, strukturierter Testkatalog, Demo-OfferProvider, lokale Preisalarme, kontrollierter Angebotsimport, versioniertes Familien-Backup, durchgängige Referenzgestaltung und automatisierte Kern-/Isolationstests. Diese Schritte führen keinen Framework-Wechsel ein und schließen Phase 1 noch nicht vollständig ab.

- Datenmodelle vereinheitlichen
- Kinder anlegen/bearbeiten/löschen
- mehrere aktive Windelsets pro Kind
- Vorratsverwaltung vollständig CRUD-fähig
- Fit-Check-Regeln in eigene Domain-Datei auslagern
- Produktkatalog strukturieren — lokales Testmodell umgesetzt
- Demo-Angebotsprovider kapseln — umgesetzt
- Börsen-Demo strukturieren
- Settings/Reminder vollständig
- UI-Zustände: loading/empty/error
- Accessibility-Basis
- Tests für Kernberechnungen

### Definition of Done
- kein Feature hängt von globalen Zufallsdaten ab
- alle Daten pro Kind sauber getrennt
- Root-index weiterhin startbar
- Web-Build funktioniert

## Phase 2 — TypeScript/Build-Reife
- TypeScript schrittweise einführen
- Bundler/Buildsystem
- ESLint/Formatter
- Unit-Test-Framework
- Domain/Repository/Service-Schichten
- statischer direkt startbarer Test-Build beibehalten

## Phase 3 — Backend & Accounts
- Backend-Projekt
- Auth
- Account-Sync
- Datenbankmigrationen
- RLS/Berechtigungen
- Cloud-Repository-Implementierungen
- Offline-Sync
- Account löschen
- lokaler Export/Backup-Umschlag — umgesetzt; Cloud-Sync und Kontolöschung ausstehend

## Phase 4 — Produktdatenbank
- lokales, austauschbares Katalogmodell mit stabilen IDs — umgesetzt
- Produkt-/Größenverlauf pro Kind und Set — lokal umgesetzt
- Marken
- Produktlinien
- Größen
- Gewichtsbereiche
- Packungsgrößen
- EAN/Barcodes
- Adminpflege
- Korrektur-/Meldeworkflow

## Phase 5 — Angebote
- `OfferProvider`-Grundvertrag und Normalisierung — lokal umgesetzt
- kontrollierter manueller JSON-Import mit Herkunft/Aktualität — lokal umgesetzt
- erster legaler/vertraglich zulässiger Datenfeed
- lokale Händler
- Online-Händler
- Preis pro Windel — umgesetzt
- Versandkosten
- Gültigkeitszeitraum
- Favoriten — lokal umgesetzt
- Preisalarme — lokal umgesetzt, echte Feed-/Push-Auslösung ausstehend
- optionale Affiliate-Kennzeichnung

## Phase 6 — Native Funktionen
- Capacitor Android/iOS
- Standort mit Permission + PLZ-Fallback
- Barcode-Scanner
- Kamera für Listing-Bilder
- Push Notifications
- Secure Storage
- Deep Links

## Phase 7 — Marketplace produktiv
- echte Listings
- Listing-Fotos
- Suche/Filter
- Chat realtime
- blockieren
- melden
- Moderationsqueue
- Nutzungsbedingungen akzeptieren
- Abuse/Rate Limits
- Listing-Lifecycle

## Phase 8 — Personalisierung
- Erfahrungen pro Kind und Set — lokal umgesetzt
- erklärbare Prioritätshinweise und Berücksichtigung letzter Erfahrungen — lokal umgesetzt
- Produktpräferenzen — Testkatalog-Verknüpfung und Ausschlüsse umgesetzt; echte Herstellerdaten ausstehend
- Größenhistorie — pro Kind und Set lokal umgesetzt
- intelligenter Fit-Check
- individuellere Empfehlungen
- Familienübersicht

## Phase 9 — Store-Readiness
- Datenschutz
- Impressum
- Nutzungsbedingungen
- Marktplatzregeln
- Supportkontakt
- Kontolöschung
- App Privacy/Data Safety
- Store-Metadaten
- Icons/Splashscreens
- Screenshots
- Age Rating
- TestFlight
- Google Internal/Closed Testing
- Review-Demoaccount

## Phase 10 — nach Release
- Monitoring
- Crash Reporting
- Moderations-SLA
- Angebotsdatenqualität
- Feedback
- Analytics nur datensparsam/transparent
- neue Händler/Regionen
- weitere Sprachen
