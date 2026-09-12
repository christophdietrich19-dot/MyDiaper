const test=require('node:test');
const assert=require('node:assert/strict');
const personalization=require('../js/domain/personalization.js');

const fit={code:'observe',result:'Aktuelle Größe weiter beobachten',note:'Passt aktuell.'};
const set={id:'day',purpose:'day'};

test('Produkterfahrungen werden normalisiert und ungültige Bewertungen abgewiesen',()=>{
  assert.deepEqual(personalization.normalizeExperience({fitRating:'5',leakRating:4,sizeTendency:'normal',avoidRecommendation:false,notes:'  Passt gut  '}),{fitRating:5,leakRating:4,sizeTendency:'normal',avoidRecommendation:false,notes:'Passt gut'});
  for(const value of [0,6,2.5,NaN,'x']) assert.throws(()=>personalization.normalizeExperience({fitRating:value}),/1 und 5/);
  assert.throws(()=>personalization.normalizeExperience({sizeTendency:'maybe'}),/Größenwirkung/);
  assert.throws(()=>personalization.normalizeExperience({avoidRecommendation:'false'}),/Empfehlungseinstellung/);
});

test('Prioritäten erzeugen nachvollziehbare Hinweise ohne die Größenregel zu verändern',()=>{
  const result=personalization.summarize({ageBand:'7–12',weight:8.4,recommendedSize:'3',priorities:['skin','fit','skin'],fit,set,experiences:[]});
  assert.equal(result.confidenceLabel,'Basis-Richtwert');
  assert.equal(result.tips.length,2);
  assert.match(result.reasons[0],/Größe 3/);
  assert.match(result.reasons[1],/nicht allein/);
  assert.equal(result.latestExperience,null);
});

test('Nur Erfahrungen des ausgewählten Sets fließen in das persönliche Ergebnis ein',()=>{
  const result=personalization.summarize({ageBand:'12+',weight:13,recommendedSize:'5',priorities:['absorb'],fit,set,experiences:[
    {id:'foreign',setId:'night',fitRating:1,avoidRecommendation:true,updatedAt:'2026-09-12T12:00:00Z'},
    {id:'own',setId:'day',fitRating:5,leakRating:4,nightRating:4,skinComfortRating:5,sizeTendency:'normal',productSnapshot:{brand:'Demo',line:'Soft'},updatedAt:'2026-09-11T12:00:00Z'}
  ]});
  assert.equal(result.latestExperience.id,'own');
  assert.equal(result.confidenceLabel,'Mit persönlicher Erfahrung');
  assert.equal(result.experience.tone,'positive');
  assert.match(result.experience.note,/4,5 von 5/);
});

test('Persönlich ausgeschlossene Produkte werden klar zurückgestellt',()=>{
  const result=personalization.summarize({ageBand:'4–6',weight:7,recommendedSize:'2',priorities:[],fit,set,experiences:[{id:'own',setId:'day',avoidRecommendation:true,notes:'Lief häufig aus.',productSnapshot:{brand:'Demo'},updatedAt:'2026-09-12T12:00:00Z'}]});
  assert.equal(result.experience.tone,'warning');
  assert.match(result.experience.title,/ausgeschlossen/);
  assert.match(result.experience.note,/Lief häufig aus/);
});
