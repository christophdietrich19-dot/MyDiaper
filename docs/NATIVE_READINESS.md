# Native Vorbereitung

Stand: 14.09.2026

Die Web-App bleibt direkt über `index.html` nutzbar. Zusätzlich ist sie für eine Capacitor-Hülle vorbereitet. `capacitor.config.json` verwendet `de.christophit.mydiaper`, `MyDiaper Testversion 1.1.3` und `www` als Web-Ausgabe.

## Vorhanden

- Build und Sync-Skripte für Android und iOS
- zentrale Capability-Erkennung in `js/platform/capabilities.js`
- manueller Barcode-Fallback sowie einmalige Standortabfrage mit Ort-/PLZ-Fallback
- `@capacitor/app` für Android-Zurück und `@capacitor/geolocation` für die ausdrücklich ausgelöste Standortabfrage
- Leaflet/OSM-Karte; Kartenbasis echt, Händlerpins und Angebote weiterhin Demo
- Android-Seitenzoom nur in der nativen WebView deaktiviert; Browser-Zoom und Karten-Gesten bleiben erhalten
- Berechtigungsprinzip: erst erklären, dann bei konkreter Nutzung anfragen
- lokaler Release-Check mit `npm run release:check`
- erzeugte und synchronisierte Plattformprojekte in `android/` und `ios/`
- reproduzierbar gepinnte Capacitor-Versionen in `package.json` und `package-lock.json`
- gebrandete PWA-, Android- und iOS-App-Icons sowie Splashscreens aus dem vorhandenen Elefantenmotiv

## Aktueller Prüfstand

- `npx cap sync` synchronisiert die Web-Ausgabe erfolgreich in beide Plattformprojekte.
- JDK 21 (Temurin 21.0.12.1), Android Platform Tools, API 36 sowie Build Tools 36 sind benutzerbezogen installiert; `JAVA_HOME`, `ANDROID_HOME` und `ANDROID_SDK_ROOT` sind gesetzt.
- `gradlew.bat --no-daemon assembleDebug` erzeugt die Debug-APK erfolgreich.
- `gradlew.bat --no-daemon testDebugUnitTest lintDebug` läuft erfolgreich; der App-Lint meldet keine neuen Probleme.
- Die APK wurde mit `apksigner` geprüft, ist mit dem Android-Debugzertifikat signiert und enthält die erwarteten MyDiaper-Webressourcen.
- `npm run android:build:test-release` erzeugt zusätzlich eine gehärtete, R8-optimierte und dauerhaft signierte APK für den vertrauten Testerkreis. Der erfolgreiche Build vom 14.09.2026 ist nicht debug-fähig, schließt App-Daten aus Backups/Geräteübertragung aus, verbietet Klartextverkehr und wurde mit APK Signature Scheme v2/v3 verifiziert.
- Signierzertifikat der Release-Testlinie: `CN=MyDiaper Release, O=MyDiaper, C=DE`; SHA-256 `113e17d0288ddd598eb4191813b42ff5f816bb9c17bb8e3e88ed42764b072ae6`.
- Paketname: `de.christophit.mydiaper`; `minSdk 24`, `compileSdk 36`, `targetSdk 36`.
- Der Capacitor-Doctor bewertet die Android-Projektstruktur als einsatzbereit.
- Das iOS-Projekt ist erzeugt; ein signierter iOS-Build ist unter Windows nicht möglich und muss auf macOS mit Xcode geprüft werden.

Nach einer frischen Installation:

```bash
npm run cap:sync
npm run cap:doctor
npm run android:build:debug
npm run android:check
npm run android:signing:init
npm run android:build:test-release
```

`android:signing:init` ist idempotent und überschreibt keinen vorhandenen Schlüssel. Schlüssel, Metadaten und das Windows-benutzergebunden verschlüsselte Kennwort liegen unter `%LOCALAPPDATA%\MyDiaper\signing`, nicht im Projekt. Dieser Ordner muss getrennt und sicher gesichert werden. Das Release-Skript gibt zusätzlich eine SHA-256-Prüfsummendatei neben der APK aus.

Android kann anschließend über Android Studio geöffnet werden. Ein iOS-Build benötigt macOS, Xcode, ein Apple-Entwicklerkonto und gültige Signierung.

## Noch nicht als fertig ausgeben

- Geolocation und Android-App-Navigation sind technisch integriert, benötigen aber noch die Prüfung auf einem physischen Gerät. Scanner, Kamera, Push und Share benötigen weiterhin ausgewählte Capacitor-Plugins, native Berechtigungsbeschreibungen und Gerätetests.
- Weder die Debug-APK noch die interne Release-Test-APK sind Store-Artefakte. Für eine Veröffentlichung werden weiterhin ein signiertes AAB, die endgültige Upload-Key-/Play-App-Signing-Strategie und die Prüfung in der tatsächlichen Release-Umgebung benötigt.
- Der aktuelle Build wurde noch nicht auf einem physischen Android-Gerät oder Emulator ausgeführt.
- Signierung, Bundle-/Package-Registrierung und Store-Zertifikate hängen von den Store-Konten ab.

Die Oberfläche zeigt den echten Capability-Status und behauptet keine Gerätefunktion, die nicht installiert ist.
