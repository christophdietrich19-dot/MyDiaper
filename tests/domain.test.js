const test = require('node:test');
const assert = require('node:assert/strict');
const pricing = require('../js/domain/pricing.js');
const inventory = require('../js/domain/inventory.js');
const sizes = require('../js/domain/sizes.js');
const fit = require('../js/domain/fit-check.js');
const {loadApp} = require('./helpers.cjs');

test('Preis pro Windel berücksichtigt bekannte Versandkosten und rundet nicht vorzeitig', () => {
  assert.equal(pricing.pricePerDiaper(12, 60), 0.2);
  assert.equal(pricing.pricePerDiaper(12, 60, 3), 0.25);
  assert.equal(pricing.pricePerDiaper(17.95, 74), 17.95 / 74);
  assert.equal(pricing.pricePerDiaper(0, 30), 0);
  assert.equal(pricing.offerUnitPrice({price:12,count:60,shipping:'Ab 49 € frei'}), 0.2);
});
test('Ungültige Preise, Stückzahlen und Versandkosten ergeben keinen scheinbaren Stückpreis', () => {
  for(const args of [[-1,20],[12,0],[12,-2],[12,1.5],[NaN,20],[Infinity,20],[12,20,-1],[12,20,null]]){
    assert.equal(pricing.pricePerDiaper(...args), null);
  }
});
test('Angebote werden anhand ungerundeter Stückpreise sortiert', () => {
  const offers = [{price:9.1,count:50},{price:9,count:50},{price:1,count:0}];
  assert.equal(offers.sort(pricing.compareOffers)[0].price, 9);
  assert.equal(offers[2].count, 0);
});
test('Vorratsreichweite: volle Tage, leere Bestände, Teilverbrauch und unbekannter Verbrauch', () => {
  assert.equal(inventory.daysRemaining(36, 6), 6);
  assert.equal(inventory.daysRemaining(17, 5), 3);
  assert.equal(inventory.daysRemaining(1, 6), 0);
  assert.equal(inventory.daysRemaining(3, 0.5), 6);
  assert.equal(inventory.daysRemaining(0, 0), 0);
  assert.equal(inventory.daysRemaining(12, 0), null);
  assert.throws(() => inventory.daysRemaining(-1, 5));
  assert.throws(() => inventory.daysRemaining(10, -1));
  assert.throws(() => inventory.daysRemaining(10, NaN));
});
test('Bestand ist immer nach Kind UND Set gefiltert; FIFO verändert keine anderen Bestände', () => {
  const lots = [{childId:'a',setId:'day',remainingUnits:3},{childId:'a',setId:'day',remainingUnits:10},
    {childId:'a',setId:'night',remainingUnits:7},{childId:'b',setId:'day',remainingUnits:20}];
  assert.equal(inventory.stockFor(lots, 'a', 'day'), 13);
  assert.equal(inventory.consume(lots, 'a', 'day', 5), 5);
  assert.deepEqual(lots.map(l=>l.remainingUnits), [0,8,7,20]);
  assert.equal(inventory.consume(lots, 'a', 'day', 100), 8);
  assert.throws(() => inventory.summary(lots, 'a', {id:'day',childId:'b',dailyUse:5}));
});
test('Größenempfehlung erhält Demo-Regeln, inklusive Grenzen und überlappender Bereiche', () => {
  const guide = loadApp().app.catalog.sizeGuide;
  for(const [weight, expected] of [[1,'0'],[2,'0'],[4,'1'],[8,'2'],[8.4,'3'],[9,'3'],[11.5,'4+'],[13.8,'5'],[25,'8'],[26,'8+']]){
    assert.equal(sizes.recommendSize(weight, guide), expected, `Gewicht ${weight}`);
  }
  for(const weight of [null,NaN,Infinity,0,-1,'8']) assert.equal(sizes.recommendSize(weight, guide), null);
  assert.equal(sizes.recommendSize(8, []), null);
});
test('Fit-Check: beobachten, Nachtproblem, größere Größe; Passform hat Vorrang vor Nacht', () => {
  const normal = {leak:'no',marks:'no',closure:'good',night:'no'};
  assert.equal(fit.evaluate(normal,'3').code, 'observe');
  assert.equal(fit.evaluate({...normal,leak:'yes'},'3').code, 'observe');
  assert.equal(fit.evaluate({...normal,night:'yes'},'3').code, 'check_night');
  assert.equal(fit.evaluate({...normal,marks:'yes',leak:'yes'},'3').code, 'try_larger');
  assert.equal(fit.evaluate({...normal,marks:'yes',closure:'tight',night:'yes'},'3').score, 4);
  assert.equal(fit.evaluate({...normal,marks:'yes',closure:'tight',night:'yes'},'3').code, 'try_larger');
  assert.throws(() => fit.evaluate({},'3'));
  assert.throws(() => fit.evaluate({...normal,night:'maybe'},'3'));
});
