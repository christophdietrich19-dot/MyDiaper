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
  js/catalog/
    demo-products.js                strukturierte, klar markierte Produkt-Testdaten
  js/domain/
    catalog.js                      Katalogvalidierung und Produktvergleich
    offers.js                       Angebotsnormalisierung, Aktualität, Alarmvergleich
    activity.js                     Windelwechsel, Inhaltswerte und Tages-/Wochenaggregation
    pricing.js                      Stückpreis, Preisvergleich
    age-bands.js                    Alterskontext bis vier, nachts bis sechs, danach offen
    sizes.js                        Gewichts-Richtwert
    fit-check.js                    Fit-Regeln, Ergebniscodes
    personalization.js             validierte Erfahrungen, erklärbare Signale
    inventory.js                    Bestand, Lagerorte, FIFO, Rückgabe, Reichweite
    reminders.js                    validierte Schwellen und Ruhezeiten
    barcodes.js                     GTIN-Prüfung und Korrekturentwürfe
    marketplace.js                  lokale Listing-/Chat-/Safety-Regeln
    model.js                        Schema v5, Migration, Referenzprüfung
    backup.js                       versioniertes Familien-Backupformat
  js/storage/
    defaults.js                     ursprüngliche Demo als Migrationseingang
    local-state.js                  localStorage-Adapter, Transaktionen
    offer-imports.js                separater, geschützter Importspeicher
  js/repositories/
    family-repository.js            kinder-/setgebundene Operationen
    offer-repository.js             kindgebundene lokale Preisalarme
    offer-import-repository.js      geprüfte Angebotsquellen verwalten
    marketplace-repository.js       lokaler Börsen-Lifecycle und Safety-Aktionen
    catalog-correction-repository.js lokale Produktkorrekturentwürfe
  js/services/
    offer-provider.js               austauschbarer Angebotsprovider-Vertrag
  js/store.js                       Zusammensetzen von Store und Repository
  js/platform/browser-files.js      lokaler Dateiimport/-download im Web
  js/platform/capabilities.js       Web-/Capacitor-Fähigkeiten ohne Direktzugriffe im UI
  js/platform/location.js           einmalige Web-/Capacitor-Standortabfrage
  js/platform/navigation.js         Android-Zurück und kontrolliertes Beenden
  js/ui/family-context.js            Set-Auswahl, UI-Projektion
  js/ui/visuals.js                   Symbole, Referenzgrafiken
  js/ui/offer-visuals.js              Angebotsdarstellung, Referenz-Demos
  js/ui/product-fields.js            strukturierter Produktpicker mit manueller Alternative
  js/ui/offer-map.js                 Leaflet-/OpenStreetMap-Adapter und Demo-Marker
  js/features/*                     Bereichstemplates einschließlich Finder
  js/app.js                         Navigation, Formulare, Event-Handling
css/reference.css                   ausdrücklich beauftragte Bildvorlagen-Styles
assets/images/, assets/fonts/       lokale Rastergrafiken und Schriftdateien
tests/                              Domain-, Repository- und Starttests
docs/                               Spezifikation und Entscheidungen
www/                                generierter Web-/Capacitor-Build
```

Datenfluss Familie: Formular mit festen Kind-/Set-IDs → Repository → Domain-Regeln → validierte Speichertransaktion → UI-Projektion → bestehendes Template. Windelwechsel verwenden `activity.js`; `inventory.js` liefert die genaue FIFO-Losentnahme und die Information für eine verlustfreie Rückgabe. Datenfluss Angebote: Demo-Provider plus separat persistierte Import-Provider → Normalisierung gegen den Produktkatalog → Suche/Sortierung/Aktualitätsstatus → Angebots-UI; Preisalarme laufen getrennt über das lokale OfferRepository. Die Karte ist ein UI-Adapter: echte OSM-Kacheln, aber weiterhin ausdrücklich Demo-Marker. Standort und Android-Zurück werden ausschließlich über Plattformmodule aufgerufen. Datenportabilität: Familienzustand → versionierter Backup-Umschlag → Browser-Dateiadapter; beim Einlesen führt derselbe Modellvalidator vor dem atomaren Ersetzen sämtliche Besitz- und Referenzprüfungen aus. Die Börse bleibt ohne Backend eine rein lokale Demo.

Der Finder hält nur flüchtige UI-Entwürfe pro Kind und ruft Alters-, Größen-, Fit-, Personalisierungs- und Katalog-Domain-Module auf; er schreibt keine Profilwerte implizit zurück. Altersstufen werden aus dem Geburtsdatum abgeleitet oder im Finder gewählt, beeinflussen die Größenregel aber nicht. Der Erfahrungseditor schreibt über das Familien-Repository mit festen Kind-/Set-IDs. Produkt- und Größenwechsel erhalten einen setbezogenen Verlauf. Visuelle Helfer und Templates dürfen die Eigentümerschaftsprüfung im Repository nicht umgehen. Der aktive Provider liefert deutlich markierte Demo-Datensätze, keinen externen Live-Feed. Details und Grenzen: ADR-017 bis ADR-035 und `ASSETS.md`.

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

Die lokale Testversion besitzt seit 12.09.2026 ein versioniertes Familien-Backupformat. Es ist kein Sync-Protokoll, liefert aber einen geprüften Import-/Export-Rand und verhindert, dass eine spätere Cloud-Implementierung UI-Daten ungeprüft direkt in den Store schreibt. Angebotsimports bleiben davon getrennt, weil Feed-Daten einen anderen Lebenszyklus als private Familiendaten haben.

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

### Lokal umgesetzt (12.09.2026)

`js/services/offer-provider.js` stellt den synchronen Provider-Vertrag für die direkt startbare Testversion bereit. Der aktive statische Provider liefert ausschließlich gekennzeichnete Demo-Daten. `js/domain/offers.js` normalisiert Produkt-/Packungsreferenzen, Quelle, Bereich, Preise, Versand, Prüf- und Gültigkeitsdaten. Ein späterer Partnerfeed ersetzt oder ergänzt den Provider, ohne die Feature-Templates an seine Rohstruktur zu koppeln.

Die Aktualitätsanzeige ist bereits implementiert. Sie zeigt fehlende Prüfzeitpunkte ehrlich als unverifiziert bzw. Demo an und kann kontrollierte Importdaten als frisch, älter, veraltet oder abgelaufen kennzeichnen. Lokale Preisalarme vergleichen exakt dieselbe `productSizeId`; Stückpreisgrenzen verwenden den ungerundeten Wert, Packungspreisgrenzen zusätzlich exakt dieselbe `productPackageId`. Echte Push-Benachrichtigungen bleiben eine spätere Service-/Plattformaufgabe.

Eigene kontrollierte JSON-Quellen können inzwischen über UI oder Repository eingelesen werden. Domain-Regeln begrenzen Größe und Datensatzanzahl, erzwingen eindeutige Quell-/Angebots-IDs, bekannte Katalogpackungen, EUR und HTTPS für optionale Links. Ein separater localStorage-Adapter schützt beschädigte Importdaten und hält sie aus dem Familienzustand heraus. `createOfferService` fragt zusätzliche Provider dynamisch ab; ein Import ist dadurch sofort such- und preisvergleichbar, ohne das Feature-Template neu zu initialisieren.

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
