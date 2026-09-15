# MyDiaper für GitHub

Der Ordner `Diaper-GitHub` ist die bereinigte, hochladbare Projektkopie. Er enthält den reproduzierbaren Quellstand der Testversion 1.1.4.

## Enthalten

- Root-Dateien wie `index.html`, `package.json`, `package-lock.json`, Manifest und Service Worker
- `assets/`, `css/`, `js/`, `scripts/`, `tests/` und `docs/`
- lokal gebündeltes Leaflet samt Drittanbieterhinweisen
- Capacitor-Projektquellen unter `android/` und `ios/`
- `.gitignore`, `AGENTS.md`, `README.md` und diese Anleitung

## Bewusst ausgeschlossen

- `node_modules/`
- generierte Verzeichnisse `www/` und `artifacts/`
- Android-/iOS-Builds und lokale Caches
- durch `npx cap sync` erzeugte Webkopien, Pluginlisten und native Konfigurationskopien
- `android/local.properties`
- Keystores, Zertifikate, Provisioning-Dateien und `.env`-Dateien
- `google-services.json` und `GoogleService-Info.plist`
- lokale IDE-, Betriebssystem- und Logdateien

Der dauerhaft benötigte Android-Release-Schlüssel liegt außerhalb des Projekts unter `%LOCALAPPDATA%\MyDiaper\signing` und darf niemals zu GitHub hochgeladen werden.

## Projekt nach dem Klonen prüfen

```bash
npm ci
npm test
npm run build:web
npx cap sync
```

Die Root-`index.html` bleibt auch ohne Build direkt als Testversion nutzbar. `npm ci` installiert zusätzlich die gepinnten Capacitor-App-/Geolocation-Plugins und Leaflet für reproduzierbare Native-Synchronisationen; die Web-App selbst verwendet die lokale Leaflet-Kopie unter `assets/vendor/`.

## Öffentlich oder privat?

Bis Rechte an der gelieferten Designreferenz sowie den darin sichtbaren Personen-, Händler-, Produkt- und Kartendarstellungen geklärt oder diese Assets ersetzt sind, sollte das Repository privat bleiben. Die technischen Quellen sind bereinigt, aber die erforderlichen Laufzeitassets sind weiterhin Bestandteil des Projekts.
