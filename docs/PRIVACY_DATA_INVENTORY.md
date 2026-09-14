# Datenschutz-Dateninventar — Arbeitsstand

Stand: 14.09.2026. Dieses Dokument ist eine technische Bestandsaufnahme, keine fertige Datenschutzerklärung oder Rechtsberatung.

## Aktuelle lokale Testversion

| Datenbereich | Beispiele | Zweck | Speicherort | Übertragung |
| --- | --- | --- | --- | --- |
| Kinderprofile | Name/Spitzname, Geburtsdatum, Gewicht, Größe | persönliche Windelverwaltung | `localStorage` / lokaler App-Speicher | keine |
| Windelsets und Vorrat | Marke, Größe, Verbrauch, Packungen, Lagerort | Reichweite und Verlauf | lokal | keine |
| Windelwechsel | Zeitpunkt, nass/Stuhlgang/beides/trocken, optionale Notiz | Tages-/Wochenübersicht und Vorratsabzug | lokal | keine |
| Fit-Checks und Erfahrungen | Antworten, Bewertungen, Wiederkauf, Notizen | persönliche Empfehlungen | lokal | keine |
| Standortangabe | manuell gewählter Ort/PLZ; optional einmalige Geräteposition | Angebotskarte ausrichten | Ort/PLZ lokal; genaue Position nur flüchtig | OSM-Kachelabfrage; keine Übermittlung an MyDiaper-Backend |
| Angebote/Favoriten | Demo-/Importdaten, Preisgrenzen | Vergleich und Alarm-Vorbereitung | lokal | nur nutzerinitiierter Dateiimport |
| Börse/Chat | lokale Demo-Anzeigen und Nachrichten | Funktionsprototyp | lokal | keine |
| Backups | vollständiger Familienzustand | Export/Wiederherstellung | nutzergewählte Datei | nur nutzerinitiiert |

Die gehärtete Android-Release-Testversion deaktiviert Android-Backups und Geräteübertragung für den App-Speicher, verbietet Klartext-Netzwerkverkehr und ist nicht debug-fähig. Die lokalen WebView-Daten sind dennoch nicht anwendungsseitig verschlüsselt. Für interne Tests werden deshalb weiterhin Demo- oder pseudonymisierte Angaben empfohlen. Exportierte Familien-Backups liegen außerhalb dieses Schutzes und müssen vom Nutzer sicher verwahrt werden.

## Aktuell nicht vorhanden

- Konto, Login oder Cloud-Synchronisation
- Server-Analytics, Werbung oder Tracking
- dauerhafte Speicherung des exakten Standorts oder Hintergrundortung
- Foto-/Kameraupload
- echte Push-Registrierung
- öffentliche Listings, Zahlungen oder Realtime-Chat

## Bei späteren Integrationen neu bewerten

Für jedes SDK und jeden Dienst sind Verantwortlicher, Zweck, Datenkategorien, Empfänger, Rechtsgrundlage/Einwilligung, Speicherfrist, Löschweg, Übertragungsländer, Verschlüsselung und Auftragsverarbeitung zu dokumentieren. Die Store-Angaben müssen die tatsächliche Binärdatei einschließlich Drittanbieter-SDKs abbilden.

Google verlangt auch bei Apps ohne Datenerhebung eine ausgefüllte Data-Safety-Erklärung und eine öffentlich erreichbare Datenschutzerklärung. Apple verlangt eine Privacy-Policy-URL und vollständige App-Privacy-Angaben. Quellen: https://support.google.com/googleplay/android-developer/answer/10787469 und https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
