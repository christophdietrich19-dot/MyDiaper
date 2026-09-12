const test=require('node:test');
const assert=require('node:assert/strict');
const {loadApp,memoryStorage,plain}=require('./helpers.cjs');

function offerBundle(overrides={}){
  return {
    format:'mydiaper-offers',version:1,
    provider:{key:'wochenmarkt',label:'Kontrollierter Wochenimport'},
    offers:[{externalId:'kw37-babydry',scope:'local',store:'Familienmarkt',city:'Berlin',distance:2.1,
      productPackageId:'package-pampers-babydry-4-74',price:14.8,oldPrice:19.8,
      verifiedAt:'2026-09-12T10:00:00Z',sourceUrl:'https://example.org/feed/kw37'}],
    ...overrides
  };
}

test('Kontrollierter Angebotsimport erzwingt Format, Katalogreferenz und HTTPS-Herkunft',()=>{
  const {app}=loadApp();
  const imported=app.domain.offers.normalizeImport(JSON.stringify(offerBundle()),app.productCatalog,new Date('2026-09-12T12:00:00Z'));
  assert.equal(imported.providerKey,'import-wochenmarkt');
  assert.equal(imported.offers[0].productSizeId,'size-pampers-baby-dry-4');
  assert.equal(imported.offers[0].count,74);
  assert.equal(imported.offers[0].sourceType,'import');
  assert.equal(app.domain.offers.freshness(imported.offers[0],new Date('2026-09-12T13:00:00Z')).status,'fresh');
  assert.throws(()=>app.domain.offers.normalizeImport(offerBundle({provider:{key:'Demo Quelle',label:'Ungültig'}}),app.productCatalog),/Anbieterschlüssel/);
  assert.throws(()=>app.domain.offers.normalizeImport(offerBundle({offers:[{...offerBundle().offers[0],productPackageId:'unbekannt'}]}),app.productCatalog),/unbekannte Packung/);
  assert.throws(()=>app.domain.offers.normalizeImport(offerBundle({offers:[{...offerBundle().offers[0],sourceUrl:'http://example.org'}]}),app.productCatalog),/HTTPS/);
});

test('Importierte Provider bleiben getrennt gespeichert und werden beim gleichen Schlüssel atomar ersetzt',()=>{
  const storage=memoryStorage(),first=loadApp(storage);
  first.app.offerImportRepository.importText(JSON.stringify(offerBundle()));
  assert.equal(first.app.offerService.search({scope:'local'}).filter(item=>item.providerKey==='import-wochenmarkt').length,1);
  const replacement=offerBundle({offers:[{...offerBundle().offers[0],externalId:'neu',price:13.5}]});
  first.app.offerImportRepository.importText(JSON.stringify(replacement));
  assert.equal(first.app.offerImportRepository.list().length,1);
  assert.equal(first.app.offerService.getById('import-wochenmarkt-neu').price,13.5);
  assert.equal(first.app.offerService.getById('import-wochenmarkt-kw37-babydry'),null);
  const reloaded=loadApp(storage);
  assert.equal(reloaded.app.offerService.getById('import-wochenmarkt-neu').price,13.5);
  reloaded.app.offerImportRepository.remove('import-wochenmarkt');
  assert.equal(reloaded.app.offerService.search().some(item=>item.providerKey==='import-wochenmarkt'),false);
  assert.ok(reloaded.app.offerService.search().some(item=>item.sourceType==='demo'));
});

test('Defekter Importspeicher verändert weder Demo-Angebote noch Familiendaten',()=>{
  const storage=memoryStorage({'mydiaper-offer-imports-v1':'{defekt'}),t=loadApp(storage);
  assert.equal(t.app.offerImportRepository.status().readOnly,true);
  assert.ok(t.app.offerService.search().length>0);
  assert.throws(()=>t.app.offerImportRepository.importText(JSON.stringify(offerBundle())),/unverändert/);
  t.app.store.patch(state=>{state.settings.location='Hamburg';});
  assert.equal(t.app.store.get().settings.location,'Hamburg');
  t.app.offerImportRepository.reset();
  t.app.offerImportRepository.importText(JSON.stringify(offerBundle()));
  assert.equal(t.app.offerImportRepository.list().length,1);
});

test('Familien-Backup ist versioniert, rundlaufend und prüft Kind-Set-Beziehungen',()=>{
  const t=loadApp(),before=plain(t.app.store.get());
  const text=t.app.domain.backup.serialize(before,new Date('2026-09-12T15:00:00Z'));
  const parsed=t.app.domain.backup.parse(text);
  assert.deepEqual(plain(parsed.state),before);
  t.app.store.patch(state=>{state.settings.location='Köln';});
  t.app.store.replace(parsed.state);
  assert.deepEqual(plain(t.app.store.get()),before);
  const broken=JSON.parse(text),lot=broken.state.inventoryLots[0];
  lot.childId=broken.state.children.find(child=>child.id!==lot.childId).id;
  assert.throws(()=>t.app.domain.backup.parse(JSON.stringify(broken)),/nicht zum selben Kind/);
  assert.throws(()=>t.app.domain.backup.parse('{"format":"fremd","version":1}'),/Unbekanntes Backupformat/);
  assert.throws(()=>t.app.domain.backup.parse('{"format":"mydiaper-family-backup","version":1,"exportedAt":null,"state":{}}'),/Exportzeitpunkt/);
});

test('UI verwaltet Angebotsimporte und lokale Familien-Backups ohne neue Navigation',()=>{
  const t=loadApp();
  t.click('route',{route:'offers'});
  assert.match(t.elements.get('app').innerHTML,/Eigene Angebote importieren/);
  t.click('manage-offer-sources');
  assert.match(t.elements.get('modalRoot').innerHTML,/Quelle prüfen &amp; importieren|Quelle prüfen & importieren/);
  t.submit('offerImportForm',{bundle:JSON.stringify(offerBundle({offers:[{...offerBundle().offers[0],store:'Markt <Nord>'}]}))});
  assert.match(t.elements.get('app').innerHTML,/Kontrollierter Wochenimport/);
  assert.match(t.elements.get('app').innerHTML,/Markt &lt;Nord&gt;/);
  assert.doesNotMatch(t.elements.get('app').innerHTML,/Markt <Nord>/);

  const original=plain(t.app.store.get());
  t.click('route',{route:'profile'});
  assert.match(t.elements.get('app').innerHTML,/Daten &amp; Synchronisation|Daten & Synchronisation/);
  t.click('family-backup-export');
  assert.match(t.elements.get('modalRoot').innerHTML,/mydiaper-family-backup/);
  const backup=t.app.domain.backup.serialize(original,new Date('2026-09-12T15:00:00Z'));
  t.app.store.patch(state=>{state.settings.location='Köln';});
  t.click('family-backup-import');
  t.submit('backupImportForm',{backup});
  assert.equal(t.app.store.get().settings.location,original.settings.location);
  assert.deepEqual(plain(t.app.store.get().children),original.children);
});
