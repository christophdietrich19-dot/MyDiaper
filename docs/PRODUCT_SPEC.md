# MyDiaper — Master Product Specification

Stand: 11.09.2026

## 1. Produktidee
MyDiaper soll Eltern und Betreuungspersonen dabei helfen, für jedes Kind die passende Windel zu finden, Vorräte im Blick zu behalten, günstige Angebote zu finden und übrig gebliebene Windeln sinnvoll weiterzugeben.

Kernversprechen:
**Welche Windel passt? Wie lange reicht mein Vorrat? Wo bekomme ich sie günstig? Was mache ich mit Restbeständen?**

Die App soll nicht nur ein Größenrechner sein, sondern ein alltagstauglicher Windel-Assistent.

## 2. Zielgruppe
- Eltern
- werdende Eltern
- Pflege-/Betreuungspersonen
- Familien mit einem oder mehreren Kindern
- keine feste Altersgrenze; nutzbar, solange Windeln benötigt werden

Die App richtet sich an Erwachsene, nicht an Kinder als Nutzer.

## 3. Marken-/Designrichtung
### Grundstil
- hochwertig, freundlich, modern
- weich und familiennah, aber nicht kitschig
- klare Karten und große Touch-Flächen
- mobile-first

### Farben
Empfohlene Design-Tokens:
- Mint: `#A9E6D3`
- Babyblau: `#AFCFF5`
- Lavendel: `#C9B8F4`
- Apricot: `#F6C39B`
- Creme: `#FFF9F3`
- Text dunkel: `#26343D`
- Sekundärtext: `#6B7B83`

Diese Werte sind Richtwerte und dürfen im Designsystem sauber abgestimmt werden.

### Markenfigur
Ein kleiner Elefant kann als MyDiaper-Assistent genutzt werden, z. B. bei Tipps, Statusmeldungen, Empty States und Onboarding. Er darf nicht dominieren.

## 4. Hauptnavigation
1. **Heute**
2. **Windeln**
3. **Angebote**
4. **Börse**
5. **Profil**

## 5. Onboarding
### Erststart
- kurzer Nutzen-Screen
- `Kind anlegen`
- optional `Erstmal ansehen` für Demo/Test

### Kinderprofil anlegen
Pflicht/Grunddaten:
- Name oder Spitzname
- Geburtsdatum
- Gewicht
- Körpergröße

Optional:
- Profilbild oder Avatar
- Geschlecht nur wenn wirklich benötigt; sonst weglassen
- aktuelle Windelmarke
- Produktlinie
- aktuelle Größe
- aktuell genutzte Windelarten

### Mehrere Kinder
- beliebig mehrere Profile
- schnelle Umschaltung über runde Avatare/Farben
- Familienübersicht über alle Kinder
- jedes Kind hat getrennte Vorräte, Empfehlungen, Favoriten, Fit-Checks und Erinnerungen

## 6. Bereich „Heute“
Ziel: wichtigste Informationen in Sekunden erfassen.

### Inhalt
- ausgewähltes Kind + schneller Geschwisterwechsel
- aktuelle Hauptempfehlung
- aktueller Vorrat und Resttage
- möglicher Größenwechsel
- beste aktuelle Preis-/Angebotsempfehlung
- wichtige Erinnerung
- Schnellzugriffe

### Beispiel
- `Größe 4 – aktuell wahrscheinlich passend`
- `Noch 38 Windeln – ca. 6 Tage`
- `Größe 5 könnte bald relevant werden`
- `Bestes Angebot: 0,18 € pro Windel`

### Familienmodus
Optionaler „Alle Kinder“-Modus:
- Kind A: Vorrat okay
- Kind B: Vorrat niedrig
- Kind C: Größencheck empfohlen

## 7. Bereich „Windeln“
### 7.1 Windel-Finder
Zwei Ebenen:

**Schnelle Empfehlung**
- basiert primär auf Gewicht
- berücksichtigt Hersteller-Größenbereiche
- Alter/Größe als Kontext
- Ergebnis nie als absolute Wahrheit darstellen

**Detaillierter Fit-Check**
Start per Button, z. B. `Sitz genauer prüfen`.

Fragen können enthalten:
- läuft die Windel häufig aus?
- gibt es rote Abdrücke?
- schließen die Klettverschlüsse nur knapp?
- hängt die Windel stark durch?
- wirkt sie zu groß?
- läuft sie nachts aus?
- verrutscht sie bei Bewegung?
- gibt es Probleme an Bauch/Beinen/Rücken?

Ergebnis:
- aktuelle Größe vermutlich passend
- größere Größe testen
- kleinere Größe testen
- andere Passform/Produktlinie testen
- nachts andere Windelart/Saugstärke erwägen

### 7.2 Mehrere aktive Windelsets je Kind
Ein Kind kann gleichzeitig nutzen:
- Tageswindel
- Pants
- Nachtwindel
- Schwimmwindel
- weitere Spezialkategorien später

Jedes Set hat eigene Marke, Größe und Vorrat.

### 7.3 Windelvergleich
Produktkarten mit:
- Marke
- Produktlinie
- Art
- Größe
- Hersteller-Gewichtsbereich
- Packungsgrößen
- Preis/Preis pro Stück, wenn verfügbar
- Fit-Erfahrungen
- Hautverträglichkeit als Nutzererfahrung, nicht medizinische Zusage
- Nachtgeeignet
- Saugkraft-Erfahrung

### 7.4 Persönliche Erfahrungen
Für ein Kind kann gespeichert werden:
- passt gut
- fällt eher klein/groß aus
- ausgelaufen
- Abdrücke
- nachts ungeeignet
- Lieblingsprodukt
- nicht erneut empfehlen

Diese Informationen fließen in zukünftige Empfehlungen ein.

## 8. Vorrat & Verbrauch
### Funktionen
- Packung hinzufügen
- Packungsgröße auswählen
- Einzelbestand korrigieren
- Barcode scannen
- mehrere Packungen/Produkte parallel
- täglicher Verbrauch
- Reichweitenprognose
- Nachkaufdatum

### Verbrauchsmodell
- initial manuell oder Standard-Schätzung
- lernt aus Bestand und protokollierter Nutzung
- keine falsche Genauigkeit vortäuschen

### Benachrichtigungen
- Vorrat niedrig
- nur noch X Tage
- gespeichertes Produkt im Angebot
- günstiger Kaufzeitpunkt

## 9. Angebote
Zwei strikt getrennte Tabs:

### 9.1 In deiner Nähe
- Standort nur nach Zustimmung
- alternative Eingabe: PLZ/Ort
- Liste + Karte
- Entfernung
- Händler
- Preis
- alter Preis/Rabatt, wenn verlässlich vorhanden
- Preis pro Windel
- Angebotszeitraum
- passende Größen standardmäßig priorisieren

### 9.2 Online
- Online-Händler
- Versandkosten berücksichtigen
- Preis pro Windel
- Lieferzeit, wenn Daten verfügbar
- Affiliate-Kennzeichnung, falls relevant

### 9.3 Favoriten & Preisalarm
- Marke/Produkt/Größe merken
- Preisgrenze setzen
- lokale/online Alarme separat

### 9.4 Datenquellen
- keine unerlaubten Scraper als Kernarchitektur
- Anbieter über `OfferProvider`-Adapter integrieren
- mögliche Quellen: offizielle Händlerfeeds, Affiliate-Netzwerke, Partner-APIs, manuell gepflegte Daten
- Demo-Daten klar als Demo markieren

## 10. Barcode-Scanner
Ziel:
Packung scannen → Produkt erkennen → Größe/Packungsinhalt anzeigen → Vorrat hinzufügen.

Fallback:
- unbekannter Barcode → manuell suchen/anlegen
- Nutzer kann falsche Zuordnung melden

Dafür benötigt die App eine zentrale Produkt-/Barcode-Datenbank.

## 11. Windelbörse
### Zweck
Übrig gebliebene Windeln verkaufen, tauschen oder verschenken.

### Listing-Typen
- Verkaufen
- Tauschen
- Verschenken

### Zustand
- original verschlossen
- geöffnet / Restbestand

Zusätzlich:
- Marke
- Produktlinie
- Windelart
- Größe
- Stückzahl
- Preis bzw. Tauschziel
- ungefähre Region
- optional Fotos
- Abholung/Versand

### Hygiene/Vertrauen
Zustand muss deutlich sichtbar sein. Geöffnete Restbestände dürfen nie wie Neuware dargestellt werden.

### Zahlung
Erste öffentliche Version: MyDiaper vermittelt nur Kontakt. Keine integrierte Zahlungsabwicklung.

## 12. Chat
- nur accountgebunden
- Chat entsteht aus einem konkreten Listing
- kein zufälliger/öffentlicher Chat
- Textnachrichten
- optional Listing-Vorschau im Chat
- Status wie gelesen optional
- Push bei neuer Nachricht
- Nutzer blockieren
- Nutzer/Nachricht melden
- Chat archivieren/löschen

Später optional:
- Bilder nur nach Moderations-/Sicherheitskonzept

## 13. Bewertungen & Community
Bewusst klein halten.

Erlaubt:
- Produktbewertung
- Passform-Erfahrung
- Auslaufschutz-Erfahrung
- Nachtgeeignet
- Preis-Leistung
- kurze sachliche Erfahrung

Nicht Ziel:
- öffentlicher Social Feed
- Follower-System
- Storys
- beliebige öffentliche Chats

## 14. Erinnerungen
Jede Kategorie separat schaltbar:
- Vorrat niedrig
- möglicher Größenwechsel
- Produkt im Angebot
- Preisalarm erreicht
- Marktplatznachricht
- Listing läuft ab
- optional individuelle Kauf-Erinnerung

Kein unnötiger Push-Spam.

## 15. Profil & Einstellungen
### Account
- Anzeigename
- E-Mail
- Loginmethoden
- Kontolöschung
- Geräte/Session-Verwaltung später

### Kinderprofile
- hinzufügen
- bearbeiten
- archivieren/löschen
- Reihenfolge/Farbe/Avatar

### Präferenzen
- Lieblingsgeschäfte
- bevorzugte Marken
- Angebote lokal/online
- Benachrichtigungen
- Standort
- Maßeinheiten/Land

### Rechtliches vor Store-Release
- Datenschutz
- Impressum
- Nutzungsbedingungen
- Marktplatz-/Community-Regeln
- Kontakt/Support

## 16. Accounts
### Testversion
- kein Zwangslogin
- lokale Speicherung

### Produktiv
Account nötig für:
- Cloud-Sync
- Börse
- Chat
- Bewertungen
- geräteübergreifende Einstellungen

Kernfunktionen wie Windel-Finder dürfen möglichst ohne Login nutzbar bleiben.

Login-Optionen später:
- E-Mail/Magic Link oder Passwort
- Sign in with Apple
- Google Sign-In

## 17. Offline-Fähigkeit
Offline verfügbar:
- Kinderprofile
- gespeicherte Produkte
- Vorrat
- letzte Empfehlungen
- Fit-Check
- lokale Einstellungen

Online erforderlich:
- neue Angebote
- Börse
- Chat
- Account-Sync
- Push-Token-Anmeldung

Nach Wiederverbindung sauber synchronisieren.

## 18. Datenschutzprinzipien
- so wenig Daten wie nötig
- Kinderprofile niemals öffentlich
- keine exakte Wohnadresse für Börse veröffentlichen
- Standort nur freiwillig
- PLZ/Ort als Alternative
- Geburtsdatum nur speichern, wenn für Funktion nötig; sonst abgeleitetes Alter erwägen
- keine Gesundheitsdiagnosen
- keine Datenweitergabe ohne transparente Grundlage
- Kontolöschung muss alle zugehörigen Daten berücksichtigen

## 19. Barrierefreiheit
- ausreichende Kontraste
- große Touch-Ziele
- Screenreader-Labels
- semantische Buttons/Formulare
- Textskalierung
- keine Funktion ausschließlich über Farbe kommunizieren
- Einhandbedienung berücksichtigen

## 20. Internationalisierung
Start: Deutsch.
Architektur von Anfang an i18n-fähig:
- UI-Texte nicht wild im Code verteilen
- Datums-/Preis-/Einheitenformatierung zentral
- später Englisch und weitere Sprachen möglich

## 21. Credits
In der Testversion sichtbar:

**Idee: Felix & Christoph**  
**Konzept, Aufbau & Code: Christoph · christoph-it**

Geeigneter Ort:
- Profil → Über MyDiaper
- optional kleiner Footer im Info-/About-Bereich

## 22. Nicht-Ziele für die erste produktive Version
- kein vollwertiges soziales Netzwerk
- keine integrierte Bezahlplattform
- keine medizinische Beratung
- keine automatische Bestellung ohne Nutzeraktion
- keine aggressiven Werbeformate

## 23. Erfolgskriterien
Die App ist erfolgreich, wenn ein Nutzer innerhalb weniger Sekunden beantworten kann:
1. Welche Windelgröße passt wahrscheinlich?
2. Sitzt die aktuelle Windel noch gut?
3. Wie lange reicht der Vorrat?
4. Wo gibt es passende Windeln günstig?
5. Was kann ich mit Restbeständen tun?
