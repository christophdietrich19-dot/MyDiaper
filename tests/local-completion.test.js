const test=require('node:test');
const assert=require('node:assert/strict');
const {loadApp,plain}=require('./helpers.cjs');

test('Datenversion 4 ergänzt lokale CRUD- und Freigabedaten',()=>{
  const {app}=loadApp(),state=app.store.get();
  assert.equal(state.schemaVersion,4);
  for(const name of ['marketReports','marketBlocks','catalogCorrections'])assert.ok(Array.isArray(state[name]));
  assert.deepEqual(plain(state.settings.reminderConfig),{stockDays:4,sizeCheckWeeks:4,quietStart:'20:00',quietEnd:'08:00'});
  assert.ok(state.children.every(child=>'archivedAt' in child));
});

test('Kinder werden zuerst archiviert, wiederhergestellt und anschließend kaskadierend gelöscht',()=>{
  const {app}=loadApp(),repo=app.repository,emma=repo.viewChild('emma');
  repo.saveFitCheck('emma',emma.setId,{leak:'no',marks:'no',closure:'good',night:'no'});
  repo.archiveChild('emma');
  assert.equal(repo.listChildren().some(child=>child.id==='emma'),false);
  assert.equal(repo.listChildren(true).find(child=>child.id==='emma').archivedAt!==null,true);
  assert.throws(()=>repo.switchChild('emma'),/archiviert/i);
  repo.restoreChild('emma');repo.switchChild('emma');assert.equal(app.store.get().activeChildId,'emma');
  repo.archiveChild('emma');repo.deleteChild('emma');
  const state=app.store.get();
  assert.equal(state.children.some(child=>child.id==='emma'),false);
  for(const name of ['diaperSets','inventoryLots','fitChecks','productExperiences','usageEvents','sizeHistory'])assert.equal(state[name].some(item=>item.childId==='emma'),false,name);
});

test('Windelsets können angelegt, geändert, pausiert, priorisiert und gelöscht werden',()=>{
  const {app}=loadApp(),repo=app.repository;
  const id=repo.createSet('emma',{label:'Nachtwindel',brand:'Demo',line:'Nacht',size:'4',dailyUse:1,stock:9});
  repo.updateSet('emma',id,{brand:'Neu',line:'Sanft',size:'5',dailyUse:2});
  repo.setPrimary('emma',id);assert.equal(repo.viewChild('emma').setId,id);
  repo.deactivateSet('emma',id);assert.equal(repo.listSets('emma',true).find(set=>set.id===id).active,false);
  repo.reactivateSet('emma',id);assert.equal(repo.viewChild('emma',id).stock,9);
  repo.deleteSet('emma',id);assert.equal(repo.listSets('emma',true).some(set=>set.id===id),false);
  assert.equal(app.store.get().inventoryLots.some(lot=>lot.setId===id),false);
});

test('Vorratsposten bleiben pro Kind und Set getrennt und sind vollständig CRUD-fähig',()=>{
  const {app}=loadApp(),repo=app.repository,emma=repo.viewChild('emma'),leo=repo.viewChild('leo'),leoBefore=leo.stock;
  const id=repo.addStock('emma',emma.setId,12,{note:'Testpackung',acquiredAt:'2026-09-12'});
  repo.updateLot('emma',emma.setId,id,{initialUnits:12,remainingUnits:7,note:'Geöffnet'});
  assert.equal(repo.listLots('emma',emma.setId).find(lot=>lot.id===id).remainingUnits,7);
  assert.equal(repo.viewChild('leo').stock,leoBefore);
  assert.throws(()=>repo.updateLot('leo',leo.setId,id,{remainingUnits:0}));
  assert.throws(()=>repo.updateLot('emma',emma.setId,id,{acquiredAt:'kein-datum'}),/Kaufdatum/);
  repo.removeLot('emma',emma.setId,id);assert.equal(repo.listLots('emma',emma.setId).some(lot=>lot.id===id),false);
});

test('Erinnerungsregeln werden validiert und lösen an der gewählten Vorratsgrenze aus',()=>{
  const {app}=loadApp(),rules=app.domain.reminders;
  const config=rules.normalize({stockDays:8,sizeCheckWeeks:6,quietStart:'21:00',quietEnd:'07:00'});
  assert.equal(rules.stockDue(8,true,config),true);assert.equal(rules.stockDue(9,true,config),false);assert.equal(rules.stockDue(2,false,config),false);
  assert.throws(()=>rules.normalize({stockDays:0}));assert.throws(()=>rules.normalize({quietStart:'25:00'}));
});

test('Barcode-Lookup nutzt ausschließlich geprüfte Katalogcodes und speichert Unbekanntes nur als Entwurf',()=>{
  const {app}=loadApp(),code='4006381333931';
  assert.equal(app.domain.barcodes.valid(code),true);assert.equal(app.catalogCorrectionRepository.lookup(code),null);
  app.productCatalog.packages[0].barcodeEan=code;
  const found=app.catalogCorrectionRepository.lookup(code);assert.equal(found.pack.id,app.productCatalog.packages[0].id);
  const draft=app.catalogCorrectionRepository.save({barcode:'12345670',kind:'unknown_barcode',note:'Neue Testpackung'});
  assert.equal(app.catalogCorrectionRepository.list()[0].status,'local-draft');
  app.catalogCorrectionRepository.remove(draft);assert.equal(app.catalogCorrectionRepository.list().length,0);
  assert.throws(()=>app.catalogCorrectionRepository.save({barcode:'123',kind:'other',note:'Ungültig'}));
});

test('Lokale Börse unterstützt Suche, eigene Lifecycle-Aktionen, Chat, Melden und Blockieren',()=>{
  const {app}=loadApp(),repo=app.marketplaceRepository;
  const id=repo.save({mode:'Verkaufen',title:'Test Größe 5',description:'Nur lokal',condition:'Original verschlossen',count:22,priceText:'5 €',delivery:'Abholung',region:'Hoyerswerda'});
  assert.equal(repo.list({onlyMine:true})[0].id,id);repo.setStatus(id,'reserved');
  repo.save({id,title:'Test Größe 5 · reserviert'});
  assert.equal(repo.list({query:'reserviert'})[0].status,'reserved');repo.send(id,'Ist noch da.');assert.equal(repo.messages(id).at(-1).text,'Ist noch da.');
  const external=repo.list().find(item=>item.ownerId!=='local-user');repo.report(external.id,{reason:'misleading',note:'Lokaler Test'});repo.block(external.id);
  assert.equal(repo.list().some(item=>item.ownerId===external.ownerId),false);repo.unblock(external.ownerId);assert.equal(repo.list().some(item=>item.id===external.id),true);
  repo.remove(id);assert.equal(repo.list({onlyMine:true}).length,0);
});

test('Direktstart enthält Accessibility-Basis und neue lokale Verwaltungsdialoge',()=>{
  const t=loadApp();assert.match(t.html,/class="skip-link"/);assert.match(t.html,/aria-live="polite"/);
  t.click('route',{route:'diapers'});t.click('manage-sets');assert.match(t.elements.get('modalRoot').innerHTML,/Windelsets für Emma/);
  t.click('route',{route:'profile'});t.click('reminder-settings');assert.match(t.elements.get('modalRoot').innerHTML,/Erinnerungen fein einstellen/);
  t.click('route',{route:'market'});t.click('market-search');assert.match(t.elements.get('modalRoot').innerHTML,/Börse durchsuchen/);
});
