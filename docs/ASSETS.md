# MyDiaper — Gestaltung und Asset-Herkunft

Stand: 11.09.2026. Diese Dateien gehören zur lokalen internen Testversion.

## Gelieferte Bildreferenz

- Quelle: Nutzerdatei `ChatGPT Image 11. Sept. 2026, 17_48_58.png`.
- Projektdatei: `assets/images/design-reference.png` (unveränderte Kopie).
- Verwendung: SVG-Viewports in `js/ui/visuals.js` zeigen das Beispielprofilbild, Wortlogo, Produktabbildungen, dm-Logo und die Beispielkarte. Es handelt sich nicht um eine neu bezogene Händlerkarte oder echte Produktfotos aus einem Feed.
- Die Vorlage ist eine perspektivische Werbevisualisierung, kein Satz originaler Figma-/SVG-Komponenten. Schriften, responsive Maße und freigestellte Illustrationen sind Annäherungen; eine nachgewiesene Pixelidentität wird nicht behauptet.
- Vor Veröffentlichung müssen Rechte an Referenz-, Personen-, Marken-, Produkt- und Kartendarstellungen sowie erforderliche Attributionen geklärt bzw. die Beispiele durch freigegebene Produktionsassets ersetzt werden. Das Nutzerbild stellt keine pauschale Veröffentlichungslizenz dar.

## Generierte Projektillustrationen

Modus: eingebautes ImageGen-Werkzeug, keine CLI/API-Fallbacks. Beide Ausgaben wurden nichtdestruktiv ins Projekt kopiert; Originalgenerierungen bleiben erhalten. Der ImageGen-Skill wurde für die transparenten Bildmotive verwendet, nicht für Icons, Layout oder Berechnungen.

### `assets/images/sleeping-baby.png`

Transparente Illustration für die Heute-Karte, erzeugt aus der gelieferten Referenz. Finaler Prompt:

> Use case: background-extraction. Input image 1 is the exact visual reference for the MyDiaper app. Extract and faithfully reconstruct ONLY the sleeping baby illustration seen in the first (left) phone's mint 'Heute' card. The peach-skinned sleeping baby lies with its head on the RIGHT, tiny brown hair curl, closed eyes, rosy cheeks, light blue clothing and lavender/blue pillow, cuddling a small upright white bunny with pink ears at the LEFT of the baby's face. Keep the exact gentle flat pastel watercolor/vector illustration style, proportions, pose and colors from the reference. Include the soft mint and light-blue oval cushion directly under the baby. Output one isolated clean illustration asset on a genuinely transparent background, no card, no UI, no text, no phones, no sun, no other content. Fill a landscape 3:2 canvas with the illustration and minimal transparent padding. Intended use is the bottom-right illustration of the existing mobile card; no redesign.

### `assets/images/elephant.png`

Transparenter Assistent für Finder und Desktop-Marke, erzeugt aus derselben Referenz. Finaler Prompt:

> Use case: background-extraction. Input image 1 is the edit target / exact supplied MyDiaper app reference. Extract and faithfully reconstruct ONLY the small seated pastel blue elephant from the center phone's Windel-Finder intro, on a genuinely transparent background. Preserve its exact front-facing seated pose, round head, large floppy rounded ears, tiny eyes, pink cheeks, tiny hair tuft and upcurled trunk, soft pale baby-blue colors and gentle illustration style. No redesign. Center the isolated elephant on a square canvas with minimal transparent padding. No heart, no text, no UI, no card, no screen background, no frame, no shadows beyond the character. This will be an app mascot asset displayed at 120 px high; keep it crisp and soft.

## Schriften

Lokal eingebunden, keine Schrift-CDN-Anfrage beim App-Start:

- Nunito Sans: `assets/fonts/nunito-regular.ttf`, `nunito-semibold.ttf`, `nunito-bold.ttf`.
- Caveat: `assets/fonts/caveat-medium.ttf`.
- Bezogen über Google Fonts; Lizenztexte liegen in `assets/fonts/NunitoSans-OFL.txt` und `assets/fonts/Caveat-OFL.txt` (SIL Open Font License).
- Quellen der Lizenztexte: https://github.com/google/fonts/blob/main/ofl/nunitosans/OFL.txt und https://github.com/google/fonts/blob/main/ofl/caveat/OFL.txt.

## Code-native Gestaltung

Navigations-/Funktionssymbole und der Regenbogen sind lokale SVGs in `js/ui/visuals.js`. Layout, Farbwerte, Größen, Schatten und Schriftanwendung stehen in `css/reference.css`. Die Domain-Regeln werden durch die Assets nicht verändert.

Alle benötigten Bilder, Schriften, Styles und Skripte werden nach `www/` kopiert und vom versionierten Service Worker erfasst. PWA-Offlineverhalten setzt einen erfolgreichen ersten HTTP(S)-Aufruf voraus; direktes Dateiöffnen benötigt keinen Service Worker.
