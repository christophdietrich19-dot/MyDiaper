# MyDiaper — Zielarchitektur

## 1. Ausgangslage
Der aktuelle Prototyp besteht aus:
- `index.html`
- `css/`
- `js/app.js`
- `js/data.js`
- `js/store.js`
- `js/features/*`
- PWA-Manifest/Service Worker
- Capacitor-Konfiguration
- `www/`-Build

Das ist für den Prototyp bewusst einfach und direkt startbar.

### Implementierter Refactoring-Schritt (11.09.2026)

```text
index.html (klassische Skripte)
  js/data.js                        Demo-Katalog
  js/domain/
    pricing.js                      Stückpreis, Preisvergleich
    sizes.js                        Gewichts-Richtwert
    fit-check.js                    Fit-Regeln, Ergebniscodes
    inventory.js                    Bestand, FIFO, Reichweite
    model.js                        Schema v2, Migration, Referenzprüfung
  js/storage/
    defaults.js                     ursprüngliche Demo als Migrationseingang
    local-state.js                  localStorage-Adapter, Transaktionen
  js/repositories/
    family-repository.js            kinder-/setgebundene Operationen
  js/store.js                       Zusammensetzen von Store und Repository
  js/ui/family-context.js            Set-Auswahl, UI-Projektion
  js/ui/visuals.js                   Symbole, Referenzgrafiken
  js/ui/offer-visuals.js              Angebotsdarstellung, Referenz-Demos
  js/features/*                     Bereichstemplates einschließlich Finder
  js/app.js                         Navigation, Formulare, Event-Handling
css/reference.css                   ausdrücklich beauftragte Bildvorlagen-Styles
assets/images/, assets/fonts/       lokale Rastergrafiken und Schriftdateien
tests/                              Domain-, Repository- und Starttests
docs/                               Spezifikation und Entscheidungen
www/                                generierter Web-/Capacitor-Build
```

Datenfluss: Formular mit festen Kind-/Set-IDs → Repository → Domain-Regeln → validierte Speichertransaktion → UI-Projektion → bestehendes Template. Accountbezogene Demo-Einstellungen, Börse und Chat verwenden weiterhin die lokale Store-Schnittstelle. Der spätere Zielbaum unten ist weiterhin eine Roadmap, nicht bereits implementierte Infrastruktur.

Der Finder hält nur flüchtige UI-Entwürfe pro Kind und ruft die bestehenden Größen-/Fit-Domain-Module auf; er schreibt keine Profilwerte implizit zurück. Visuelle Helfer und Templates dürfen die Eigentümerschaftsprüfung im Repository nicht umgehen. Die Referenz-Angebote sind deutlich markierte Demo-Datensätze, kein externer Anbieter. Details und Grenzen des Gestaltungsschritts: ADR-017 bis ADR-019 und `ASSETS.md`.

## 2. Architekturprinzip
Nicht neu schreiben, nur weil eine modernere Technik verfügbar ist. Schrittweise refaktorieren, sobald ein Feature echten Bedarf erzeugt.

Ziel:
- Domain-Logik unabhängig von UI
- externe Anbieter austauschbar
- lokale/offline und Cloud-Daten klar getrennt
- native APIs gekapselt
- Tests für kritische Regeln

## 3. Empfohlene spätere Struktur
```text
src/
  app/
    router/
    bootstrap/
  domain/
    children/
    diapers/
    inventory/
    fit-check/
    offers/
    marketplace/
    chat/
    notifications/
  features/
    today/
    diapers/
    offers/
    market/
    profile/
  ui/
    components/
    icons/
    tokens/
  services/
    auth/
    offers/
    geolocation/
    barcode/
    notifications/
    analytics/
  repositories/
    childRepository/
    inventoryRepository/
    offerRepository/
    listingRepository/
    chatRepository/
  storage/
    local/
    sync/
  platform/
    web/
    capacitor/
  config/
  i18n/
  tests/
```

## 4. Technologiepfad
### Jetzt
Modulares HTML/CSS/JS beibehalten und aufräumen.

### Nächster Reifeschritt
- TypeScript einführen
- Build/Bundling einführen
- automatisierte Tests
- Linting/Formatting

### UI-Framework
Optional React/Preact/Vue erst dann einführen, wenn die UI-Komplexität es rechtfertigt. Nicht als Selbstzweck.

### Wichtig: direkter `index.html`-Start
Der Entwicklungs-/Testworkflow soll weiterhin eine direkt startbare Root-Version bieten.

Wenn später TypeScript/Framework genutzt wird:
- Source unter `src/`
- Build erzeugt statische, relative Assets
- Root-`index.html` oder eine separate Test-Ausgabe lädt gebündelte JS/CSS-Dateien ohne serverabhängige Routen
- PWA/Service Worker funktionieren nur über HTTP(S), Kern-UI soll aber weiterhin als statischer Build öffnbar sein

## 5. Backend
Empfehlung: relationales Backend, bevorzugt Supabase/Postgres oder gleichwertig.

Warum relational:
- Elternkonto → mehrere Kinder
- Kind → mehrere Windelsets
- Produkt → Größen/Packungen/Barcodes
- Listings → User/Produkt/Chat
- Chat → Conversation/Messages
- Angebote → Händler/Produkte/Zeiträume

### Backend-Bausteine
- Auth
- PostgreSQL
- Realtime
- Object Storage
- serverseitige Funktionen
- Zugriffskontrolle pro Datensatz

## 6. Repository Pattern
Frontend kennt keine direkte Datenbank-SDK-Logik in UI-Komponenten.

Beispiel:
```text
ChildRepository
  listChildren()
  getChild(id)
  createChild(input)
  updateChild(id, patch)
  deleteChild(id)
```

Implementierungen:
- `LocalChildRepository`
- `CloudChildRepository`
- später `SyncedChildRepository`

So bleibt der Testmodus ohne Backend erhalten.

## 7. Offline-/Sync-Strategie
Local-first für:
- Profile
- Vorrat
- Fit-Checks
- Einstellungen

Cloud-authoritative bzw. online für:
- Börse
- Chat
- öffentliche Bewertungen
- Angebotsfeed

Synchronisation:
- UUIDs clientseitig erzeugen
- `created_at`, `updated_at`, optional `deleted_at`
- Konflikte bei simplen Einstellungen: latest-write-wins
- bei Inventar: operation-based oder serverseitige Transaktionen bevorzugen

## 8. Plattform-Abstraktion
Interfaces:
- `LocationService`
- `BarcodeScannerService`
- `PushNotificationService`
- `CameraService`
- `SecureStorageService`
- `ShareService`

Implementierungen:
- Web fallback
- Capacitor native

UI fragt nie direkt `navigator.geolocation` oder native Plugins an.

## 9. Angebotsarchitektur
```text
OfferProvider
  searchLocal(params)
  searchOnline(params)
  getOfferDetails(id)
```

Mehrere Provider möglich:
- DemoOfferProvider
- PartnerFeedProvider
- AffiliateProvider
- RetailerApiProvider

Normalisierung in ein internes `Offer`-Modell.

## 10. Empfehlungssystem
Keine KI als Voraussetzung.

### Stufe 1: deterministische Regelengine
- Hersteller-Gewichtsbereich
- aktuelles Gewicht
- vorherige Passformerfahrungen
- Fit-Check-Antworten
- Windelart/Nachtproblem

### Stufe 2: Personalisierung
- bekannte Produktpräferenzen
- Größenhistorie
- wiederkehrende Probleme

Jede Empfehlung erhält:
- Ergebnis
- Konfidenz/Richtwert-Kennzeichnung
- Gründe
- Hinweis, dass reale Passform individuell ist

## 11. Sicherheit
- Auth-Token nur sicher speichern
- keine Service-Role-Keys im Client
- Server prüft Besitzrechte
- Marketplace/Chat mit Rate Limits
- Uploads validieren
- Bilder serverseitig auf Typ/Größe begrenzen
- Moderationsstatus serverseitig
- Nutzerblockierung serverseitig durchsetzen

## 12. Tests
Priorität:
1. Größen-/Fit-Regeln
2. Preis-pro-Windel
3. Vorrats-/Reichweitenberechnung
4. Mehrkind-Isolation
5. Berechtigungen Marketplace/Chat
6. Sync-Konflikte

Testarten:
- Unit Tests
- Repository Integration Tests
- UI Smoke Tests
- später E2E für Onboarding, Listing, Chat

## 13. Build-/Release-Pipeline
Langfristig:
- lint
- tests
- web build
- PWA smoke test
- Capacitor sync
- Android build
- iOS build

Keine Store-Secrets im Repository.
