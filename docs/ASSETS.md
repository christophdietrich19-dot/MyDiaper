# MyDiaper — Gestaltung und Asset-Herkunft

Stand: 14.09.2026. Diese Dateien gehören zur lokalen internen Testversion.

## Gelieferte Bildreferenz

- Quelle: Nutzerdatei `ChatGPT Image 11. Sept. 2026, 17_48_58.png`.
- Projektdatei: `assets/images/design-reference.png` (unveränderte Kopie).
- Verwendung: SVG-Viewports in `js/ui/visuals.js` zeigen das Beispielprofilbild, Wortlogo, Produktabbildungen und dm-Logo. Die frühere statische Beispielkarte wird nicht mehr verwendet; die Kartenbasis stammt nun von OpenStreetMap über Leaflet. Es werden keine Pins aus der Bildreferenz oder künstlichen Berliner Ersatzkoordinaten erzeugt.

## Kartenbibliothek

- Leaflet 1.9.4 liegt lokal unter `assets/vendor/leaflet/` und steht unter der BSD-2-Clause-Lizenz.
- OpenStreetMap-Kacheln werden zur Laufzeit über HTTPS geladen und in der Karte sichtbar attribuiert.
- Der Lizenztext liegt in `THIRD_PARTY_NOTICES.md`.
- Die Vorlage ist eine perspektivische Werbevisualisierung, kein Satz originaler Figma-/SVG-Komponenten. Schriften, responsive Maße und freigestellte Illustrationen sind Annäherungen; eine nachgewiesene Pixelidentität wird nicht behauptet.
- Weil mehrere UI-Ausschnitte zur Laufzeit direkt aus `design-reference.png` angezeigt werden, ist derzeit auch die vollständige Referenzdatei im Web- und APK-Build enthalten und technisch extrahierbar. Sie enthält keine Familiendaten, muss vor einer öffentlichen Veröffentlichung aber durch rechtlich freigegebene Produktionsassets ersetzt werden.
- Vor Veröffentlichung müssen Rechte an Referenz-, Personen-, Marken-, Produkt- und Kartendarstellungen sowie erforderliche Attributionen geklärt bzw. die Beispiele durch freigegebene Produktionsassets ersetzt werden. Das Nutzerbild stellt keine pauschale Veröffentlichungslizenz dar.

## Generierte Projektillustrationen

Modus: eingebautes ImageGen-Werkzeug, keine CLI/API-Fallbacks. Beide Ausgaben wurden nichtdestruktiv ins Projekt kopiert; Originalgenerierungen bleiben erhalten. Der ImageGen-Skill wurde für die transparenten Bildmotive verwendet, nicht für Icons, Layout oder Berechnungen.

### `assets/images/sleeping-baby.png`

Transparente Illustration für die Heute-Karte, zunächst aus der gelieferten Referenz extrahiert und am 14.09.2026 geschlechtsneutral überarbeitet. Der bestehende Charakter, die Pose, der Hase und die Komposition blieben erhalten; ausschließlich die blaue Kleidung wechselte zu Salbei/Mint und Creme. Finaler Farbbearbeitungsprompt:

> Use case: precise-object-edit. Asset type: transparent in-app illustration for the MyDiaper Today card. Input image: Image 1 is the exact edit target. Primary request: Change only the baby's blue clothing to a clearly gender-neutral soft sage-mint and warm cream color palette. Keep the palette gentle, calm, family-friendly and consistent with the existing MyDiaper pastel watercolor/vector style. Constraints: Preserve the baby's identity, skin tone, face, expression, hair curl, pose, hands, body proportions, bunny, pillow, mint cushion, lighting, soft shading, composition, exact landscape framing, and genuinely transparent background. Keep all edges clean. No redesign and no new objects. Avoid: blue or pink gender-coded clothing, text, logos, watermark, background, extra decorations.

Das Android-Fehlerprotokoll 1.1.1 zeigte anschließend, dass das sichtbare Schachbrett nicht Transparenz darstellte, sondern als RGB-Hintergrund in die Datei eingebrannt war. Zwei erneute Bearbeitungen im eingebauten ImageGen-Modus wurden technisch geprüft, enthielten aber weiterhin keinen Alpha-Kanal und wurden deshalb nicht übernommen. Der zuletzt verwendete Transparenzprompt lautete:

> Use case: background-extraction. Asset type: production PNG cutout for an app card. Input images: Image 1 is the exact edit target. Primary request: The gray checkerboard in Image 1 is unwanted, baked-in background pixels. Delete that entire checkerboard background. Return the foreground illustration only on true transparency. Required output: RGBA PNG with a real alpha channel. Every canvas corner and every area outside the baby, bunny, pillow and mint cushion must have alpha 0. The checkerboard must not appear as visible artwork or RGB background pixels. Foreground invariants: Preserve the exact baby, facial features, sage-mint and cream clothes, bunny, pillow, cushion, pose, scale, lighting, shadows, composition and landscape canvas. Do not repaint, restyle, crop or move any foreground element. Edge quality: clean anti-aliased cutout with no gray fringe or checkerboard remnants. Avoid: simulated transparency grid, gray/white/colored background, backdrop texture, halos, new objects, text, logo, watermark.

Die finale Projektdatei wurde daher ohne generatives Neuzeichnen technisch freigestellt: Eine kantenverbundene Maske entfernte ausschließlich die niedrig gesättigten Schachbrettpixel und schrieb echte transparente Alpha-Werte. Ein automatisierter Test prüft RGBA-Farbtyp, transparente Eckpixel sowie einen ausreichenden Transparenzanteil. Das Motiv wurde zusätzlich auf dem tatsächlichen mintfarbenen Kartenhintergrund visuell kontrolliert.

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
