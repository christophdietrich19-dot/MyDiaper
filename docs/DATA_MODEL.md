# MyDiaper — Datenmodell

Die folgenden Modelle sind Zielmodelle. Feldnamen können technisch angepasst werden, Beziehungen und Verantwortlichkeiten sollten erhalten bleiben.

## Implementiertes lokales Schema v2

Speicherschlüssel: `mydiaper-v2-state`. Alle IDs sind stabile Strings; neue IDs werden clientseitig erzeugt. Die folgenden Sammlungen sind bereits umgesetzt; die relationalen Zielmodelle weiter unten bleiben die Planung für Backend und Produktkatalog.

| Sammlung | Identität / Beziehung | Weitere wesentliche Felder |
|---|---|---|
| `children` | `id` | `name`, `birthdate`, `weight`, `height`, `color` |
| `diaperSets` | `id`, `childId` | `label`, `purpose`, `brand`, `line`, `size`, `productSizeId`, `dailyUse`, `active`, `isPrimary` |
| `inventoryLots` | `id`, `childId`, **`setId` (Pflicht)** | `initialUnits`, `remainingUnits`, `productSizeId`, `source`, `createdAt` bei neuen Losen |
| `usageEvents` | `id`, `childId`, `setId` | `quantity`, `source`, `usedAt` |
| `fitChecks` | `id`, `childId`, `setId` | `answers`, `code`, `result`, `note`, `score`, `recommendation`, `weightKgSnapshot`, `productSnapshot`, `createdAt` |
| `productExperiences` | `id`, `childId`, `setId` | `productSizeId`, `productSnapshot`, optionale Bewertungen, `sizeTendency`, `avoidRecommendation`, `notes`, Zeitstempel |

`schemaVersion: 2` kennzeichnet den Zustand. `activeChildId` bleibt erhalten. `settings`, `market` und `chats` bleiben bewusst auf Familien-/Demo-Ebene. Es gibt weiterhin keinen Accountzwang, Cloud-Sync oder echten Produktdatenanbieter.

Bestände liegen ausschließlich in `inventoryLots`. Die UI-Felder `stock`, `days`, `currentSize` usw. werden abgeleitet und nicht zusätzlich in Kinderprofilen gespeichert. Jeder Bestand benötigt sowohl Kind als auch Set; die Set-Zugehörigkeit wird vor dem Speichern geprüft. Fit-Checks und Erfahrungen können im Modell auch ohne Set-Referenz existieren, bleiben aber immer einem Kind zugeordnet; die aktuellen Repository-Schreibmethoden arbeiten mit einem konkreten Set.

### Lokale Repository-Schnittstelle

```js
const repository = MyDiaper.repository;
const sets = repository.listSets(childId);
repository.createSet(childId, {
  label: 'Nachtwindel', brand: 'Eigene Angabe', line: 'Eigene Angabe',
  size: '4', dailyUse: 1, stock: 20
});
repository.addStock(childId, setId, 30);
repository.consumeStock(childId, setId, 1);
repository.updateSet(childId, setId, { stock: 18, dailyUse: 1 });
repository.saveFitCheck(childId, setId, {
  leak: 'no', marks: 'no', closure: 'good', night: 'yes'
});
repository.saveExperience(childId, setId, {
  sizeTendency: 'normal', avoidRecommendation: false, notes: 'Persönliche Erfahrung'
});
repository.listFitChecks(childId, setId);
repository.listExperiences(childId);
```

Die Methoden prüfen Beziehungen unabhängig vom aktiven UI-Kind. Alle Leseergebnisse sind Kopien. Beim Bearbeiten einer Erfahrung müssen Kind, Set und Erfahrungs-ID zusammenpassen. Migration und deaktivierte Sets sind in ADR-012 dokumentiert.

## users
```text
id UUID PK
email
username/display_name
avatar_url
created_at
updated_at
status
```

## children
```text
id UUID PK
user_id FK users
name
birth_date nullable
weight_kg nullable
height_cm nullable
avatar_url nullable
avatar_color
sort_order
created_at
updated_at
archived_at nullable
```

Kinderprofile sind privat und nur für den Besitzer bzw. später ausdrücklich freigegebene Familienmitglieder sichtbar.

## diaper_categories
Beispiele:
- diaper
- pants
- night
- swim
- special

## brands
```text
id
name
logo_url nullable
website nullable
active
```

## products
```text
id
brand_id
name
category_id
country_code
active
```

## product_sizes
```text
id
product_id
label              # z.B. 4, 5+, M
min_weight_kg nullable
max_weight_kg nullable
manufacturer_notes nullable
```

## product_packages
```text
id
product_size_id
units_per_pack
barcode_ean nullable
variant_name nullable
```

Ein Produkt kann mehrere Packungsgrößen und Barcodes haben.

## child_diaper_sets
Aktive Windelsets eines Kindes.
```text
id
child_id
purpose            # day, night, swim, pants, custom
product_size_id nullable
custom_label nullable
is_primary
created_at
updated_at
```

## fit_checks
```text
id
child_id
child_diaper_set_id nullable
product_size_id nullable
weight_kg_snapshot
answers_json
result_code
recommendation_json
created_at
```

## product_experiences
Persönliche Erfahrung für dieses Kind.
```text
id
child_id
product_size_id
fit_rating nullable
leak_rating nullable
night_rating nullable
skin_comfort_rating nullable
size_tendency       # small, normal, large
avoid_recommendation boolean
notes nullable
created_at
updated_at
```

## inventory_lots
```text
id
user_id
child_id nullable
product_package_id nullable
product_size_id
initial_units
remaining_units
opened boolean
purchase_date nullable
purchase_price nullable
source nullable
created_at
updated_at
```

## usage_events
Optional für genauere Verbrauchsberechnung.
```text
id
child_id
child_diaper_set_id nullable
quantity
used_at
source              # manual, quick_action, correction
```

## reminders
```text
id
user_id
child_id nullable
type
config_json
enabled
last_triggered_at nullable
created_at
updated_at
```

## retailers
```text
id
name
type                # local, online, both
logo_url nullable
website nullable
```

## stores
```text
id
retailer_id
name
address_public
postal_code
city
latitude nullable
longitude nullable
```

## offers
```text
id
provider_key
external_id
retailer_id
store_id nullable
product_package_id nullable
product_size_id nullable
scope               # local | online
price
shipping_price nullable
old_price nullable
currency
valid_from nullable
valid_until nullable
url nullable
verified_at
raw_metadata_json
```

Berechnetes Feld in Domain-Logik:
`price_per_diaper = (price + relevante Versandkosten) / units_per_pack`

## price_alerts
```text
id
user_id
child_id nullable
product_size_id nullable
product_id nullable
max_price_per_unit nullable
scope local|online|both
radius_km nullable
enabled
```

## marketplace_listings
```text
id
seller_user_id
product_size_id nullable
brand_text nullable
product_text nullable
category
size_label
condition            # sealed | opened
quantity
listing_type         # sell | trade | gift
price nullable
trade_for nullable
shipping_available
pickup_available
postal_area nullable
city nullable
status               # draft | active | reserved | completed | removed | moderated
created_at
updated_at
expires_at nullable
```

## listing_images
```text
id
listing_id
storage_path
sort_order
moderation_status
```

## conversations
```text
id
listing_id
buyer_user_id
seller_user_id
status
created_at
updated_at
```

Pro Listing + Käufer maximal eine aktive Conversation.

## messages
```text
id
conversation_id
sender_user_id
body
created_at
read_at nullable
moderation_status
```

## blocks
```text
blocker_user_id
blocked_user_id
created_at
```

## reports
```text
id
reporter_user_id
target_type          # user, listing, message, review
target_id
reason_code
description nullable
status
created_at
resolved_at nullable
```

## product_reviews
Optional, bewusst sachlich.
```text
id
user_id
product_size_id
fit_rating
leak_rating
night_rating
value_rating
short_text nullable
status
created_at
updated_at
```

## notification_tokens
```text
id
user_id
platform
push_token
active
last_seen_at
```

## sync_metadata
Für Local-first optional:
```text
entity_type
entity_id
local_version
server_version
sync_state
last_synced_at
```
