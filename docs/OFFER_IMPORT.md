# MyDiaper — kontrollierter Angebotsimport

Stand: 12.09.2026. Dieses Format ist für lokale, vom Nutzer kontrollierte Test- und Importdaten bestimmt. Es bestätigt weder Preis noch Händlerquelle automatisch als live oder vertraglich freigegeben.

## Importweg

In der App: **Angebote → Eigene Angebote importieren**. Eine `.json`-Datei kann ausgewählt oder ihr Inhalt in das Textfeld eingefügt werden. Die Datei wird lokal im Browser gelesen und nicht hochgeladen.

## Format Version 1

```json
{
  "format": "mydiaper-offers",
  "version": 1,
  "provider": {
    "key": "mein-markt",
    "label": "Mein kontrollierter Import"
  },
  "offers": [
    {
      "externalId": "angebot-001",
      "scope": "local",
      "store": "Händlername",
      "city": "Hoyerswerda",
      "distance": 1.8,
      "productPackageId": "package-pampers-babydry-4-74",
      "price": 14.49,
      "oldPrice": 19.99,
      "currency": "EUR",
      "verifiedAt": "2026-09-12T10:00:00Z",
      "validFrom": "2026-09-12T00:00:00Z",
      "validUntil": "2026-09-19T23:59:59Z",
      "sourceUrl": "https://example.org/quelle/angebot-001"
    }
  ]
}
```

Alle Werte im Beispiel müssen vor einem echten Import gegen die tatsächliche Quelle geprüft werden.

## Pflichtfelder

- `format`: exakt `mydiaper-offers`
- `version`: aktuell `1`
- `provider.key`: 3–40 Kleinbuchstaben, Zahlen oder Bindestriche; wird intern mit `import-` präfixiert
- `provider.label`: sichtbarer Quellenname
- `offers`: mindestens ein, höchstens 250 Angebote
- `externalId`: innerhalb der Quelle eindeutig
- `scope`: `local` oder `online`
- `store`: Händlername
- `productPackageId`: vorhandene Packungs-ID aus `js/catalog/demo-products.js`
- `price`: nichtnegativer numerischer Preis

## Optionale Felder

- `storeName`, `city`, `distance`
- `oldPrice`
- `shippingPrice`, `shipping`
- `productSizeId`: wird geprüft, wenn zusätzlich angegeben
- `verifiedAt`, `validFrom`, `validUntil`: ISO-8601; das Ende darf nicht vor dem Start liegen
- `sourceUrl`, `url`: ausschließlich HTTPS
- `currency`: derzeit nur `EUR`

Fehlende Prüfzeitpunkte bleiben sichtbar unverifiziert. Fehlende numerische Versandkosten werden nicht aus einem Beschreibungstext geschätzt. Die App ruft `sourceUrl` oder `url` beim Import nicht auf.

## Verhalten

- Gleicher `provider.key`: vorhandene Quelle wird nach erfolgreicher Gesamtprüfung atomar ersetzt.
- Anderer `provider.key`: zusätzliche Quelle wird angelegt.
- Ungültiger Datensatz: der gesamte Import wird abgewiesen; der vorherige Stand bleibt erhalten.
- Entfernen: nur die ausgewählte Importquelle wird gelöscht; Demo und Familien-/Kinddaten bleiben erhalten.
- Speicherung: `mydiaper-offer-imports-v1`, getrennt vom Familienzustand.

## Noch nicht enthalten

- automatischer Abruf eines Händler-/Affiliatefeeds
- Signatur- oder Serverprüfung einer Importdatei
- automatische Produktanlage für unbekannte EAN/Packungen
- Push-Benachrichtigungen
- Cloud-Synchronisation
