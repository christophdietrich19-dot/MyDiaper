const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadApp,root} = require('./helpers.cjs');

test('Root-index lädt alle klassischen Skripte direkt; alle fünf Bereiche rendern', () => {
  const loaded=loadApp();
  assert.doesNotMatch(loaded.html,/type="module"/);
  assert.match(loaded.elements.get('app').innerHTML,/36 Windeln/);
  for(const [index,text] of [[0,'Schnellzugriff'],[1,'Finder, Fit-Check & Vorrat'],[2,'Angebote in deiner Nähe'],[3,'Verkaufen, tauschen'],[4,'Familie, Erinnerungen']]){
    loaded.nav[index].click(); assert.match(loaded.elements.get('app').innerHTML,new RegExp(text));
    assert.doesNotMatch(loaded.elements.get('app').innerHTML,/NaN|undefined/);
  }
});
test('Offenes Vorratsformular speichert nach Kinderwechsel weiterhin für sein ursprüngliches Kind und Set', () => {
  const loaded=loadApp(), {repository:repo}=loaded.app;
  loaded.click('edit-stock');
  const modal=loaded.elements.get('modalRoot').innerHTML;
  const childId=modal.match(/data-child-id="([^"]+)"/)[1], setId=modal.match(/data-set-id="([^"]+)"/)[1];
  loaded.click('switch-child',{id:'leo'});
  loaded.submit('stockForm',{brand:'Pampers',line:'Premium Protection',size:'3',stock:'22',dailyUse:'6'},{childId,setId});
  assert.equal(repo.viewChild('emma').stock,22);
  assert.equal(repo.viewChild('leo').stock,54);
});
test('Set-Auswahl bleibt pro Kind getrennt, Fit-Check und Verbrauch folgen dem gewählten Set', () => {
  const loaded=loadApp(), repo=loaded.app.repository;
  loaded.click('switch-child',{id:'leo'});
  const night=repo.listSets('leo')[1].id;
  loaded.click('select-set',{id:night});
  loaded.click('add-stock');
  assert.match(loaded.elements.get('modalRoot').innerHTML,new RegExp(`data-set-id="${night}"`));
  loaded.submit('addStockForm',{amount:'14'},{childId:'leo',setId:night});
  loaded.click('use-one');
  assert.equal(repo.viewChild('leo',night).stock,13);
  assert.equal(repo.viewChild('leo').stock,54);
  loaded.click('fit-check');
  assert.match(loaded.elements.get('modalRoot').innerHTML,new RegExp(`data-set-id="${night}"`));
  loaded.click('switch-child',{id:'emma'});
  loaded.submit('fitForm',{leak:'no',marks:'no',closure:'good',night:'yes'},{childId:'leo',setId:night});
  assert.equal(repo.listFitChecks('emma').length,0);
  assert.equal(repo.listFitChecks('leo',night).length,1);
  loaded.click('switch-child',{id:'leo'});
  loaded.click('use-one');
  assert.equal(repo.viewChild('leo',night).stock,12);
});
test('Neues Profil behält die vorhandene Formularfunktion und erhält getrennte Sets', () => {
  const loaded=loadApp();
  loaded.submit('childForm',{name:'Testkind',birthdate:'2026-01-01',weight:'6',height:'60',color:'sage',brand:'Pampers',size:'3',dailyUse:'6',stock:'30',types:'Windel, Nachtwindel'});
  const childId=loaded.app.store.get().activeChildId, repo=loaded.app.repository;
  assert.equal(repo.viewChild(childId).name,'Testkind');
  assert.equal(repo.viewChild(childId).stock,30);
  assert.equal(repo.viewChild(childId).currentLine,'Premium');
  assert.equal(repo.viewChild(childId).color,'sage');
  assert.equal(repo.listSets(childId).length,2);
  assert.equal(repo.viewChild('emma').stock,36);
});
test('Service Worker erfasst jedes Startskript und entfernt nur eigene veraltete Caches', () => {
  const loaded=loadApp(), sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const script of loaded.scripts) assert.ok(sw.includes(`'./${script}'`),script);
  assert.match(sw,/startsWith\('mydiaper-'\)/);
});
