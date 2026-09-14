# MyDiaper – Testversion 1.1.2

**Idee: Felix & Christoph**  
**Konzept, Aufbau & Code: Christoph · christoph-it**

## Direkt starten
`index.html` doppelklicken. Die Kernfunktionen funktionieren ohne Build-Schritt direkt im Browser.

Für PWA-/Service-Worker-Funktionen die Dateien über einen lokalen Webserver oder Hosting öffnen, z. B.:

```bash
npx serve .
```

## Gestaltung nach der Bildvorlage (12.09.2026)

Die ausdrücklich gewünschte Bildvorlage bestimmt jetzt alle fünf Hauptbereiche, den **Windel-Finder** und die Dialoge: Mint/Blau/Lavendel, lokale Nunito-/Caveat-Schriften, weiche Karten, Baby-/Elefantenillustrationen und gezeichnete Navigationssymbole. Die schlafende Babyfigur trägt bewusst geschlechtsneutrale Salbei-/Cremefarben. Für **Windeln**, **Börse** und **Profil** lag keine eigene Bildschirmvorlage vor; sie wurden deshalb aus dem vorhandenen Designsystem konsistent weiterentwickelt. Die Navigation und bestehenden Funktionen bleiben erhalten.

Testversion 1.1.2 behebt die im Android-Fehlerprotokoll festgehaltenen Darstellungsprobleme: Das Babybild besitzt nun echte PNG-Transparenz und bleibt aus dem Textbereich, Profilkarten erzeugen auch auf schmalen Displays keinen horizontalen Überlauf, die Bottom-Navigation berücksichtigt Android-/iOS-Safe-Areas über Capacitor SystemBars und sämtliche Erinnerungsschalter verwenden dieselbe geometrisch zentrierte Toggle-Regel.

Kinder wechseln über das runde Profilbild auf der Startseite oder die Kinderchips unter Windeln. Jedes Kinderprofil besitzt eine frei wählbare, nicht geschlechtsgebundene Profilfarbe; sie steuert Avatar und Akzent der Heute-Karte. Der vierstufige Finder öffnet sich über den Schnellzugriff; er hält Eingaben getrennt pro Kind in der Sitzung. Die Altersauswahl ist bis vier Jahre detailliert, enthält für Nachtwindeln zusätzlich vier bis sechs Jahre und bleibt danach als individuelle Nutzung offen. Die Größe bleibt der bestehende Gewichts-Richtwert und der Fit-Check behält seine geprüften Regeln. Alter wird nur als Kontext erklärt, ausgewählte Prioritäten erzeugen konkrete Prüftipps. Gespeicherte Produkterfahrungen des ausgewählten Kindes und Sets werden berücksichtigt. Zusätzlich zeigt der Finder vergleichbare Größen aus dem strukturierten internen Testkatalog. Diese Katalogeigenschaften sind ausdrücklich Testdaten, keine Herstellerzusagen. Finder-Gewicht und Antworten ändern das gespeicherte Profil nicht automatisch.

Die Startseite zeigt tatsächlichen erfassten Verbrauch und Vorrat; die Bildtexte zu Trockenphasen oder einem angeblich gesunden Baby werden nicht als unbelegte Daten übernommen. Die Angebote enthalten eine **statische Berliner Beispielkarte**, die zwei Produkte aus der Vorlage und die bisherigen Demo-Angebote unter **Alle anzeigen / Liste**. Händlerpins, Suchfunktion, Favoriten, Preisalarme und Online-Umschaltung sind bedienbar. Der manuell eingegebene Standort bleibt erhalten; Karte, Entfernungen und Demo-Preise sind nicht live und werden nicht anhand dieses Orts berechnet. Zusätzlich lassen sich eigene, kontrollierte JSON-Angebotsquellen lokal einlesen. Jedes Angebot trägt Quelle und Aktualitätsstatus; das gleiche Provider-Modell kann später einen vertraglich zulässigen Händlerfeed aufnehmen.

Alle Schriften und Bilder liegen lokal und werden im PWA-Cache berücksichtigt. Herkunft, Generierungsprompts und Grenzen der Referenzgrafiken: `docs/ASSETS.md`. Kein Framework-Wechsel, kein neuer Paket- oder Build-Zwang.

## Enthalten
- Mehrere Kinderprofile mit schnellem Wechsel
- frei wählbare, nicht geschlechtsgebundene Profilfarben
- Finder-Altersstufen detailliert bis vier Jahre, nachts bis sechs Jahre und danach offen
- Kinderprofile archivieren, wiederherstellen und nach Bestätigung kaskadierend löschen
- Mehrere aktive Windelsets pro Kind mit eigenen Marken, Größen, Beständen und Verbräuchen
- Windelsets vollständig anlegen, bearbeiten, pausieren, priorisieren und löschen
- Allgemeiner Größen-Richtwert nach Gewicht
- Optionaler spezifischer Fit-Check
- Fit-Check-Historie und getrennte Speicherung persönlicher Erfahrungen pro Kind
- Erfahrungseditor für Passform, Auslaufschutz, Nachtleistung, Hautkomfort und Größenwirkung
- nachvollziehbares Finder-Ergebnis mit Prioritäten und der letzten passenden Produkterfahrung
- strukturierter interner Testkatalog mit stabilen Produkt-, Größen- und Packungs-IDs
- Produkt- und Größenverlauf pro Kind und Windelset
- Vorrat, Verbrauch und Reichweitenprognose
- einzelne Vorratsposten mit Datum und Notiz vollständig verwalten
- Lokale und Online-Angebote klar getrennt
- Preis-pro-Windel-Berechnung
- austauschbarer OfferProvider und kindbezogene lokale Preisalarme
- geprüfter lokaler JSON-Import für eigene Angebotsquellen
- versionierter Export und Wiederimport der lokalen Familiendaten
- strukturierte lokale Test-Windelbörse mit Suche, Lifecycle, Melden und Blockieren
- kontextbezogener lokaler Test-Chat
- Erinnerungs-Einstellungen einschließlich Schwellen, Intervall und Ruhezeit
- geprüfte EAN-/GTIN-Eingabe und lokale Produktkorrekturentwürfe
- echte Capability-Anzeige für vorbereitete native Gerätefunktionen
- Lokale Speicherung via `localStorage`
- PWA-Manifest + Service Worker
- vorbereitete Capacitor-Konfiguration für Android/iOS
- gebrandete MyDiaper-App-Icons und Splashscreens für PWA, Android und iOS

## Struktur
- `index.html` – direkter Einstieg
- `css/` – Basis-/Komponentenstyles und `reference.css` für die Bildvorlage
- `js/data.js` – Katalog-/Testdaten
- `js/catalog/` – klar gekennzeichnete strukturierte Produkt-Testdaten
- `js/store.js` – Initialisierung des lokalen Stores und Familien-Repositories
- `js/domain/` – unabhängige Regeln für Altersstufen, Katalog, Barcodes, Angebote, Börse, Reminder, Backup, Größen, Fit-Check, Personalisierung, Vorrat und Stückpreise; Modellmigration
- `js/storage/` – Demo-Ausgangsdaten, versionierte lokale Familien- und Angebotsimport-Speicherung
- `js/repositories/` – validierte Operationen für Kinder, Windelsets, Bestände, Erfahrungen, Börse, Korrekturentwürfe, Preisalarme und Angebotsimporte
- `js/services/offer-provider.js` – Provider-Vertrag und Normalisierung für austauschbare Angebotsquellen
- `js/platform/` – Browserdateien sowie Capability-Grenze für Web/Capacitor
- `js/ui/family-context.js` – Set-Auswahl und abgeleitete Werte für die bestehenden Templates
- `js/ui/visuals.js` – gemeinsame SVG-Symbole und Referenzgrafiken
- `js/ui/offer-visuals.js` – Angebotskarten und ausdrücklich gekennzeichnete Referenz-Demos
- `js/features/` – getrennte App-Bereiche
- `js/features/finder.js` – vierstufiger Finder, flüchtige Eingaben pro Kind
- `assets/images/`, `assets/fonts/` – lokale Illustrationen, Referenzdetails und lizenzierte Schriften
- `js/app.js` – Router, UI-Aktionen, Modals, zentrale Helfer
- `manifest.webmanifest` + `sw.js` – PWA-Grundlage
- `scripts/build-web.js` – erzeugt den sauberen `www/`-Web-Build für Capacitor
- `scripts/generate-brand-assets.ps1` – erzeugt unter Windows die Marken-Icons und Splashscreens reproduzierbar
- `capacitor.config.json` – spätere native Hülle
- `android/`, `ios/` – erzeugte und synchronisierte Capacitor-Plattformprojekte
- `tests/` – automatisierte Domain-, Repository- und Starttests
- `docs/` – Produktspezifikation, Datenmodell, Architektur und Entscheidungen

## Windelsets in der Testversion

Die Auswahl unter **Windeln → Aktives Set** bestimmt das jeweilige Set. Vorrat, „− 1 verbraucht“, Fit-Check, Verlauf und Produkterfahrung beziehen sich anschließend genau auf dieses Set. Die Auswahl bleibt pro Kind während der Sitzung erhalten; beim nächsten Start wird das Hauptset verwendet. Unter **Set bearbeiten** lassen sich Marke, Produktlinie, Größe, Gesamtbestand und Verbrauch anpassen. **Sets verwalten** deckt den kompletten lokalen Lifecycle ab; **Vorratsposten verwalten** bearbeitet einzelne Packungen getrennt.

Neue zusätzliche Windelarten starten mit Bestand und Verbrauch 0. Ohne Tagesverbrauch wird für einen positiven Bestand keine Resttage-Zahl geschätzt (Anzeige `–`). Entfernte Arten werden deaktiviert; ihre Bestände und Fit-Historie bleiben erhalten und erscheinen bei erneuter Aktivierung derselben Art wieder. Beim Entfernen des Hauptsets erfolgt keine automatische Übertragung seines Vorrats.

Persönliche Produkterfahrungen werden über **Windeln → Produkterfahrung** erfasst und bearbeitet. Der Verlauf zeigt Fit-Checks und Erfahrungen für das ausgewählte Set. Bewertungen müssen ganzzahlig zwischen 1 und 5 liegen; Größenwirkung und „Nicht erneut empfehlen“ werden validiert. Die Speicherung bleibt selbst dann an den beim Öffnen festgehaltenen Kind-/Set-Kontext gebunden, wenn sich der aktive UI-Kontext zwischenzeitlich ändert. API-Beispiele stehen in `docs/DATA_MODEL.md`.

Unter **Windeln → Interner Testkatalog** können passende Produktgrößen mit einem Set verknüpft werden. Marke, Linie und Größe werden gemeinsam übernommen; ein Produkt- oder Größenwechsel wird im setbezogenen Verlauf festgehalten. Freie persönliche Angaben bleiben weiterhin möglich und erhalten dann keine erfundene Katalog-ID.

## Eigene Angebotsdaten importieren

Unter **Angebote → Eigene Angebote importieren** kann eine JSON-Datei gewählt oder JSON-Text eingefügt werden. Der Import wird vollständig geprüft und separat unter `mydiaper-offer-imports-v1` gespeichert. Er verändert keine Kinder-, Vorrats- oder Fit-Daten. Ein erneuter Import mit demselben Anbieterschlüssel ersetzt atomar nur diese Quelle; andere eigene Quellen und die Demo bleiben erhalten.

Jeder Datensatz benötigt eine eindeutige externe ID, einen lokalen oder Online-Bereich, Händler, Preis und eine bereits bekannte `productPackageId`. So bleiben Stückzahl und Produktgröße eindeutig mit dem Katalog verbunden. Prüf- und Gültigkeitszeitpunkte werden nicht ergänzt oder als live behauptet. Quellen- und Angebotslinks akzeptieren ausschließlich HTTPS. Das vollständige Format samt Beispiel steht in `docs/OFFER_IMPORT.md`.

## Lokales Familien-Backup

Unter **Profil → Daten & Synchronisation** lässt sich der aktuelle lokale Familienstand als versioniertes JSON anzeigen und herunterladen. Ein Backup kann über Datei oder eingefügten Text wieder eingelesen werden. Vor der ausdrücklichen Bestätigung prüft die App Schema, Version, Produktreferenzen und alle Kind-/Set-Zuordnungen. Angebotsimporte besitzen bewusst einen eigenen Lebenszyklus und sind nicht Teil dieses Familien-Backups.

Das ist Datenportabilität und eine Vorbereitung für spätere Repository-Synchronisation – noch kein Konto, keine Cloud und kein Upload. Das Backup enthält private Kinder- und Familiendaten und sollte entsprechend geschützt aufbewahrt werden.

## Vorhandene Testdaten / Migration

Beim Öffnen am bisherigen Datei-/Web-Speicherort migriert die App `mydiaper-v1-state`, `mydiaper-v2-state` oder `mydiaper-v3-state` einmalig nach `mydiaper-v4-state`. Die vorherigen Schlüssel bleiben unverändert als Sicherung bestehen. Profil-, Einstellungs-, Anzeigen- und Chatdaten werden übernommen. Bekannte Kombinationen aus Marke, Linie und Größe werden mit dem Testkatalog verknüpft; freie Angaben bleiben unverändert. Der alte Gesamtvorrat und Tagesverbrauch werden ausschließlich dem Hauptset zugeordnet, weil die ursprüngliche Struktur keine Mengenverteilung auf weitere Arten enthielt.

Direktes Dateiöffnen und verschiedene HTTP-Adressen haben getrennte Browser-Speicher. Ein anderer Projektpfad/Origin übernimmt Daten daher nicht automatisch. Bei gesperrtem `localStorage` bleibt der Testmodus in der laufenden Sitzung nutzbar und zeigt einen Hinweis. Unlesbare/neuere Daten werden geschützt statt überschrieben. Bei Schreibfehlern wird die Änderung nicht bestätigt.

## Tests und Build

Node.js 22 oder neuer ist für den Test-/Build-Workflow empfohlen. Für Direktstart, Unit-Tests und Web-Build sind keine zusätzlichen Pakete zu installieren; die Capacitor-Pakete werden erst für den nativen Workflow benötigt.

```bash
npm test
npm run assets:brand
npm run build:web
npm run release:check
```

## Android-Testbuild

Die Android-Buildumgebung ist für den aktuellen Windows-Benutzer eingerichtet. Für die Entwicklung bleibt der Debug-Build verfügbar:

```bash
npm run android:build:debug
npm run android:check
```

Für die Weitergabe an einen kleinen, vertrauten Testerkreis wird stattdessen die gehärtete Release-Testversion verwendet:

```bash
npm run android:signing:init
npm run android:build:test-release
```

Der erste Befehl erzeugt genau einmal einen eigenen Release-Schlüssel unter `%LOCALAPPDATA%\MyDiaper\signing`. Das Kennwort liegt dort mit Windows DPAPI an den aktuellen Windows-Benutzer gebunden verschlüsselt. Schlüssel und Kennwortdatei werden nie in das Projekt oder Git geschrieben und müssen gemeinsam sicher gesichert werden; ohne denselben Schlüssel können spätere APKs keine installierte Release-Testversion aktualisieren. Der Build landet unter `artifacts/android/MyDiaper-Testversion-<Version>.apk` und wird anschließend mit `apksigner` geprüft.

Die Release-Testversion ist nicht debug-fähig, unterbindet Klartext-Netzwerkverkehr, schließt App-Daten aus Android-Backups aus und begrenzt den FileProvider auf interne App-Verzeichnisse. Die Weblogik und benötigten Bilder bleiben wie bei jeder Capacitor-App aus der APK extrahierbar; deshalb gehören niemals Secrets ins Frontend. Familiendaten liegen weiterhin lokal und nicht zusätzlich verschlüsselt im App-Speicher. Tester sollen bis zu einem produktiven Datenschutz-/Speicherkonzept nur Demo- oder pseudonymisierte Angaben verwenden.

Der Debug-Build verwendet künftig die getrennte Paketkennung `de.christophit.mydiaper.debug`. Eine bereits installierte ältere Debug-APK mit der bisherigen Paketkennung muss vor der ersten Release-Testinstallation entfernt werden. Für Google Play wird später statt der APK ein mit dem dauerhaft gesicherten Release-/Upload-Schlüssel signiertes Android App Bundle benötigt.

Die Tests prüfen Stückpreise, Versandkosten, Bestände, Reichweite, Altersstufen, frei wählbare Profilfarben, die unveränderten Größen-/Fit-Grundregeln, Migration, getrennte Kinder/Set-Daten, Historien und Speicherfehler. Starttests laden die tatsächlichen klassischen Skripte aus `index.html` in einer kleinen DOM-Testumgebung und prüfen alle fünf Bereiche sowie Formularziele nach Kinderwechsel. Sie ersetzen keinen vollständigen Geräte-/Browser-E2E-Test. `www/` ist generiert und wird durch `build:web` vollständig neu erzeugt; Änderungen erfolgen in den Root-Quelldateien.

Zusätzliche Tests prüfen den vierstufigen Finder ohne unbeabsichtigte Profiländerungen, kindgetrennte Entwürfe, Set-Zuordnung, persönliche Signale, Prioritätshinweise, Katalog- und Providerregeln, v1/v2/v3→v4-Migration, Kinder-/Set-/Vorrats-CRUD, Reminder, Barcodes, lokale Börsensicherheit, Produkt-/Größenverläufe, Preisalarme, kontrollierte Angebotsimporte, Backup-Rundläufe, Verwaltungsansichten und Offline-Assets.

`tests/mobile-ui-regressions.test.js` schützt zusätzlich die echte Alpha-Transparenz der Baby-PNG, die begrenzte Profilkarten-Geometrie, die SystemBars-/Safe-Area-Verkabelung und die zentralen Toggle-Maße.

## Saubere GitHub-Kopie

Für die Weitergabe an GitHub wird ein separater Ordner `Diaper-GitHub` neben dem Arbeitsprojekt erzeugt. Er enthält Quellcode, Dokumentation, Tests sowie die nativen Android-/iOS-Projektdateien, aber keine APKs, Signierschlüssel, `node_modules`, generierten Web-Builds oder lokalen Build-Caches. Details und Wiederherstellungsschritte stehen in `GITHUB_UPLOAD.md`. Wegen der noch ungeklärten Rechte an Referenz-, Produkt-, Händler- und Kartendarstellungen soll das Repository vorerst privat bleiben.

## Für eine echte Veröffentlichung später
Vor App Store / Google Play müssen u. a. Datenschutz/Impressum, Backend/Authentifizierung, Moderation für Marktplatz, echte Angebotsdaten, Push-Berechtigungen, Signierung und Store-spezifische Anforderungen ergänzt bzw. geprüft werden. Die vorhandenen Marken-Icons und Splashscreens benötigen vor Einreichung noch die finale Sichtprüfung auf echten Geräten.

Für Capacitor wird mit `npm run build:web` eine getrennte `www/`-Ausgabe erzeugt; dadurch bleibt die direkt startbare Root-Version sauber von den nativen Android/iOS-Projekten getrennt.

Die Architektur ist bewusst so gehalten, dass die Testversion direkt per `index.html` funktioniert, während native Funktionen später schrittweise über Capacitor/Plugins oder eine andere geeignete Hülle ergänzt werden können.
