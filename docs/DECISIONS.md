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

Die Startseite verwendet tatsächliche lokale Verbrauchs-/Vorratswerte. Die Vorlage begründet weder erfasste Trockenphasen noch Gesundheitszustände; diese Aussagen werden nicht erfunden. Die damalige statische Berliner Beispielkarte wurde in ADR-039 durch eine echte Kartenbasis mit weiterhin klaren Demo-Markern ersetzt.

Zwei Referenz-Demo-Angebote reproduzieren die Beispielpreise/Produkte der Vorlage. Die Gesamtliste enthält zusätzlich sämtliche bisherigen lokalen Demo-Angebote; Online-Angebote bleiben getrennt. Stückpreise und Sortierung verwenden das Pricing-Domain-Modul. Favoriten sind accountbezogene Einstellungen (`settings.favoriteOfferIds`), keine Kinddaten; das schemaerweiterbare Settings-Objekt benötigt dafür keine v3-Migration. Echte Händlerfeeds, Routing und Geocoding sind weiterhin nicht implementiert.

## ADR-020 — Referenzstil für die übrigen Hauptbereiche

Status: umgesetzt, 12.09.2026

Auf ausdrücklichen Folgeauftrag wurden auch **Windeln**, **Börse**, **Profil** und die Dialoge im bestehenden Referenzstil gestaltet. Für diese Ansichten lag keine eigene Bildschirmvorlage vor. Sie verwenden daher die bereits abgeleiteten Farben, Schriften, Radien, Liniensymbole, Illustrationen und Touch-Größen, ohne eine nicht belegbare Pixelidentität zu behaupten. Die fünfteilige Bottom-Navigation sowie sämtliche bisherigen Aktionen bleiben erhalten.

Die Gestaltung bleibt in `css/reference.css`; die Feature-Dateien enthalten semantische Templates statt neue globale Fachlogik. Emoji-Platzhalter der drei Bereiche wurden durch das bestehende SVG-Symbolsystem ersetzt. Der Börsenhinweis stellt weiterhin klar, dass noch keine öffentlichen Konten oder Zahlungen existieren.

## ADR-021 — Persönliche Produkterfahrung ist Kind- und Set-Daten

Status: umgesetzt, 12.09.2026

Der Erfahrungseditor erfasst Passform, Auslaufschutz, Nachtleistung, Hautkomfort, Größenwirkung, Ausschluss und eine kurze Notiz. Das Formular hält `childId`, `setId` und beim Bearbeiten die Erfahrungs-ID fest. Repository und Speichergrenze prüfen weiterhin die Eigentümerschaft. Bewertungen werden im neuen reinen Domain-Modul `personalization.js` validiert; fehlerhafte Eingaben verändern den bestätigten Speicherstand nicht. Es ist keine Schema-v3-Migration nötig, weil `productExperiences` und diese Felder bereits in Schema v2 vorgesehen waren.

Der Verlauf bleibt bewusst setbezogen: Er zeigt nur Fit-Checks und Erfahrungen des aktiven Kindes und ausgewählten Sets. Öffentliche Produktbewertungen oder die Zusammenführung zwischen Familien sind nicht Bestandteil der lokalen Testversion.

## ADR-022 — Erklärbare Personalisierung ohne erfundene Produktempfehlung

Status: umgesetzt, 12.09.2026

Der Finder kombiniert seine flüchtigen Angaben mit den bestehenden Größen- und Fit-Regeln. Die Größe bleibt ein Gewichts-Richtwert. Alter wird als Kontext erläutert, nicht als alleinige Größenregel. Gewählte Prioritäten erzeugen deterministische Prüftipps. Ausschließlich die letzte passende Erfahrung des ausgewählten Kindes und Sets erscheint als persönliches Signal; andere Kinder und Sets werden ausgeschlossen.

Ohne strukturierten Produktkatalog und belastbare Produktattribute wird kein fremdes Produkt als angeblich passend ausgegeben. Positive, neutrale und ausgeschlossene Erfahrungen werden klar getrennt, verändern aber die geprüfte Größenregel nicht. Das Ergebnis nennt seine Gründe und den Richtwert-Hinweis. Finder-Angaben schreiben weiterhin nicht automatisch ins Kinderprofil. Domain-, Repository- und UI-Tests decken Validierung, Isolation und Darstellung ab.

## ADR-023 — Lokales Schema v3 für Verlauf und Preisalarme

Status: umgesetzt, 12.09.2026

Produkt-/Größenverläufe und Preisalarme sind eigenständige Entitäten und werden nicht in Windelsets oder UI-Einstellungen versteckt. Deshalb erhöht sich das lokale Schema auf v3 und der bevorzugte Schlüssel auf `mydiaper-v3-state`. v1- und v2-Stände werden einmalig verlustfrei migriert; ihre bisherigen Speicherschlüssel werden nicht überschrieben. Bekannte Marke-/Linie-/Größe-Kombinationen erhalten eine Katalog-ID, unbekannte persönliche Angaben bleiben mit `productSizeId: null` erhalten.

`sizeHistory` ist immer an Kind und Set gebunden und speichert Vorher-/Nachher-Größe, Katalog-IDs sowie Produktsnapshots. Dadurch bleiben auch Produktwechsel bei gleicher Größe nachvollziehbar. `priceAlerts` sind in der Testversion einem Kind und einer exakten Katalog-Produktgröße zugeordnet. Repository und Speichergrenze prüfen Besitz, Katalogreferenz, Bereich und positive Preisgrenze atomar.

## ADR-024 — Strukturierter Testkatalog statt erfundener Herstellerdaten

Status: umgesetzt, 12.09.2026

Marken, Produkte, Größen und Packungen liegen getrennt in `js/catalog/demo-products.js` und besitzen stabile IDs. Der Datensatz ist ausdrücklich ein interner Testkatalog. Allgemeine Gewichtsbereiche stammen aus der bereits vorhandenen Größenregel und werden nicht als herstellerspezifische Zusage dargestellt. Barcodes bleiben `null`, solange keine geprüfte Quelle vorliegt.

`js/domain/catalog.js` validiert Referenzen und erzeugt Vergleichskandidaten deterministisch nach Größe, Set-Art, ausgewählten Prioritäten und persönlichen Erfahrungen. Ein persönlicher Ausschluss entfernt nur für dieses Kind den entsprechenden Kandidaten. Das aktive Set bleibt bevorzugt sichtbar. Die Übernahme eines Katalogprodukts aktualisiert Marke, Linie, Größe und Katalog-ID gemeinsam; freie manuelle Angaben bleiben weiterhin möglich.

## ADR-025 — OfferProvider-Grenze und ehrliche Aktualität

Status: umgesetzt, 12.09.2026

Angebots-Templates lesen nicht mehr direkt aus Roharrays. Ein OfferProvider liefert Datensätze an `js/domain/offers.js`; dort werden Quelle, lokaler/online Bereich, Katalogreferenzen, Packungsmenge, Preise, Versand sowie optionale Prüf- und Gültigkeitszeiten normalisiert. Der derzeit aktive statische Provider ist klar als Demo gekennzeichnet. Ein zukünftiger legaler Partner-/Affiliate-/Händlerfeed kann als weiterer Provider ergänzt werden, ohne UI oder Preislogik umzuschreiben.

Aktualität ist kein implizites Versprechen: Demo-Daten erscheinen als nicht live geprüft, fehlende Prüfzeitpunkte als unverifiziert und kontrollierte Imports je nach Alter als frisch, älter, veraltet oder abgelaufen. Preisalarme verwenden den ungerundeten Stückpreis und exakt dieselbe `productSizeId`; Rundung ist nur Darstellung. Ohne echten Feed und Push-Service lösen lokale Alarme keine Systembenachrichtigung aus.

## ADR-026 — Kontrollierter Angebotsimport als erster realer Provider-Eingang

Status: umgesetzt, 12.09.2026

Solange kein vertraglich zulässiger Händler-/Affiliatefeed feststeht, ist der erste echte Dateneingang ein bewusst vom Nutzer bereitgestellter JSON-Import. Er wird nicht als automatisch live behauptet. `js/domain/offers.js` validiert Formatversion, Quellschlüssel, eindeutige externe Angebots-IDs, Bereich, Händler, EUR-Preise, optionale HTTPS-Links, Zeiträume und die Referenz auf eine bekannte Katalogpackung. Freie Produkt-/Packungsdaten werden nicht stillschweigend angelegt.

Importierte Quellen liegen separat unter `mydiaper-offer-imports-v1`. Ein erneuter Import ersetzt atomar nur dieselbe Quelle. Beschädigte Importdaten bleiben unverändert, beeinflussen den Familienzustand nicht und können nur über eine ausdrücklich bestätigte Rücksetzfunktion entfernt werden. Der OfferService bezieht ImportProvider dynamisch ein; Suche, Sortierung, Aktualität und Preisalarme verwenden danach dieselbe Domain-Logik wie die Demo. Diese Lösung ist ein legal kontrollierbarer Eingangsweg, aber kein Ersatz für einen vereinbarten automatischen Datenfeed.

## ADR-027 — Versioniertes Familien-Backup vor Cloud-Accounts

Status: umgesetzt, 12.09.2026

Vor einer Backend- und Auth-Entscheidung erhält die lokale Testversion Datenportabilität über den Umschlag `mydiaper-family-backup` Version 1. Er enthält den vollständigen Familienzustand des aktuellen Schemas und einen Exportzeitpunkt. Beim Einlesen validiert die bestehende Modellgrenze sämtliche IDs, Eigentümerschaften, Produktreferenzen und Werte, bevor der Store den Zustand atomar ersetzt. Ein Browseradapter kapselt Datei-Lesen und -Download, damit UI und Domain keine direkten Plattformaufrufe vermischen. Ältere Schema-v1-bis-v4-Backups werden beim Import auf das jeweils aktuelle Schema migriert.

## ADR-028 — Schema v4 für vollständige lokale Verwaltung

Status: umgesetzt, 12.09.2026

Kinderarchivierung, einzelne Vorratsposten, Reminder-Konfiguration, lokale Börsensicherheit und Produktkorrekturentwürfe benötigen explizite Daten statt UI-Sonderfälle. Deshalb verwendet die App `schemaVersion: 4` und `mydiaper-v4-state`. v1, v2 und v3 werden einmalig migriert und nicht überschrieben. Archivieren ist der sichere Standard; endgültiges Löschen erfordert ein zuvor archiviertes Profil und entfernt abhängige Sets, Vorräte, Ereignisse, Checks, Erfahrungen, Verläufe und Preisalarme atomar.

## ADR-029 — CRUD bleibt an Repository- und Besitzgrenzen

Status: umgesetzt, 12.09.2026

Kinder, Windelsets und Vorratsposten werden über das Familien-Repository verwaltet. Das letzte aktive Kind und das letzte aktive Set können nicht entfernt werden. Ein Setwechsel überträgt keine Bestände. Einzelne Lose validieren ursprüngliche und verbleibende Stückzahl sowie Kind-/Set-Zugehörigkeit. Die UI hält bei jedem Dialog die ursprünglichen IDs fest; Navigation und visuelle Grundstruktur bleiben unverändert.

## ADR-030 — Börsen-Lifecycle vollständig lokal, nicht scheinproduktiv

Status: umgesetzt, 12.09.2026

`marketplace.js` und `marketplace-repository.js` kapseln Anzeigen, Suche, eigene Lifecycle-Aktionen, kontextbezogene Chats, lokale Meldungen und Blockierungen. Diese Funktionen erhöhen die Testbarkeit, behaupten aber keine öffentliche Moderation: Ohne Backend gibt es keine echten Identitäten, geräteübergreifende Inhalte, Moderationsqueue, Rate-Limits oder Löschdurchsetzung. Die Oberfläche und Dokumentation nennen diese Grenze ausdrücklich.

## ADR-031 — Keine erfundenen Barcodes oder Gerätefähigkeiten

Status: umgesetzt, 12.09.2026

EAN/GTIN werden inklusive Prüfziffer validiert und ausschließlich gegen vorhandene, geprüfte Packungscodes aufgelöst. Der Demokatalog behält `barcodeEan: null`; unbekannte Codes erzeugen höchstens einen lokalen Korrekturentwurf. `platform/capabilities.js` meldet echte Capacitor-/Plugin-Verfügbarkeit. Manuelle Eingabe bleibt der Web-Fallback, und nicht installierte Scanner-, Kamera-, Standort- oder Push-Funktionen werden nicht vorgetäuscht.

## ADR-032 — Backendfreie Release-Vorbereitung ist prüfbar, aber nicht Store-fertig

Status: umgesetzt, 12.09.2026

Accessibility-Basis, Capability-Status, Dateninventar, Metadatenentwurf, Betreiberfragebogen, Native-Anleitung und ein lokaler Release-Check werden jetzt versioniert. `npm run release:check` bestätigt die lokal prüfbaren Voraussetzungen und nennt externe Gates. `npm run release:check:store` schlägt absichtlich fehl, solange native Plattformprojekte, Betreiber-/Support-/Privacy-URLs, produktive Moderation, Kontolöschung, echte Datenquellen, Signierung und Store-Konten fehlen. Rechtstexte werden ohne Betreiberentscheidung nicht erfunden.

Angebotsimporte sind bewusst nicht Teil des Familien-Backups: private Langzeitdaten und austauschbare Feed-/Importdaten haben getrennte Lebenszyklen. Das Backup enthält sensible Kinder- und Familiendaten und wird weder hochgeladen noch als Kontosynchronisation bezeichnet. Eine spätere Cloud-Repository-Implementierung kann dieselbe validierte Importgrenze verwenden, benötigt aber weiterhin Authentifizierung, serverseitige Rechteprüfung, Konfliktmodell und Löschkonzept.

## ADR-033 — Gehärtete, dauerhaft signierte Android-Testverteilung

Status: umgesetzt, 14.09.2026

Die öffentlich leicht untersuchbare Debug-APK ist nicht das Verteilungsartefakt für Tester. `android:build:test-release` erzeugt deshalb einen echten Release-Build mit deaktivierter Debug-Fähigkeit, R8-/Ressourcen-Shrinking und einem eigenen RSA-4096-Schlüssel. Gradle erhält Pfad, Alias und Kennwörter ausschließlich über kurzlebige Umgebungsvariablen. Der Schlüssel und das mit Windows DPAPI verschlüsselte Kennwort liegen benutzergebunden unter `%LOCALAPPDATA%\MyDiaper\signing`, ausdrücklich außerhalb von Projekt und Git. Der Buildprozess prüft die fertige APK mit `apksigner`. Eine separate Debug-Paketkennung verhindert künftige Signaturkonflikte zwischen Entwicklungs- und Verteilungsbuilds.

Der Android-App-Speicher ist von Cloud-Backup und Geräteübertragung ausgeschlossen. Klartext-Netzwerkverkehr ist deaktiviert; der FileProvider gibt nicht mehr pauschal den gesamten externen Speicher frei. Diese Härtung ersetzt keine anwendungsseitige Verschlüsselung und macht Clientcode nicht geheim: Die Capacitor-Webressourcen bleiben extrahierbar. Secrets dürfen weiterhin ausschließlich in einem späteren Backend liegen. Bis zum produktiven Datenschutz-, Speicher- und Gerätekonzept sollen Tester Demo- oder pseudonymisierte Familiendaten verwenden.

Credits bleiben gemäß Produktvorgabe sichtbar. Nicht erforderliche persönliche Demoangaben wurden neutralisiert; die reale Paketkennung und die zur Laufzeit benötigte Bildreferenz sind naturgemäß im Artefakt sichtbar. Der Schlüssel muss separat gesichert werden, weil ohne ihn keine Update-APK über eine installierte Release-Testversion eingespielt werden kann. Ein Store-AAB, Storekonten und eine endgültige Upload-Key-Strategie bleiben eigene Release-Gates.

## ADR-034 — Profilfarben und Babyillustration bleiben geschlechtsneutral

Status: umgesetzt, 14.09.2026

Die schlafende Babyillustration wird in Salbei-/Mint- und Cremetönen statt geschlechtlich codiertem Blau dargestellt. Zusätzlich besitzt jedes Kinderprofil eine frei wählbare Farbe aus einer festen, barrierearm beschrifteten Palette. Die Farbe steuert Avatar und Akzent der Heute-Karte, kommuniziert aber nie allein einen Status. Das Geschlecht wird weiterhin nicht erhoben. Vorhandene Profilfarben bleiben bei Migration und Bearbeitung erhalten; ungültige Farbwerte weist das Repository zurück.

## ADR-035 — Alter ist Finder-Kontext, keine harte Nutzungsgrenze

Status: umgesetzt, 14.09.2026

`js/domain/age-bands.js` kapselt die Altersstufen und ihre Ableitung aus dem Geburtsdatum. Der Finder differenziert bis zum vierten Lebensjahr, bietet für Nachtwindeln zusätzlich vier bis sechs Jahre und danach eine offene Kategorie „6+ Jahre · individuell“. Das berücksichtigt längere Nacht- und individuelle Windelnutzung, ohne ältere Kinder auszuschließen. Die Altersangabe verändert weder gespeichertes Profil noch Größenempfehlung: Gewicht, Herstellerbereich und tatsächliche Passform bleiben dafür maßgeblich.

## ADR-037 — Schema v5 für Begrüßung, Vorratsorte und Windelwechsel

Status: umgesetzt, 14.09.2026

`schemaVersion: 5` und `mydiaper-v5-state` ergänzen eine bestätigte Begrüßungswahl, Lagerorte und Produktschnappschüsse an Vorratslosen sowie strukturierte Windelwechsel. Bestehende v1-bis-v4-Schlüssel werden nur gelesen und bleiben als Sicherung unverändert. Alte Verbrauchsereignisse erhalten `contents: unknown`, weil ihr Inhalt nicht nachträglich erfunden werden darf. Alte Vorräte erhalten den neutralen Lagerort „Zuhause“ und einen Schnappschuss ihres damaligen Sets. Das Wechselereignis speichert die tatsächlich berührten Lose, damit Rückgängig genau diese Bestände wiederherstellen kann; ein inzwischen gelöschtes Los wird ersatzweise als gekennzeichnetes Rückgängig-Los wieder angelegt.

## ADR-038 — Produktauswahl strukturiert, persönliche Eingabe weiterhin möglich

Status: umgesetzt, 14.09.2026

Vorrat und Windelsets verwenden denselben UI-Picker in der Reihenfolge Windelart, Marke, Produktlinie, Größe und optional Packung. Suche und Zweckfilter arbeiten auf dem internen Testkatalog. Eine manuelle Alternative bleibt erhalten, weil der Katalog weder vollständig noch als Herstellerdatenbank behauptet wird. Vorratslose speichern Katalog-IDs und einen damaligen Produktschnappschuss; spätere Änderungen am Set schreiben alte Lose nicht um. Der Testkatalog wurde um Rascals, Moltex, Naty, Huggies Little Swimmers und Molfix ergänzt. Namen und Größen dienen der Testauswahl, nicht als Live-Verfügbarkeits- oder Leistungsaussage.

## ADR-039 — Echte Kartenbasis, aber keine erfundene Händlersuche

Status: umgesetzt, 14.09.2026

`js/ui/offer-map.js` kapselt Leaflet 1.9.4 und OpenStreetMap-Kacheln. Leaflet wird lokal gebündelt; die Karte zeigt die vorgeschriebene OSM-Attribution. Händlerpins, Distanzen und Preise bleiben Demo-Daten, bis ein rechtlich und technisch geeigneter Angebots-/Filialdatenprovider feststeht. Standort wird ausschließlich nach ausdrücklichem Tippen einmalig über `js/platform/location.js` abgefragt. Die genauen Koordinaten bleiben flüchtig in der laufenden UI-Sitzung und werden weder in `localStorage` geschrieben noch im Hintergrund beobachtet. Ort/PLZ bleibt der speicherbare Fallback.

## ADR-040 — Mobile Dialog- und Zurück-Navigation ohne Navigationsumbau

Status: umgesetzt, 14.09.2026

Die bestehende Fünf-Bereich-Navigation bleibt unverändert. Modals sperren die darunterliegende Seite, enthalten ihren eigenen Scrollbereich, berücksichtigen Safe-Areas und fragen beim Schließen geänderter Formulare nach. Android-Zurück schließt zuerst einen Dialog, geht im Finder einen Schritt zurück, führt von Unterseiten zu Heute und beendet die App erst nach dem zweiten Druck innerhalb von zwei Sekunden. Der Erststart-Begrüßungsdialog kann nicht versehentlich per Zurück oder Hintergrundtippen geschlossen werden.

## ADR-041 — APK-spezifischer Seitenzoom und freiwillige Karteninteraktion

Status: umgesetzt, 14.09.2026

Nur die Android-WebView deaktiviert Seitenzoom und Zoom-Bedienelemente in `MainActivity`. Der direkte Browser-/PWA-Start behält Browser-Zoom und Bedienungshilfen. Leaflet verarbeitet seine Karten-Gesten unabhängig davon. Diese native Abweichung verhindert versehentliches Zoomen der App-Oberfläche, ohne den Webzugang oder die Kartenbedienung global einzuschränken.

## ADR-042 — Preisalarme und Erfahrungen bleiben getrennte persönliche Signale

Status: umgesetzt, 14.09.2026

Ein Preisalarm kann eine Stückpreisgrenze, eine Packungspreisgrenze für exakt eine bekannte `productPackageId` oder beide Werte enthalten. Die beiden Trefferbedingungen werden als Oder-Verknüpfung ausgewertet; Bereich, Kind und Produktgröße bleiben Pflichtgrenzen. Produkterfahrungen speichern Preis-Leistung und Wiederkauf getrennt von „nicht erneut empfehlen“. Dadurch wird eine Bewertung nicht stillschweigend als Kaufentscheidung interpretiert. Alle Werte bleiben lokal pro Kind und Windelset.

## ADR-036 — Mobile Darstellungsfehler werden an der Ursache und mit Regressionstests behoben

Status: umgesetzt, 14.09.2026

Die Fehler aus dem Android-Test von Version 1.1.1 werden in Version 1.1.2 ohne Navigations- oder Designwechsel korrigiert. Das Babyasset besitzt echte Alpha-Transparenz und wird kleiner außerhalb des Textbereichs positioniert. Der Profilkopf reserviert Illustration und Text zwei getrennte Grid-Spalten, damit der Elefant auch bei 320 Pixel Breite keine Beschreibung überdeckt. Profilkarten verwenden `minmax(0,1fr)` plus eine explizite zweispaltige Aktionsgruppe; innere Texte dürfen schrumpfen und überbreite Inhalte erzeugen keinen horizontalen Viewport.

Für Systemleisten verwendet Capacitor 8 ausdrücklich `SystemBars.insetsHandling = css`. Die injizierten `--safe-area-inset-*`-Werte werden mit CSS-`env()` als Web-/PWA-Fallback in gemeinsame App-Variablen überführt. Bottom-Navigation, Seitenabstand und Finder-Footer verwenden dieselben Werte. Die Toggle-Komponente besitzt feste Maße; ihr Punkt wird mit `top: 50%` und einer gemeinsamen Translation vertikal und horizontal zentriert. `mobile-ui-regressions.test.js` schützt Alpha-Kanal, Profilgeometrie, Insets-Verkabelung und Toggle-Maße vor Rückfällen.

## ADR-043 — Fehlerprotokoll 1.1.3 wird mit zentralen UI- und Release-Grenzen behoben

Status: umgesetzt, 15.09.2026

Die Korrekturversion 1.1.4 behandelt Dialogsperre, Versionsanzeige, Kartenpositionen und Toasts als gemeinsame Infrastruktur statt als einzelne Bildschirm-Sonderfälle. `js/ui/feedback.js` sperrt bei jedem Modal sowohl `html` als auch `body`, fixiert den Seitenstand und stellt ihn beim Schließen wieder her. Der Modalinhalt bleibt der einzige vertikale Scrollbereich. Dieselbe Komponente dedupliziert Meldungen anhand Typ und Text, startet bei Wiederholung nur ihre Anzeigedauer neu und begrenzt die sichtbare Menge auf drei unterschiedliche Hinweise.

`package.json` ist die fachliche Versionsquelle. `scripts/sync-version.js` erzeugt daraus `js/config/app-meta.js` und synchronisiert Capacitor-, PWA-, Android- und iOS-Buildmetadaten. Profilanzeige und Dokumenttitel lesen nur `appMeta`; der Android-Versioncode bleibt eine explizite, monoton steigende Zahl in derselben Paketkonfiguration.

Die Leaflet-Karte verwendet keine fest eingebauten Berliner Marker und keine berechneten Ersatzkoordinaten mehr. Die einmalig angefragte Geräteposition richtet ausschließlich die Karte aus. Ein Händler-/Angebotsmarker entsteht nur, wenn sein Provider gemeinsam einen gültigen Breiten- und Längengrad liefert; ein kontrollierter Import kann diese optionalen Felder enthalten. Marker und Liste referenzieren dieselbe Angebots-ID. Ohne echten Händlerfeed bleibt die Liste als Demo gekennzeichnet, wird aber nicht räumlich als vermeintlich real dargestellt.

## ADR-044 — Karten- und Dialogebenen werden technisch getrennt

Status: umgesetzt, 15.09.2026

Testversion 1.1.5 behebt die Überlagerung des Standortdialogs durch interne Leaflet-Ebenen. Der Kartencontainer erzeugt mit `isolation: isolate` und `z-index: 0` einen eigenen Stapelkontext. Die zentrale `modal-root`-Ebene liegt mit einem festen Wert oberhalb der höchsten gebündelten Leaflet-Ebene; Toasts bleiben wiederum oberhalb der Dialoge. Damit kann kein Marker, Kartensteuerelement oder Kartenpane visuell in einen Dialog hineinragen.

Die bestehende Scrollsperre wird um eine Interaktionssperre ergänzt: Solange ein Dialog geöffnet ist, erhält die App-Hülle `inert` und `aria-hidden`, während die Karte zusätzlich keine Pointer-Ereignisse annimmt. Beim Schließen werden zuvor vorhandene Attribute exakt wiederhergestellt. Der Dialog bleibt außerhalb der App-Hülle erreichbar, besitzt weiterhin seinen eigenen Scrollbereich und behält die bestehende Gestaltung und Navigation. Ein Regressionstest vergleicht die Dialogebene mit allen Leaflet-`z-index`-Werten und prüft Isolation, Pointer-Sperre sowie den Lebenszyklus der Hintergrundattribute.
