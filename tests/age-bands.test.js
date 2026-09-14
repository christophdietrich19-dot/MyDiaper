const test=require('node:test');
const assert=require('node:assert/strict');
const ages=require('../js/domain/age-bands.js');

test('Altersstufen reichen detailliert bis vier, nachts bis sechs und bleiben danach offen',()=>{
  assert.deepEqual(ages.all().map(band=>band.id),['0-3m','4-6m','7-12m','1-2y','2-3y','3-4y','4-6y','6plus']);
  assert.equal(ages.fromMonths(3).id,'0-3m');
  assert.equal(ages.fromMonths(4).id,'4-6m');
  assert.equal(ages.fromMonths(12).id,'7-12m');
  assert.equal(ages.fromMonths(23).id,'1-2y');
  assert.equal(ages.fromMonths(35).id,'2-3y');
  assert.equal(ages.fromMonths(47).id,'3-4y');
  assert.equal(ages.fromMonths(71).id,'4-6y');
  assert.equal(ages.fromMonths(72).id,'6plus');
  assert.equal(ages.get('4-6y').context,'Nacht');
});

test('Altersstufe wird am Kalendermonat korrekt aus dem Geburtsdatum abgeleitet',()=>{
  const now=new Date('2026-09-14T12:00:00Z');
  assert.equal(ages.monthsFromBirthdate('2022-09-15',now),47);
  assert.equal(ages.fromBirthdate('2022-09-14',now).id,'4-6y');
  assert.equal(ages.fromBirthdate('2020-09-14',now).id,'6plus');
  assert.equal(ages.fromBirthdate('',now).id,'0-3m');
  assert.equal(ages.fromMonths(-1),null);
});
