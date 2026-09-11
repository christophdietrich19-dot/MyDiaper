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
  assert.match(t.elements.get('app').innerHTML,/Beispielkarte · Berlin/);
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
