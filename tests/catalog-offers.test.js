const test=require('node:test');
const assert=require('node:assert/strict');
const {loadApp,plain}=require('./helpers.cjs');

test('Produktkatalog löst Marken, Größen und Packungen über stabile IDs auf',()=>{
  const {app}=loadApp(),catalog=app.domain.catalog;
  const found=catalog.findProductSize(app.productCatalog,{brand:'Pampers',line:'Baby-Dry',size:'4'});
  assert.equal(found.id,'size-pampers-baby-dry-4');
  const details=catalog.details(app.productCatalog,found.id);
  assert.equal(details.brand.name,'Pampers');
  assert.equal(details.product.name,'Baby-Dry');
  assert.deepEqual(plain(details.packages.map(pack=>pack.unitsPerPack).sort((a,b)=>a-b)),[74,76]);
  assert.equal(app.productCatalog.source.kind,'demo');
});

test('Katalogempfehlungen filtern Kategorie und persönliche Ausschlüsse',()=>{
  const {app}=loadApp(),catalog=app.domain.catalog;
  const all=catalog.candidates(app.productCatalog,{size:'5',purpose:'pants',priorities:['fit'],experiences:[]});
  assert.ok(all.length>=2);
  assert.ok(all.every(item=>item.category==='pants'));
  const excluded=all[0].productSizeId;
  const filtered=catalog.candidates(app.productCatalog,{size:'5',purpose:'pants',priorities:['fit'],experiences:[{productSizeId:excluded,avoidRecommendation:true,updatedAt:'2026-09-12T00:00:00Z'}]});
  assert.ok(!filtered.some(item=>item.productSizeId===excluded));
});

test('OfferProvider normalisiert kontrollierte Imports und trennt lokal von online',()=>{
  const {app}=loadApp(),services=app.services.offers;
  const provider=services.staticProvider({key:'test-import',label:'Testimport',sourceType:'import',offers:[
    {id:'import-local',scope:'local',store:'Testmarkt',productPackageId:'package-pampers-babydry-4-74',price:14.8,verifiedAt:'2026-09-11T10:00:00Z'},
    {id:'import-online',scope:'online',store:'Testshop',productPackageId:'package-pampers-babydry-4-76',price:16.5,shippingPrice:2,verifiedAt:'2026-09-01T10:00:00Z'}
  ]});
  const service=services.createOfferService({providers:[provider],catalog:app.productCatalog});
  const local=service.search({scope:'local'}),online=service.search({scope:'online'});
  assert.equal(local.length,1);assert.equal(online.length,1);
  assert.equal(local[0].count,74);assert.equal(local[0].productSizeId,'size-pampers-baby-dry-4');
  assert.equal(app.domain.pricing.offerUnitPrice(online[0]),18.5/76);
  assert.equal(app.domain.offers.freshness(local[0],new Date('2026-09-12T10:00:00Z')).status,'fresh');
  assert.equal(app.domain.offers.freshness(online[0],new Date('2026-09-12T10:00:00Z')).status,'stale');
});

test('Preisalarme sind kindbezogen, validiert und vergleichen exakte Produktgrößen',()=>{
  const {app}=loadApp(),repo=app.offerRepository,offer=app.offerService.getById('reference-dm');
  const id=repo.saveAlert('emma',{productSizeId:offer.productSizeId,maxUnitPrice:0.25,scope:'local',enabled:true});
  assert.equal(repo.matchingAlerts('emma',offer)[0].id,id);
  assert.equal(repo.matchingAlerts('leo',offer).length,0);
  assert.throws(()=>repo.saveAlert('emma',{productSizeId:offer.productSizeId,maxUnitPrice:0,scope:'local',enabled:true}));
  assert.throws(()=>repo.saveAlert('missing',{productSizeId:offer.productSizeId,maxUnitPrice:0.25,scope:'local',enabled:true}));
  assert.equal(app.store.get().priceAlerts.length,1);
  repo.removeAlert('emma',id);
  assert.deepEqual(plain(repo.listAlerts('emma')),[]);
});
