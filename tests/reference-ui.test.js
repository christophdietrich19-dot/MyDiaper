const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadApp,plain,root}=require('./helpers.cjs');

test('Finder durchläuft vier Schritte ohne Profile oder Bestände zu verändern',()=>{
  const t=loadApp(),before=plain(t.app.store.get());
  t.click('route',{route:'finder'});
  assert.match(t.elements.get('app').innerHTML,/Schritt 1 von 4/);
  t.click('finder-choice',{field:'weightBand',value:'5–8'});
  t.click('finder-next');
  t.context.document.getElementById('finderWeight').value='7.5';
  t.click('finder-next');
  t.click('finder-choice',{field:'night',value:'yes'});
  t.click('finder-next');
  const html=t.elements.get('app').innerHTML;
  assert.match(html,/Schritt 4 von 4/);
  assert.match(html,/7,5 kg/);
  assert.doesNotMatch(html,/NaN|undefined/);
  assert.deepEqual(plain(t.app.store.get()),before);
});

test('Finder zeigt erweiterte Altersstufen bis sechs Jahre ohne feste Obergrenze',()=>{
  const t=loadApp();t.click('route',{route:'finder'});
  const html=t.elements.get('app').innerHTML;
  for(const value of ['1–2','2–3','3–4','4–6','6+'])assert.ok(html.includes(value),value);
  assert.match(html,/Nachtwindeln zusätzlich bis 6 Jahre/);
  t.click('finder-choice',{field:'age',value:'4-6y'});
  assert.equal(t.app.finder.state(t.app.repository.viewChild('emma')).age,'4-6y');
});

test('Finder-Entwürfe bleiben pro Kind getrennt und Profilcheck verwendet das gewählte Set',()=>{
  const t=loadApp(),repo=t.app.repository,originalWeight=repo.viewChild('emma').weight;
  t.click('route',{route:'finder'});
  t.click('finder-choice',{field:'weightBand',value:'< 5'});
  t.click('finder-next');
  t.click('switch-child',{id:'leo'});
  const night=repo.listSets('leo')[1].id;
  t.click('finder-choice',{field:'setId',value:night});
  t.click('finder-choice',{field:'weightBand',value:'11+'});
  t.click('finder-profile-check');
  assert.match(t.elements.get('modalRoot').innerHTML,new RegExp(`data-set-id="${night}"`));
  assert.match(t.elements.get('modalRoot').innerHTML,/data-child-id="leo"/);
  t.click('switch-child',{id:'emma'});
  const d=t.app.finder.state(repo.viewChild('emma'));
  assert.equal(d.step,2);
  assert.equal(d.weight,4);
  assert.equal(repo.viewChild('emma').weight,originalWeight);
});

test('Finder weist ungültiges Gewicht zurück und bleibt im zweiten Schritt',()=>{
  const t=loadApp();t.click('route',{route:'finder'});t.click('finder-next');
  t.context.document.getElementById('finderWeight').value='';t.click('finder-next');
  assert.match(t.elements.get('app').innerHTML,/Schritt 2 von 4/);
  assert.match(t.elements.get('toastRoot').children.at(-1).textContent,/Gewicht/);
});

test('Karte, Gesamtliste, Online-Angebote, Suche und Favoriten funktionieren',()=>{
  const t=loadApp();t.click('route',{route:'offers'});
  assert.match(t.elements.get('app').innerHTML,/Echte Karte · keine erfundenen Händlerpins/);
  t.click('map-store',{id:'reference-rossmann'});
  assert.match(t.elements.get('app').innerHTML,/deal-description"><h3>HiPP/);
  t.click('favorite-offer',{id:'reference-rossmann'});
  assert.deepEqual(plain(t.app.store.get().settings.favoriteOfferIds),['reference-rossmann']);
  t.click('favorite-offer',{id:'reference-rossmann'});
  assert.deepEqual(plain(t.app.store.get().settings.favoriteOfferIds),[]);
  t.click('offer-view',{view:'list'});
  for(const o of t.app.catalog.offers.local) assert.ok(t.elements.get('app').innerHTML.includes(o.id));
  t.submit('offerSearchForm',{query:'HIPP'});
  assert.match(t.elements.get('app').innerHTML,/HiPP Babysanft/);
  assert.doesNotMatch(t.elements.get('app').innerHTML,/Pampers Baby-Dry/);
  t.submit('offerSearchForm',{query:''});t.click('offer-tab',{mode:'online'});
  assert.match(t.elements.get('app').innerHTML,/Online-Angebote/);
  assert.doesNotMatch(t.elements.get('app').innerHTML,/nearby-map|NaN|undefined/);
});

test('Identische Hinweise werden nicht gestapelt',()=>{
  const t=loadApp();
  t.click('map-store',{id:'unavailable'});
  t.click('map-store',{id:'unavailable'});
  t.click('map-store',{id:'unavailable'});
  assert.equal(t.elements.get('toastRoot').children.length,1);
  assert.match(t.elements.get('toastRoot').children[0].textContent,/keine Demo-Angebote/);
});

test('Navigation aus einem Tipp schließt das Modal; Kinderwechsel ist weiter erreichbar',()=>{
  const t=loadApp();t.click('tips');t.click('route',{route:'finder'});
  assert.equal(t.elements.get('modalRoot').innerHTML,'');
  t.click('route',{route:'today'});t.click('family-picker');
  assert.match(t.elements.get('modalRoot').innerHTML,/Emma/);
  assert.match(t.elements.get('modalRoot').innerHTML,/Leo/);
});

test('Alle lokalen Designressourcen existieren und sind im Offline-Cache',()=>{
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const match of sw.matchAll(/'\.\/([^']+)'/g)) assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);
  for(const asset of ['css/reference.css','assets/fonts/nunito-regular.ttf','assets/fonts/nunito-semibold.ttf','assets/fonts/nunito-bold.ttf','assets/fonts/caveat-medium.ttf','assets/images/design-reference.png','assets/images/sleeping-baby.png','assets/images/elephant.png']) assert.ok(sw.includes(`'./${asset}'`),asset);
});

test('Profilfarbe ist frei wählbar und steuert Avatar sowie Startkarten-Akzent',()=>{
  const t=loadApp(),child=t.app.repository.viewChild('emma');
  t.click('route',{route:'profile'});t.click('edit-specific-child',{id:'emma'});
  assert.match(t.elements.get('modalRoot').innerHTML,/Profilfarbe/);
  assert.match(t.elements.get('modalRoot').innerHTML,/nicht an ein Geschlecht gekoppelt/);
  t.submit('childForm',{name:child.name,birthdate:child.birthdate,weight:String(child.weight),height:String(child.height),color:'sun',brand:child.currentBrand,size:child.currentSize,dailyUse:String(child.dailyUse),stock:String(child.stock),types:child.types.join(', ')},{id:'emma'});
  assert.equal(t.app.repository.viewChild('emma').color,'sun');
  t.click('route',{route:'today'});
  assert.match(t.elements.get('app').innerHTML,/today-hero theme-sun/);
});

test('Erfahrungseditor speichert Bewertungen eindeutig für Kind und Set',()=>{
  const t=loadApp(),repo=t.app.repository,child=repo.viewChild('emma');
  t.click('route',{route:'diapers'});t.click('experience-add');
  assert.match(t.elements.get('modalRoot').innerHTML,/Erfahrung gilt nur für dieses Kind|gilt nur für dieses Kind/);
  t.submit('experienceForm',{fitRating:'5',leakRating:'4',nightRating:'3',skinComfortRating:'5',sizeTendency:'normal',avoidRecommendation:null,notes:'Sehr weich.'},{childId:child.id,setId:child.setId,id:''});
  const saved=repo.listExperiences('emma')[0];
  assert.equal(saved.fitRating,5);
  assert.equal(saved.notes,'Sehr weich.');
  assert.equal(repo.listExperiences('leo').length,0);
  assert.match(t.elements.get('app').innerHTML,/4,3/);
});

test('Offener Erfahrungsdialog behält sein ursprüngliches Kind und Set',()=>{
  const t=loadApp(),repo=t.app.repository,emma=repo.viewChild('emma');
  t.click('route',{route:'diapers'});t.click('experience-add');t.click('switch-child',{id:'leo'});
  t.submit('experienceForm',{fitRating:'2',leakRating:'2',nightRating:'1',skinComfortRating:'3',sizeTendency:'small',avoidRecommendation:'on',notes:'Für Emma.'},{childId:emma.id,setId:emma.setId,id:''});
  assert.equal(repo.listExperiences('emma').length,1);
  assert.equal(repo.listExperiences('emma')[0].avoidRecommendation,true);
  assert.equal(repo.listExperiences('leo').length,0);
});

test('Finder zeigt gespeicherte Erfahrung und ausgewählte Wünsche im Ergebnis',()=>{
  const t=loadApp(),repo=t.app.repository,emma=repo.viewChild('emma');
  repo.saveExperience('emma',emma.setId,{fitRating:5,leakRating:5,nightRating:4,skinComfortRating:5,sizeTendency:'normal',avoidRecommendation:false,notes:'Bewährt.'});
  t.click('route',{route:'finder'});t.click('finder-choice',{field:'priority',value:'fit'});t.click('finder-next');t.click('finder-next');t.click('finder-next');
  const html=t.elements.get('app').innerHTML;
  assert.match(html,/Mit persönlicher Erfahrung/);
  assert.match(html,/Bisher gute persönliche Erfahrung/);
  assert.match(html,/Hautverträglichkeit/);
  assert.match(html,/druckfreien Sitz/);
});

test('Windeln, Börse und Profil nutzen die neue Referenzgestaltung ohne Funktionsverlust',()=>{
  const t=loadApp();
  for(const [route,expected] of [['diapers','Produkterfahrung'],['market','Windeln finden'],['profile','Alles Persönliche']]){
    t.click('route',{route});const html=t.elements.get('app').innerHTML;
    assert.match(html,new RegExp(expected));assert.doesNotMatch(html,/NaN|undefined/);
  }
  t.click('route',{route:'market'});t.click('market-tab',{mode:'Verschenken'});
  assert.match(t.elements.get('app').innerHTML,/Lupilu Pants/);
  assert.doesNotMatch(t.elements.get('app').innerHTML,/Pampers Premium Protection Größe 3/);
});

test('Produktkatalog ist im Windelbereich bedienbar und schreibt Größenhistorie',()=>{
  const t=loadApp(),repo=t.app.repository,emma=repo.viewChild('emma'),before=repo.listSizeHistory('emma',emma.setId).length;
  t.click('route',{route:'diapers'});
  assert.match(t.elements.get('app').innerHTML,/Interner Testkatalog/);
  assert.match(t.elements.get('app').innerHTML,/Produkte für Größe 3/);
  t.click('catalog-assign',{id:'size-pampers-baby-dry-4'});
  const changed=repo.viewChild('emma');
  assert.equal(changed.currentLine,'Baby-Dry');
  assert.equal(changed.currentSize,'4');
  assert.equal(repo.listSizeHistory('emma',emma.setId).length,before+1);
  assert.match(t.elements.get('app').innerHTML,/Produkte für Größe 4/);
});

test('Preisalarm-Dialog speichert eine kindbezogene Produkt- und Bereichsgrenze',()=>{
  const t=loadApp();t.click('route',{route:'offers'});t.click('price-alert',{id:'reference-dm'});
  const modal=t.elements.get('modalRoot').innerHTML;
  assert.match(modal,/Preisalarm anlegen/);
  assert.match(modal,/data-child-id="emma"/);
  assert.match(modal,/data-product-size-id="size-pampers-baby-dry-4"/);
  t.submit('priceAlertForm',{maxUnitPrice:'0.25',scope:'local'},{childId:'emma',productSizeId:'size-pampers-baby-dry-4',id:''});
  assert.equal(t.app.offerRepository.listAlerts('emma').length,1);
  assert.equal(t.app.offerRepository.listAlerts('leo').length,0);
  assert.match(t.elements.get('app').innerHTML,/Preisalarm erreicht/);
  t.click('manage-alerts');
  assert.match(t.elements.get('modalRoot').innerHTML,/bis 0,25 € pro Windel/);
});
