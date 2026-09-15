'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const feedback=require('../js/ui/feedback.js');
const offerMap=require('../js/ui/offer-map.js');

function styledElement(){
  const classes=new Set();
  return {style:{},classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value)},classes};
}

test('Modal-Sperre fixiert beide Dokumentebenen und stellt die Scrollposition wieder her',()=>{
  const html=styledElement(),body=styledElement(),calls=[];
  body.style.position='relative';
  const view={scrollY:347,scrollTo:value=>calls.push(value)};
  const lock=feedback.createPageLock({documentElement:html,body},view);
  lock.lock();lock.lock();
  assert.equal(lock.isLocked(),true);
  assert.equal(html.classList.contains('modal-open'),true);
  assert.equal(body.classList.contains('modal-open'),true);
  assert.equal(body.style.position,'fixed');
  assert.equal(body.style.top,'-347px');
  assert.equal(html.style.overflow,'hidden');
  lock.unlock();
  assert.equal(body.style.position,'relative');
  assert.equal(html.classList.contains('modal-open'),false);
  assert.deepEqual(calls,[{top:347,left:0,behavior:'instant'}]);
});

test('Toast-Verwaltung dedupliziert Meldungen, erneuert ihre Zeit und begrenzt die Anzahl',()=>{
  const timers=new Map();let next=0;
  const container={children:[],ownerDocument:{createElement(){
    const node={dataset:{},remove(){const index=container.children.indexOf(node);if(index>=0)container.children.splice(index,1);}};
    return node;
  }},appendChild(node){this.children.push(node);}};
  const toaster=feedback.createToaster(container,{limit:3,duration:100,setTimeout:callback=>{const id=++next;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)});
  const first=toaster.show('Gleicher Hinweis');
  const again=toaster.show('Gleicher Hinweis');
  assert.equal(first,again);
  assert.equal(toaster.count(),1);
  assert.equal(container.children.length,1);
  assert.equal(first.dataset.repeated,'1');
  toaster.show('Zwei');toaster.show('Drei');toaster.show('Vier');
  assert.equal(toaster.count(),3);
  assert.deepEqual(container.children.map(node=>node.textContent),['Zwei','Drei','Vier']);
});

test('Karte verwendet nur gelieferte Koordinaten und keine Berliner Ersatzpunkte',()=>{
  assert.equal(offerMap.coordinates({latitude:null,longitude:null}),null);
  assert.equal(offerMap.coordinates({latitude:'',longitude:''}),null);
  assert.equal(offerMap.coordinates({id:'reference-dm'}),null);
  assert.deepEqual(offerMap.coordinates({latitude:'52.52',longitude:'13.405'}),[52.52,13.405]);
  assert.equal(offerMap.coordinates({latitude:95,longitude:13.4}),null);
  assert.doesNotMatch(read('js/ui/offer-map.js'),/52\.5207|reference-dm.*\[/);
});

test('Sichtbare, Web- und native Versionswerte stammen synchron aus package.json',()=>{
  const pkg=JSON.parse(read('package.json'));
  const meta=require('../js/config/app-meta.js');
  const capacitor=JSON.parse(read('capacitor.config.json'));
  const publicVersion=pkg.version.replace(/-test$/,'');
  assert.equal(meta.packageVersion,pkg.version);
  assert.equal(meta.version,publicVersion);
  assert.equal(meta.androidVersionCode,pkg.mydiaper.androidVersionCode);
  assert.equal(meta.displayName,`MyDiaper Testversion ${publicVersion}`);
  assert.equal(capacitor.appName,meta.displayName);
  assert.match(read('android/app/build.gradle'),new RegExp(`versionCode ${meta.androidVersionCode}`));
  assert.match(read('android/app/build.gradle'),new RegExp(`versionName "${pkg.version}"`));
  assert.match(read('android/app/src/main/res/values/strings.xml'),new RegExp(meta.displayName));
  assert.doesNotMatch(read('ios/App/CapApp-SPM/Package.swift'),/path:\s*"[^"\r\n]*\\/);
  assert.doesNotMatch(read('js/features/profile.js'),/MyDiaper Testversion 1\./);
});
