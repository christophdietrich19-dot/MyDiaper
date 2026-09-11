# MyDiaper — Architecture / Product Decisions

## ADR-001 — Direkter index.html-Teststart bleibt erhalten
Status: beschlossen

Die Testversion muss ohne komplexe Entwicklungsumgebung über die Root-`index.html` nutzbar bleiben. PWA-/Service-Worker-Funktionen benötigen weiterhin HTTP(S).

## ADR-002 — Store-Fähigkeit über Hybrid-Hülle
Status: beschlossen

Die Webbasis soll so entwickelt werden, dass Android/iOS über Capacitor oder gleichwertig erstellt werden können. Native APIs werden gekapselt.

## ADR-003 — Mehrere Kinderprofile
Status: beschlossen

Alle relevanten Daten sind einem Kind oder bewusst dem Account zugeordnet. Features dürfen nicht implizit von nur einem Kind ausgehen.

## ADR-004 — Mehrere Windelsets pro Kind
Status: beschlossen

Ein Kind kann parallel Tageswindel, Pants, Nachtwindel, Schwimmwindel etc. verwenden.

## ADR-005 — Empfehlung ist Richtwert
Status: beschlossen

Herstellerdaten + Gewicht + Fit-Check + persönliche Erfahrung. Keine medizinischen oder garantierten Aussagen.

## ADR-006 — Angebote lokal und online getrennt
Status: beschlossen

UI und Datenmodell unterscheiden `local` und `online` klar.

## ADR-007 — Marketplace ohne integrierte Zahlung zum Start
Status: beschlossen

MyDiaper vermittelt Kontakte. Zahlung/Abholung wird zunächst außerhalb der App bzw. zwischen Nutzern geregelt.

## ADR-008 — Community bewusst begrenzt
Status: beschlossen

Kein Social Feed. Bewertungen/Erfahrungen, Listings und Listing-bezogener Chat reichen aus.

## ADR-009 — Demo-Daten statt erfundener Live-Daten
Status: beschlossen

Solange keine echte Datenquelle angeschlossen ist, werden Angebote/Produkte eindeutig als Test-/Demo-Daten behandelt.

## ADR-010 — Datenschutz/Impressum erst vor öffentlichem Release
Status: beschlossen

In der internen Testphase noch nicht umgesetzt. Vor Store-/öffentlichem Release zwingend.

## ADR-011 — Lokales Schema v2 mit getrennten Entitäten
Status: umgesetzt, 11.09.2026

`children` enthält nur Profildaten. `diaperSets` enthält Marke, Linie, Größe, Kategorie, Verbrauch und Hauptset-Markierung; jedes Set hat eine stabile ID und `childId`. `inventoryLots`, `fitChecks`, `productExperiences` und `usageEvents` sind separate Sammlungen. Bestände referenzieren verpflichtend sowohl `childId` als auch `setId`. Das Repository und die Speichergrenze prüfen, dass beide auf dasselbe Kind zeigen. Pro Kind existiert genau ein aktives Hauptset; mehrere aktive Sets derselben oder unterschiedlicher Kategorien sind möglich.

Die alten Felder `currentBrand`, `currentLine`, `currentSize`, `stock`, `dailyUse` und `types` werden nicht zusätzlich im Kind gespeichert. Eine kurzlebige UI-Projektion stellt diese Werte für die bisherigen Templates bereit. Das verhindert zwei konkurrierende Datenquellen bei möglichst kleinen UI-Anpassungen.

## ADR-012 — Einmalige Migration ohne Bestandsvervielfachung
Status: umgesetzt, 11.09.2026

Beim Start wird bevorzugt `mydiaper-v2-state` geladen. Wenn der Schlüssel fehlt, wird `mydiaper-v1-state` migriert. Der alte Schlüssel bleibt als unveränderte Sicherung erhalten. Schema v2 wird nicht nochmals migriert. Die Übernahme findet im Browser am bisherigen Speicherort/Origin statt; Datei- und HTTP-Origins teilen ihren Speicher nicht automatisch.

Jede bisherige Windelart wird zu einem eigenen Set. Das erste Set übernimmt den bisherigen Bestand und Tagesverbrauch. Weitere Sets übernehmen die bisher bekannten Produktangaben als editierbare Ausgangswerte, erhalten aber Bestand und Verbrauch 0: die alte Datenstruktur erlaubt keine belastbare Aufteilung. Bestehende Fit-Ergebnisse werden dem Hauptset zugeordnet. Damals nicht gespeicherte Antworten und Gewichtssnapshots bleiben `null`. Settings, Anzeigen und Chats bleiben erhalten.

Wird eine Windelart aus dem Profil entfernt, wird das Set deaktiviert. Bestände und Historie bleiben an seiner ID. Eine erneute Aktivierung derselben Bezeichnung reaktiviert die vorhandenen Sets. Beim Entfernen des Hauptsets wird ein anderes aktives Set Hauptset; dessen eigener Vorrat bleibt erhalten. Der bisherige Hauptbestand wird niemals stillschweigend übertragen. Ein leerer Artenwert behält wie zuvor eine normale Windel als Standardkategorie.

## ADR-013 — Domain-Module und Tests ohne Framework-/Build-Wechsel
Status: umgesetzt, 11.09.2026

`js/domain/` enthält reine Regeln für Stückpreis, Reichweite, Größenempfehlung und Fit-Check sowie Modellmigration und Konsistenzprüfungen. `js/repositories/family-repository.js` koordiniert fachliche Änderungen; `js/storage/local-state.js` kapselt Browserpersistenz. Es gibt keine UI- oder Browserabhängigkeiten in den Berechnungen.

Klassische, relativ geladene `defer`-Skripte bleiben erhalten; kein ESM-Import, Fetch zum Start oder Framework ist erforderlich. Die Domain-Module exportieren zusätzlich CommonJS für Node-Tests. `npm test` verwendet den integrierten Node-Testläufer ohne zusätzliche Pakete. `npm run build:web` kopiert dieselben Skripte nach `www/`; die native Capacitor-Konfiguration bleibt unverändert. Der Service-Worker-Cache wurde versioniert und um sämtliche neuen Laufzeitdateien ergänzt.

## ADR-014 — Bestandslose, Verbrauch und bewusst unveränderte Regeln
Status: umgesetzt, 11.09.2026

Jede Bestandserhöhung erzeugt ein Los. Verbrauch reduziert passende Lose in Erfassungsreihenfolge (FIFO); nur tatsächlich vorhandene Stücke werden abgebucht und als `usageEvents` protokolliert. Korrekturen ändern die Stückzahl, zählen aber nicht als beobachteter Verbrauch. Ganzzahlige, nichtnegative Stückzahlen sind Pflicht. Reichweite sind abgerundete volle Tage. Verbrauch 0 bei positivem Bestand bedeutet unbekannte Reichweite (`null`, Anzeige `–`), nicht eine erfundene Anzahl Resttage. Leerer Vorrat ergibt 0 Tage.

Die bisherigen Gewichtsbereiche, die Auswahl des unteren mittleren Treffers bei Überschneidungen und die v1-Fallbacks `0`/`8+` bleiben erhalten. Ebenso bleiben Fit-Punktwerte, Schwelle und Nachtregel erhalten. Dies ist eine technische Extraktion, keine fachliche Neubewertung des Empfehlungssystems. Ungültige Eingaben liefern keine scheinbar gültige Empfehlung oder werden zurückgewiesen. Stückpreise werden ungerundet berechnet; bekannte numerische Versandkosten können einfließen. Bestehende Versandhinweise in Textform werden nicht in Gebühren umgedeutet. Die vorhandene Angebotsauswahl/-Filterfunktion wurde fachlich nicht verändert.

## ADR-015 — Bestehende Oberfläche mit explizitem Set-Kontext
Status: umgesetzt, 11.09.2026

Navigation, CSS, Kartenlayout, Farben und Credits bleiben erhalten. Die bereits vorhandenen Karten „Aktive Windelarten“ sind nun mit Tastatur bedienbare Auswahlbuttons. Sie wählen das Set für Vorrat, Verbrauch und Fit-Check; die Auswahl wird pro Kind für die laufende Sitzung gehalten. Nach Neustart ist das Hauptset ausgewählt. Die Übersicht verwendet diese Auswahl, Profilbearbeitung und Größenangaben in den Kinderchips verwenden das Hauptset.

Der vorhandene Vorratsdialog zeigt Kind/Set und erlaubt Marke, Produktlinie und Größe des gewählten Sets zu bearbeiten. Keine neue Navigationsseite wird eingeführt. Geöffnete Fit-/Vorratsformulare speichern ihre `childId`/`setId` bei Öffnung. Ein nachträglicher Kinderwechsel kann das Speicherziel nicht ändern.

Fit-Checks sind eine Historie mit Antworten, Ergebniscode, Zeitpunkt, Gewichts- und Produktsnapshot. Das UI zeigt den letzten Check des ausgewählten Sets. Persönliche Produkterfahrungen sind unabhängig davon über `saveExperience`/`listExperiences` verfügbar und werden dauerhaft pro Kind gespeichert. Ein neuer Erfahrungseditor und personalisierte Empfehlungen sind ausdrücklich spätere UI-/Produktaufgaben. Produkt-IDs bleiben bis zum strukturierten Katalog optional; Snapshots bewahren die damalige Marke, Linie und Größe.

## ADR-016 — Atomare lokale Änderungen und geschützte Migration
Status: umgesetzt, 11.09.2026

`store.get()` liefert eine Kopie. Mutationen laufen auf einer Arbeitskopie, werden validiert und persistiert, bevor sie als aktueller Zustand bestätigt werden. Bei Speicher- oder Validierungsfehlern bleibt der vorherige Stand erhalten. Unlesbare oder neuere gespeicherte Schemas werden nicht mit Demo-Daten überschrieben: eine schreibgeschützte Demo informiert über das Problem. Das bestehende, explizit bestätigte Zurücksetzen kann den neuen Speicherstand zurücksetzen. Ist `localStorage` beim Direktstart nicht zugänglich, bleibt die App mit einem Hinweis im Sitzungsmodus bedienbar.

## ADR-017 — Ausdrücklich beauftragte Gestaltung nach Bildreferenz

Status: umgesetzt, 11.09.2026

Nach dem Datenrefactoring hat der Nutzer ausdrücklich die Gestaltung nach seiner Bildvorlage beauftragt. Dies ersetzt die visuelle Bestandsschutz-Aussage in ADR-015 ausschließlich für diesen Gestaltungsschritt. Navigation und Funktionen bleiben erhalten; kein Komplett-Rewrite oder Framework-Wechsel. Zielordner ist nach ausdrücklicher Bestätigung `Diaper`.

`css/reference.css` ergänzt die vorhandenen Styles. `js/ui/visuals.js` bündelt code-native Liniensymbole und Referenzgrafiken, `offer-visuals.js` die Angebotsdarstellung. Die bestehenden Features `today.js` und `offers.js` erhalten die entsprechenden Templates; es gibt keine doppelte Registrierung durch parallele alte/neue Features. Nicht abgebildete Verwaltungsseiten übernehmen die gemeinsamen Designwerte und bleiben funktional erhalten.

Rasterdetails der gelieferten Vorlage bleiben unverändert in einer lokalen Datei und werden über SVG-Viewports dargestellt. Baby und Elefant wurden mit dem eingebauten Bildwerkzeug als transparente, der Vorlage nachempfundene Illustrationen erzeugt. Lokale Schriftdateien verhindern externe Schriftanfragen. Herkunft, Prompts, Lizenzen und verbleibende Grenzen sind in `ASSETS.md` dokumentiert. Pixelidentität über unterschiedliche Geräte, Schrift-Rasterisierung und die perspektivischen Telefone der Vorlage wird nicht behauptet.

## ADR-018 — Finder als flüchtiger Ablauf, kein zweites Fachmodell

Status: umgesetzt, 11.09.2026

`features/finder.js` verwaltet einen vierstufigen UI-Entwurf pro `childId`. Größen- und Fit-Auswertung delegieren an die vorhandenen reinen Domain-Module. Kein dauerhaftes zweites Kinder-/Gewichtsmodell: Finder-Eingaben verändern weder Profil noch Bestand. Das ausgewählte Set wird auf Zugehörigkeit zum aktiven Kind geprüft. Der Ergebnisbutton öffnet bewusst den existierenden Fit-Dialog für dieses Set mit den gespeicherten Profilwerten; dies wird im UI erklärt. Der speicherbare Dialog hält Kind und Set weiterhin unveränderlich im Formular fest.

Alter und Präferenzen bleiben vorerst nur UI-Eingaben; sie sind keine implementierte Produkt-Personalisierung. Diese Grenze steht am Ergebnis und in der README. Vierstufiger Ablauf, Profil-Unveränderlichkeit und Kind-/Set-Isolation werden automatisiert getestet.

## ADR-019 — Bildtreue ohne erfundene Live-/Gesundheitsdaten

Status: umgesetzt, 11.09.2026

Die Startseite verwendet tatsächliche lokale Verbrauchs-/Vorratswerte. Die Vorlage begründet weder erfasste Trockenphasen noch Gesundheitszustände; diese Aussagen werden nicht erfunden. Der manuelle Standort bleibt unverändert. Die Berliner Karte ist ausdrücklich eine statische Beispielkarte, keine Standortermittlung oder echte Umgebungssuche.

Zwei Referenz-Demo-Angebote reproduzieren die Beispielpreise/Produkte der Vorlage. Die Gesamtliste enthält zusätzlich sämtliche bisherigen lokalen Demo-Angebote; Online-Angebote bleiben getrennt. Stückpreise und Sortierung verwenden das Pricing-Domain-Modul. Favoriten sind accountbezogene Einstellungen (`settings.favoriteOfferIds`), keine Kinddaten; das schemaerweiterbare Settings-Objekt benötigt dafür keine v3-Migration. Echte Händlerfeeds, Routing und Geocoding sind weiterhin nicht implementiert.
