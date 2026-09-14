(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const domain = app.domain = app.domain || {};
  function units(value, label = 'Stückzahl'){
    if(!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} muss eine nichtnegative ganze Zahl sein.`);
    return value;
  }
  function dailyUse(value){
    if(!Number.isFinite(value) || value < 0 || value > 20) throw new Error('Verbrauch muss zwischen 0 und 20 liegen.');
    return value;
  }
  function daysRemaining(stock, use){
    units(stock); dailyUse(use);
    if(stock === 0) return 0;
    return use === 0 ? null : Math.floor(stock / use);
  }
  function stockFor(lots, childId, setId){
    return lots.filter(lot => lot.childId === childId && lot.setId === setId)
      .reduce((sum, lot) => units(sum + units(lot.remainingUnits)), 0);
  }
  function forChild(lots,childId){
    const relevant=(lots||[]).filter(lot=>lot.childId===childId);
    const bySet={},byLocation={};let total=0;
    for(const lot of relevant){const value=units(lot.remainingUnits);total+=value;bySet[lot.setId]=(bySet[lot.setId]||0)+value;byLocation[lot.storageLocation||'Zuhause']=(byLocation[lot.storageLocation||'Zuhause']||0)+value;}
    return {total,bySet,byLocation};
  }
  function summary(lots, childId, set){
    if(!set || set.childId !== childId) throw new Error('Windelset gehört nicht zu diesem Kind.');
    const stock = stockFor(lots, childId, set.id);
    const days = daysRemaining(stock, set.dailyUse);
    return {stock, dailyUse:set.dailyUse, days, lowStock:days !== null && days <= 4,
      progress:Math.min(100, stock)};
  }
  // FIFO within one child's set. The caller owns the transaction and event log.
  function consume(lots, childId, setId, quantity){
    units(quantity);
    let pending = Math.min(quantity, stockFor(lots, childId, setId));
    const consumed = pending;
    for(const lot of lots){
      if(lot.childId !== childId || lot.setId !== setId) continue;
      const take = Math.min(lot.remainingUnits, pending);
      lot.remainingUnits -= take;
      pending -= take;
      if(!pending) break;
    }
    return consumed;
  }
  function consumeDetailed(lots,childId,setId,quantity){
    units(quantity);let pending=Math.min(quantity,stockFor(lots,childId,setId));const consumed=pending,consumptions=[];
    for(const lot of lots){if(lot.childId!==childId||lot.setId!==setId||!pending)continue;const take=Math.min(lot.remainingUnits,pending);if(take){lot.remainingUnits-=take;consumptions.push({lotId:lot.id,quantity:take});pending-=take;}}
    return {quantity:consumed-pending,consumptions};
  }
  function restore(lots,childId,setId,consumptions){
    let restored=0;for(const item of consumptions||[]){const lot=lots.find(entry=>entry.id===item.lotId&&entry.childId===childId&&entry.setId===setId);if(!lot)continue;const room=lot.initialUnits-lot.remainingUnits,take=Math.min(room,units(Number(item.quantity)));lot.remainingUnits+=take;restored+=take;}return restored;
  }
  domain.inventory = {units, dailyUse, daysRemaining, stockFor,forChild, summary, consume,consumeDetailed,restore};
  if(typeof module !== 'undefined' && module.exports) module.exports = domain.inventory;
})(globalThis);
