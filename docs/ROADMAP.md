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
Status: lokal abgeschlossen am 12.09.2026

Ziel: sauberer lokaler MVP ohne Backend.

### Aufgaben
Umgesetzt (11.–15.09.2026): normalisierte kinder-/setgebundene lokale Daten, v1/v2/v3/v4→v5-Migration, getrennte Domain-Regeln, vollständige lokale Kinder-/Set-/Vorratspostenverwaltung mit Lagerorten und Produktschnappschüssen, Windelwechsel samt Tages-/Wochenübersicht und Rückgängig, Fit-/Erfahrungs-/Produkt-/Größenverlauf, Begrüßungswahl, Finder-Signale, erweiterter strukturierter Testkatalog, EAN-Prüfung und lokale Korrekturentwürfe, Demo-OfferProvider, Stück-/Packungspreisalarme, Angebotsimport, Familien-Backup, konfigurierbare Reminder, strukturierte Börsen-Demo, Leaflet-/OSM-Karte ohne künstliche Händlerkoordinaten, einheitliche Dialog-/Toast-Steuerung einschließlich isolierter Karten-/Dialogebenen und gesperrter Hintergrundinteraktion, zentrale Versionssynchronisation, Accessibility-Basis, Referenzgestaltung und automatisierte Tests. Kein Framework-Wechsel.

- Datenmodelle vereinheitlichen
- Kinder anlegen/bearbeiten/archivieren/wiederherstellen/löschen — umgesetzt
- mehrere aktive Windelsets pro Kind
- Vorratsverwaltung vollständig CRUD-fähig — umgesetzt
- Fit-Check-Regeln in eigene Domain-Datei auslagern
- Produktkatalog strukturieren — lokales Testmodell umgesetzt
- Demo-Angebotsprovider kapseln — umgesetzt
- Börsen-Demo strukturieren — lokal umgesetzt; produktive Moderation bleibt Backend-Gate
- Settings/Reminder vollständig — lokal umgesetzt; echte Push-Zustellung bleibt nativ/Backend
- UI-Zustände: lokale Empty-/Fehlerzustände umgesetzt; Remote-Loading folgt mit echten Diensten
- Accessibility-Basis — umgesetzt, Geräteprüfung bleibt Release-Schritt
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
- EAN/Barcodes — Validierung/Lookup lokal umgesetzt; verifizierte Datenquelle offen
- Adminpflege
- Korrektur-/Meldeworkflow — lokaler Entwurf umgesetzt; Adminversand offen

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
- Preisalarme für Stückpreis und exakte Packung — lokal umgesetzt, echte Feed-/Push-Auslösung ausstehend
- optionale Affiliate-Kennzeichnung

## Phase 6 — Native Funktionen
- Capacitor-Konfiguration, Capability-Grenze, Skripte und Anleitung — umgesetzt
- Capacitor Android/iOS
- einmaliger Standort mit Permission + PLZ-Fallback — technisch umgesetzt, physischer Gerätetest ausstehend
- Barcode-Scanner
- Kamera für Listing-Bilder
- Push Notifications
- Secure Storage
- Deep Links

## Phase 7 — Marketplace produktiv
- lokaler CRUD-/Suche-/Chat-/Melde-/Blockier-Prototyp — umgesetzt
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
