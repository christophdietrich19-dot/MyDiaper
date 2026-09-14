const test = require('node:test');
const assert = require('node:assert/strict');
const {loadApp, memoryStorage, plain} = require('./helpers.cjs');
const normal = {leak:'no',marks:'no',closure:'good',night:'no'};
const v1key = 'mydiaper-v1-state', v2key = 'mydiaper-v2-state', v3key = 'mydiaper-v3-state', v4key = 'mydiaper-v4-state';
function fixture(){const loaded=loadApp();return {...loaded, repo:loaded.app.repository, store:loaded.app.store};}

test('v1 wird verlustfrei migriert: eindeutige Sets, kein vervielfachter Vorrat, alter Speicher bleibt erhalten', () => {
  const defaults = plain(loadApp().app.legacyDefaults);
  defaults.children[0].stock = 41;
  defaults.fitChecks.emma = {result:'Gespeichert',note:'Altbefund',at:'2026-09-10T10:00:00Z'};
  defaults.settings.location = 'Testort';
  const original = JSON.stringify(defaults), storage = memoryStorage({[v1key]:original});
  const {app} = loadApp(storage), state = app.store.get();
  assert.equal(state.schemaVersion, 4);
  assert.equal(state.diaperSets.length, 5);
  assert.equal(app.repository.viewChild('emma').stock, 41);
  const night = app.repository.listSets('leo').find(s=>s.purpose==='night');
  assert.equal(app.repository.viewChild('leo',night.id).stock, 0);
  assert.equal(app.repository.viewChild('leo',night.id).dailyUse, 0);
  assert.equal(state.inventoryLots.reduce((sum,l)=>sum+l.remainingUnits,0), 112);
  assert.equal(state.fitChecks[0].childId, 'emma');
  assert.equal(state.fitChecks[0].result, 'Gespeichert');
  assert.equal(state.settings.location, 'Testort');
  assert.deepEqual(plain(state.market.map(item=>item.title)), defaults.market.map(item=>item.title));
  assert.equal(state.chats.m1.length,defaults.chats.m1.length);
  assert.equal(storage.getItem(v1key), original);
  assert.ok(storage.getItem(v4key));
  assert.deepEqual(plain(loadApp(storage).app.store.get()), plain(state));
  assert.ok(state.children.every(c=>!('stock' in c)&&!('currentSize' in c)&&!('types' in c)));
});
test('v2 wird einmalig nach v4 migriert, mit Katalogverknüpfung und Größenstartpunkten',()=>{
  const first=loadApp(),v2=plain(first.app.store.get());
  v2.schemaVersion=2;delete v2.sizeHistory;delete v2.priceAlerts;
  v2.diaperSets.forEach(set=>set.productSizeId=null);
  v2.inventoryLots.forEach(lot=>lot.productSizeId=null);
  const original=JSON.stringify(v2),storage=memoryStorage({[v2key]:original}),loaded=loadApp(storage),state=loaded.app.store.get();
  assert.equal(state.schemaVersion,4);
  assert.equal(state.sizeHistory.length,state.diaperSets.length);
  assert.deepEqual(plain(state.priceAlerts),[]);
  assert.equal(loaded.app.repository.viewChild('emma').currentLine,'Premium Protection');
  assert.equal(loaded.app.repository.listSets('emma')[0].productSizeId,'size-pampers-premium-protection-3');
  assert.equal(storage.getItem(v2key),original);
  assert.ok(storage.getItem(v4key));
});
test('Kinder und vier parallele Sets besitzen voneinander getrennte Bestände und Verbräuche', () => {
  const {repo,store} = fixture();
  const originalLeo = plain(repo.viewChild('leo'));
  const sets = ['Pants','Nachtwindel','Schwimmwindel'].map((label,index)=>repo.createSet('emma',{label,brand:'Demo',line:label,size:String(index+4),dailyUse:index+1,stock:12}));
  assert.equal(repo.listSets('emma').length, 4);
  repo.addStock('emma',sets[1],8);
  repo.consumeStock('emma',sets[1],2);
  repo.updateSet('emma',sets[2],{stock:9,dailyUse:0.5});
  assert.equal(repo.viewChild('emma',sets[0]).stock,12);
  assert.equal(repo.viewChild('emma',sets[1]).stock,18);
  assert.equal(repo.viewChild('emma',sets[1]).days,9);
  assert.equal(repo.viewChild('emma',sets[2]).days,18);
  assert.equal(repo.viewChild('emma').stock,36);
  assert.deepEqual(plain(repo.viewChild('leo')),originalLeo);
  assert.equal(store.get().usageEvents[0].setId,sets[1]);
});
test('Kindfremde IDs werden bei sämtlichen fachlichen Schreiboperationen abgewiesen', () => {
  const {repo,store} = fixture(), foreign=repo.listSets('leo')[0].id;
  const before=plain(store.get());
  for(const change of [()=>repo.addStock('emma',foreign,30),()=>repo.consumeStock('emma',foreign),
    ()=>repo.updateSet('emma',foreign,{stock:0}),()=>repo.saveFitCheck('emma',foreign,normal),
    ()=>repo.saveExperience('emma',foreign,{notes:'Falsch'})]) assert.throws(change);
  assert.deepEqual(plain(store.get()),before);
});
test('Fit-Historie und persönliche Erfahrungen bleiben getrennt pro Kind und Set erhalten', () => {
  const {repo,store,storage} = fixture(), emma=repo.listSets('emma')[0].id, leo=repo.listSets('leo')[0].id;
  repo.saveFitCheck('emma',emma,normal);
  repo.saveFitCheck('emma',emma,{...normal,night:'yes'});
  repo.saveFitCheck('leo',leo,{...normal,marks:'yes',closure:'tight'});
  const experience=repo.saveExperience('emma',emma,{notes:'Passt gut',avoidRecommendation:false});
  repo.saveExperience('leo',leo,{notes:'Andere Passform',avoidRecommendation:true});
  assert.equal(repo.listFitChecks('emma').length,2);
  assert.equal(repo.listFitChecks('leo').length,1);
  assert.equal(repo.listFitChecks('emma')[0].weightKgSnapshot,8.4);
  assert.equal(repo.listExperiences('emma')[0].notes,'Passt gut');
  assert.equal(repo.listExperiences('leo')[0].notes,'Andere Passform');
  assert.throws(()=>repo.saveExperience('leo',leo,{id:experience,notes:'Überschreiben'}));
  assert.equal(store.get().fitChecks.length,3);
  const loaded=loadApp(storage).app.repository;
  assert.equal(loaded.listExperiences('emma')[0].notes,'Passt gut');
  assert.equal(loaded.listFitChecks('emma').length,2);
});
test('Ungültige Produkterfahrungen werden atomar abgewiesen',()=>{
  const {repo,store}=fixture(),set=repo.listSets('emma')[0].id,before=plain(store.get());
  for(const input of [{fitRating:0},{leakRating:6},{nightRating:2.5},{skinComfortRating:'x'},{sizeTendency:'maybe'},{avoidRecommendation:'yes'}]) assert.throws(()=>repo.saveExperience('emma',set,input));
  assert.deepEqual(plain(store.get()),before);
});
test('Profilbearbeitung verändert ausschließlich das Hauptset des bearbeiteten Kindes', () => {
  const {repo} = fixture(), leo = repo.viewChild('leo');
  const night = repo.listSets('leo')[1].id;
  repo.updateSet('leo',night,{brand:'Nachtmarke',line:'Nachtlinie',size:'7',stock:13,dailyUse:1});
  const before = plain(repo.viewChild('leo',night));
  repo.saveChildProfile({...leo,brand:'Neue Marke',size:'6',types:leo.types,stock:31,dailyUse:4});
  const after=repo.viewChild('leo',night);
  assert.equal(after.stock,before.stock);
  assert.equal(after.currentBrand,before.currentBrand);
  assert.equal(after.currentSize,'7');
  assert.equal(repo.viewChild('leo').stock,31);
  assert.equal(repo.viewChild('emma').stock,36);
});
test('Größenverlauf und Katalogzuordnung bleiben pro Kind und Set getrennt',()=>{
  const {repo}=fixture(),emma=repo.listSets('emma')[0],leo=repo.listSets('leo')[0];
  const beforeLeo=plain(repo.listSizeHistory('leo',leo.id));
  repo.updateSet('emma',emma.id,{size:'4'});
  repo.assignProduct('emma',emma.id,'size-pampers-baby-dry-5');
  const history=repo.listSizeHistory('emma',emma.id);
  assert.equal(history.at(-2).toSize,'4');
  assert.equal(history.at(-1).fromSize,'4');
  assert.equal(history.at(-1).toSize,'5');
  assert.equal(repo.viewChild('emma').currentLine,'Baby-Dry');
  assert.deepEqual(plain(repo.listSizeHistory('leo',leo.id)),beforeLeo);
  assert.throws(()=>repo.assignProduct('emma',emma.id,'size-pampers-pants-5'));
});
test('Kategorien entfernen und reaktivieren verliert weder Bestände noch Historie', () => {
  const {repo} = fixture(), leo=repo.viewChild('leo'), night=repo.listSets('leo')[1].id;
  repo.addStock('leo',night,12); repo.saveFitCheck('leo',night,normal);
  repo.saveChildProfile({...leo,brand:leo.currentBrand,size:leo.currentSize,types:['Pants']});
  assert.equal(repo.listSets('leo').length,1);
  assert.equal(repo.listFitChecks('leo',night).length,1);
  repo.saveChildProfile({...leo,brand:leo.currentBrand,size:leo.currentSize,types:['Pants','Nachtwindel']});
  assert.equal(repo.viewChild('leo',night).stock,12);
});
test('Beim Entfernen des Hauptsets wird sein Vorrat keinem anderen Set zugeschlagen', () => {
  const {repo,store}=fixture(), leo=repo.viewChild('leo'), night=repo.listSets('leo')[1].id;
  repo.addStock('leo',night,9);
  repo.saveChildProfile({...leo,brand:leo.currentBrand,size:leo.currentSize,types:['Nachtwindel']});
  assert.equal(repo.viewChild('leo').stock,9);
  assert.equal(store.get().inventoryLots.find(l=>l.setId===leo.setId).remainingUnits,54);
});
test('Negative, nichtendliche und gebrochene Bestände werden atomar abgewiesen', () => {
  const {repo,store}=fixture(), set=repo.listSets('emma')[0].id, before=plain(store.get());
  for(const value of [-1,NaN,Infinity,1.5]){
    assert.throws(()=>repo.addStock('emma',set,value));
    assert.throws(()=>repo.updateSet('emma',set,{stock:value}));
  }
  assert.deepEqual(plain(store.get()),before);
  repo.consumeStock('emma',set,100);
  assert.equal(repo.viewChild('emma').stock,0);
  assert.equal(repo.consumeStock('emma',set),0);
  assert.equal(store.get().usageEvents.length,1);
});
test('Lesekopien verhindern ungeprüfte Mutation; die Speichergrenze prüft Eigentümerschaft', () => {
  const {store}=fixture(), before=plain(store.get());
  const external=store.get(); external.children[0].name='Fremd';
  assert.equal(store.get().children[0].name,'Emma');
  assert.throws(()=>store.patch(s=>s.inventoryLots[0].childId='leo'));
  assert.throws(()=>store.patch(s=>s.diaperSets[0].childId='leo'));
  assert.deepEqual(plain(store.get()),before);
});
test('Schreibfehler lassen den bestätigten Speicherstand unverändert', () => {
  const {app,storage}=loadApp(), repo=app.repository, before=plain(app.store.get());
  storage.setItem=()=>{throw new Error('Quota exceeded');};
  assert.throws(()=>repo.addStock('emma',repo.listSets('emma')[0].id,3),/Speichern/);
  assert.deepEqual(plain(app.store.get()),before);
});
test('Defekte oder neuere Daten werden nicht mit Demo-Daten überschrieben', () => {
  for(const raw of ['{broken','null','[]','42',JSON.stringify({schemaVersion:99}),JSON.stringify({schemaVersion:2})]){
    const storage=memoryStorage({[v2key]:raw}), {app}=loadApp(storage);
    assert.equal(app.store.status().readOnly,true);
    assert.throws(()=>app.repository.switchChild('leo'));
    assert.equal(storage.getItem(v2key),raw);
  }
});
test('Direktstart bleibt bei blockiertem localStorage in der Sitzung bedienbar', () => {
  const storage={getItem(){throw new Error('SecurityError');},setItem(){throw new Error('SecurityError');}};
  const {app}=loadApp(storage);
  app.repository.addStock('emma',app.repository.listSets('emma')[0].id,4);
  assert.equal(app.repository.viewChild('emma').stock,40);
  assert.equal(app.store.status().memoryOnly,true);
});
