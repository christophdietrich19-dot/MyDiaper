# MyDiaper — Store Release Checklist

Stand: 12.09.2026. Store-Regeln ändern sich; vor Einreichung erneut gegen die aktuellen offiziellen Richtlinien prüfen. Die lokale Vorbereitung ist dokumentiert, die App ist damit noch nicht einreichungsfähig.

## 1. Positionierung
MyDiaper wird als App für Eltern/Betreuungspersonen positioniert, nicht als Kinder-App. Kinder sind Gegenstand privater Profile, aber nicht die Zielnutzer der App.

## 2. Datenschutz
Vor Release erforderlich:
- öffentliche Datenschutzerklärung
- innerhalb der App erreichbar
- Apple App Store Connect Privacy Angaben
- Google Play Data Safety Angaben
- Datenerhebung und Drittanbieter vollständig dokumentieren
- Datenminimierung
- sichere Übertragung

## 3. Kontolöschung
Wenn Accounts erstellt werden können:
- in der App leicht auffindbare Kontolöschung
- zugehörige personenbezogene Daten berücksichtigen
- Google Play zusätzlich externe Webmöglichkeit/URL für Löschanfrage
- bei Sign in with Apple Token-Widerruf berücksichtigen

## 4. Marketplace/Chat = User Generated Content
Vor Store-Release zwingend:
- Nutzungsbedingungen/Community-Regeln
- unangemessene Inhalte definieren/verbieten
- Listing melden
- Nutzer melden
- Nachricht melden, wenn sinnvoll
- Nutzer blockieren
- Moderationsprozess
- zeitnahe Reaktion auf Reports
- Support-/Kontaktmöglichkeit

Keine anonymen Zufallschats. Chat nur kontextbezogen zu Listings.

## 5. Review-Fähigkeit
Für Store Review:
- Backend erreichbar
- Demoaccount oder voll nutzbarer Demomodus, wenn Login nötig
- Testdaten/Beispiel-Listing
- Review Notes für nicht offensichtliche Features
- benötigte Test-Barcodes ggf. bereitstellen

## 6. Standort
- nur für konkrete Funktion anfragen
- Nutzen vorher erklären
- Ablehnung respektieren
- PLZ/Ort manuell als Alternative
- keine genaue Position öffentlich im Marketplace

## 7. Kamera/Foto
- Permission erst beim tatsächlichen Bedarf
- Zweck klar erklären
- nur Marketplace-/Barcode-relevante Nutzung

## 8. Push
- opt-in
- Kategorien steuerbar
- keine irreführenden Verkaufs-/Spam-Pushes

## 9. Altersbewertung
- korrekte Store-Fragebögen ausfüllen
- Marketplace/Chat beeinflussen möglicherweise Bewertung
- App nicht als „Kids Category“ positionieren, solange das Produkt für Eltern gedacht ist

## 10. Store-Inhalte
Benötigt:
- finaler App-Name
- Subtitle/Kurzbeschreibung
- vollständige Beschreibung
- Keywords, wo vorgesehen
- App Icon
- Screenshots für relevante Geräteklassen
- Support URL
- Privacy URL
- ggf. Marketing URL

## 11. Rechtlich/organisatorisch
Vor öffentlichem Release klären:
- Betreiber/Unternehmen
- Impressum
- Datenschutz/GDPR
- Nutzungsbedingungen
- Haftung/Marktplatzregeln
- Umgang mit Minderjährigen-/Kinderdaten
- Affiliate-Offenlegung
- Marken-/Namensprüfung „MyDiaper“

## 12. Technische Store-Checks
### Android
- aktuelles Target SDK: Für neue Apps/Updates verlangt Google Play ab 31.08.2026 Android 16 / API 36; unmittelbar vor dem Build erneut prüfen
- signiertes AAB
- adaptive Icons
- Play Integrity/Abuse-Schutz bei Bedarf
- Data Safety
- Account deletion URL

### iOS
- aktuelle Xcode/iOS SDK Anforderungen
- Signierung/Provisioning
- App Privacy
- Privacy Policy URL
- Account deletion in-app
- Sign in with Apple korrekt, falls eingesetzt

## 13. Quellen, vor Release erneut prüfen
- Apple App Review Guidelines
  https://developer.apple.com/app-store/review/guidelines/
- Apple App Privacy
  https://developer.apple.com/help/app-store-connect/reference/app-privacy/
- Apple Account Deletion
  https://developer.apple.com/support/offering-account-deletion-in-your-app
- Google Play User Data
  https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play Account Deletion
  https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play User Generated Content
  https://support.google.com/googleplay/android-developer/answer/9876937
- Google Play Data Safety
  https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Target API
  https://support.google.com/googleplay/android-developer/answer/11926878

## 14. Lokale Release-Unterlagen

- `PRIVACY_DATA_INVENTORY.md` — technische Dateninventur
- `STORE_METADATA_DRAFT.md` — beschreibende Store-Texte und Review Notes
- `OPERATOR_QUESTIONNAIRE.md` — fehlende Betreiber-/Finanz-/Rechtsentscheidungen
- `NATIVE_READINESS.md` — Capacitor-/Plattformablauf
- `MARKETPLACE_LOCAL_DEMO.md` — klare Abgrenzung zur produktiven UGC-Funktion

`npm run release:check` prüft diese lokalen Voraussetzungen. `npm run release:check:store` bleibt rot, bis die externen Gates tatsächlich erfüllt sind.
