const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadApp,memoryStorage,plain,root} = require('./helpers.cjs');

test('v4 wird nach v5 migriert und ergänzt neue Felder ohne alte Ereignisse umzudeuten',()=>{
  const first=loadApp(),legacy=plain(first.app.store.get()),set=legacy.diaperSets[0];
  legacy.schemaVersion=4;
  delete legacy.settings.salutation;
  legacy.inventoryLots.forEach(lot=>delete lot.storageLocation);
  legacy.usageEvents=[{id:'usage_old',childId:set.childId,setId:set.id,productSizeId:set.productSizeId,quantity:1,usedAt:'2026-09-10T08:00:00.000Z',createdAt:'2026-09-10T08:00:00.000Z'}];
  const raw=JSON.stringify(legacy),storage=memoryStorage({'mydiaper-v4-state':raw}),loaded=loadApp(storage),state=loaded.app.store.get();
  assert.equal(state.schemaVersion,5);
  assert.deepEqual(plain(state.settings.salutation),{choice:'parent',customName:'',completed:false});
  assert.ok(state.inventoryLots.every(lot=>lot.storageLocation==='Zuhause'));
  assert.equal(state.usageEvents[0].contents,'unknown');
  assert.deepEqual(plain(state.usageEvents[0].lotConsumptions),[]);
  assert.equal(storage.getItem('mydiaper-v4-state'),raw);
  assert.ok(storage.getItem('mydiaper-v5-state'));
});

test('Vorratsorte und Gesamtsummen bleiben eindeutig nach Kind und Windelset getrennt',()=>{
  const {app}=loadApp(),repo=app.repository,emma=repo.viewChild('emma'),leoBefore=app.domain.inventory.forChild(app.store.get().inventoryLots,'leo');
  const night=repo.createSet('emma',{label:'Nachtwindel',brand:'Pampers',line:'Baby-Dry',size:'4',dailyUse:1,stock:0});
  repo.addStock('emma',emma.setId,8,{storageLocation:'Wickeltisch'});
  repo.addStock('emma',night,12,{storageLocation:'Keller'});
  const summary=app.domain.inventory.forChild(app.store.get().inventoryLots,'emma');
  assert.equal(summary.total,56);
  assert.equal(summary.bySet[emma.setId],44);
  assert.equal(summary.bySet[night],12);
  assert.equal(summary.byLocation.Wickeltisch,8);
  assert.equal(summary.byLocation.Keller,12);
  assert.deepEqual(plain(app.domain.inventory.forChild(app.store.get().inventoryLots,'leo')),plain(leoBefore));
});

test('Ein Vorratsposten behält sein damaliges Produkt, wenn das Windelset später wechselt',()=>{
  const {app}=loadApp(),repo=app.repository,set=repo.listSets('emma')[0];
  const lotId=repo.addStock('emma',set.id,5,{productSizeId:null,productSnapshot:{brand:'Eigene Marke',line:'Sanft',size:'4'},storageLocation:'Wickeltasche'});
  repo.updateSet('emma',set.id,{brand:'Andere Marke',line:'Neue Linie',size:'5',productSizeId:null});
  const lot=repo.listLots('emma',set.id).find(item=>item.id===lotId);
  assert.deepEqual(plain(lot.productSnapshot),{brand:'Eigene Marke',line:'Sanft',size:'4'});
});

test('Windelwechsel protokollieren Inhalt, ziehen Vorrat ab und lassen sich bearbeiten oder rückgängig machen',()=>{
  const {app}=loadApp(),repo=app.repository,emma=repo.viewChild('emma'),leo=repo.viewChild('leo'),emmaBefore=emma.stock,leoBefore=leo.stock;
  const eventId=repo.recordUsage('emma',emma.setId,{contents:'wet',usedAt:'2026-09-14T08:00:00.000Z',note:'Morgens'});
  repo.recordUsage('leo',leo.setId,{contents:'stool',usedAt:'2026-09-14T09:00:00.000Z'});
  assert.equal(repo.viewChild('emma').stock,emmaBefore-1);
  assert.equal(repo.viewChild('leo').stock,leoBefore-1);
  assert.equal(repo.listUsage('emma').length,1);
  assert.equal(repo.listUsage('leo').length,1);
  repo.updateUsage('emma',eventId,{contents:'both',usedAt:'2026-09-14T08:10:00.000Z',note:'Korrigiert'});
  const summary=app.domain.activity.summarize(repo.listUsage('emma'));
  assert.deepEqual(plain(summary),{changes:1,units:1,wet:1,stool:1,dry:0,unknown:0});
  repo.undoUsage('emma',eventId);
  assert.equal(repo.viewChild('emma').stock,emmaBefore);
  assert.equal(repo.listUsage('emma').length,0);
  assert.equal(repo.viewChild('leo').stock,leoBefore-1);
});

test('Preisalarme unterscheiden Stückpreis und exakt gewählte Packung',()=>{
  const {app}=loadApp(),domain=app.domain.offers;
  const base={enabled:true,productSizeId:'size-pampers-baby-dry-4',scope:'both'};
  const exact=domain.normalizeAlert({...base,productPackageId:'package-pampers-babydry-4-74',maxUnitPrice:null,maxPackPrice:15});
  const pack74={scope:'local',productSizeId:base.productSizeId,productPackageId:'package-pampers-babydry-4-74',price:14,count:74};
  const pack76={...pack74,productPackageId:'package-pampers-babydry-4-76',count:76};
  assert.equal(domain.matchesAlert(pack74,exact),true);
  assert.equal(domain.matchesAlert(pack76,exact),false);
  const unit=domain.normalizeAlert({...base,productPackageId:null,maxUnitPrice:0.2,maxPackPrice:null});
  assert.equal(domain.matchesAlert(pack76,unit),true);
});

test('Begrüßung ist frei wählbar und die erweiterten bekannten Marken sind im Katalog',()=>{
  const {app}=loadApp();
  app.repository.saveSalutation({choice:'custom',customName:'Chris'});
  assert.deepEqual(plain(app.store.get().settings.salutation),{choice:'custom',customName:'Chris',completed:true});
  const brands=new Set(app.productCatalog.brands.map(brand=>brand.name));
  for(const name of ['Rascals','Moltex','Naty','Huggies'])assert.ok(brands.has(name),name);
});

test('Direktstart bindet Leaflet, Kartenadapter und getrennte Native-Plattformmodule ein',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const asset of ['assets/vendor/leaflet/leaflet.css','assets/vendor/leaflet/leaflet.js','js/ui/offer-map.js','js/platform/location.js','js/platform/navigation.js']){
    assert.match(html,new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.match(sw,new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  const native=fs.readFileSync(path.join(root,'android/app/src/main/java/de/christophit/mydiaper/MainActivity.java'),'utf8');
  assert.match(native,/setSupportZoom\(false\)/);
  assert.match(native,/setBuiltInZoomControls\(false\)/);
});
