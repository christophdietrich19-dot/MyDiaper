# Windel-Börse — lokale Demo

Die Börse bildet den vollständigen lokalen UI-/Domain-Lifecycle ab, ist aber ausdrücklich kein produktiver Marketplace.

## Lokal umgesetzt

- Anzeigen erstellen, bearbeiten, suchen, filtern, reservieren/reaktivieren und löschen
- Zustand, Stückzahl, Preis/Tauschwunsch, Region sowie Abholung/Versand
- kontextbezogene lokale Chats
- Anzeigen lokal melden
- Kontakte blockieren und wieder freigeben
- getrennte Listen für eigene Anzeigen und sichtbare Demo-Anzeigen
- atomare Validierung und eigene Repository-Schicht

## Warum das noch kein produktiver Marketplace ist

Ohne Backend existieren keine echten Identitäten, keine geräteübergreifenden Listings, kein Realtime-Chat, keine serverseitige Moderationsqueue, keine Abuse-/Rate-Limits und keine belastbare Kontolöschung. Lokale Meldungen werden nicht an einen Betreiber gesendet.

Für öffentliche User Generated Content verlangen Apple und Google unter anderem Regeln, Reporting, Blockierung und laufende wirksame Moderation. Google verlangt außerdem die Akzeptanz von Nutzungsregeln vor dem Upload. Quellen: https://developer.apple.com/app-store/review/guidelines/ (1.2) und https://support.google.com/googleplay/android-developer/answer/9876937
