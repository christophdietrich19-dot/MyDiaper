(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const domain = app.domain = app.domain || {};
  const clone = value => JSON.parse(JSON.stringify(value));
  function id(prefix){
    const random = root.crypto && root.crypto.randomUUID ? root.crypto.randomUUID() :
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${random}`;
  }
  function purpose(label){
    return ({Windel:'day', Tageswindel:'day', Pants:'pants', Nachtwindel:'night', Schwimmwindel:'swim'})[label] || 'custom';
  }
  function labels(types){
    const result = [...new Set((types || []).map(x => String(x).trim()).filter(Boolean))];
    return result.length ? result : ['Windel'];
  }
  function assertState(state){
    if(!state || state.schemaVersion !== 2) throw new Error('Unbekannte Datenversion.');
    const names = ['children','diaperSets','inventoryLots','fitChecks','productExperiences','usageEvents'];
    for(const name of names){
      if(!Array.isArray(state[name])) throw new Error(`Ungültige Daten: ${name}.`);
      const ids = new Set();
      for(const record of state[name]){
        if(!record || typeof record.id !== 'string' || !record.id || ids.has(record.id)) throw new Error(`Ungültige oder doppelte ID: ${name}.`);
        ids.add(record.id);
      }
    }
    const childIds = new Set(state.children.map(c => c.id));
    if(!childIds.has(state.activeChildId)) throw new Error('Aktives Kind fehlt.');
    for(const child of state.children){
      if(typeof child.name !== 'string' || !child.name.trim() || !Number.isFinite(child.weight) || child.weight <= 0 ||
         !Number.isFinite(child.height) || child.height <= 0) throw new Error('Ungültiges Kinderprofil.');
      const primary = state.diaperSets.filter(s => s.childId === child.id && s.active && s.isPrimary);
      if(primary.length !== 1) throw new Error('Jedes Kind braucht genau ein aktives Hauptset.');
    }
    for(const set of state.diaperSets){
      if(!childIds.has(set.childId) || typeof set.label !== 'string' || !set.label.trim() ||
         typeof set.size !== 'string' || !set.size.trim()) throw new Error('Ungültiges Windelset.');
      domain.inventory.dailyUse(set.dailyUse);
    }
    for(const name of ['inventoryLots','fitChecks','productExperiences','usageEvents']){
      for(const record of state[name]){
        if(!childIds.has(record.childId)) throw new Error('Kind für Datensatz fehlt.');
        const nullable = name === 'fitChecks' || name === 'productExperiences';
        if(nullable && record.setId == null) continue;
        const set = state.diaperSets.find(s => s.id === record.setId && s.childId === record.childId);
        if(!set) throw new Error('Datensatz und Windelset gehören nicht zum selben Kind.');
      }
    }
    for(const lot of state.inventoryLots){
      domain.inventory.units(lot.initialUnits);
      domain.inventory.units(lot.remainingUnits);
      if(lot.remainingUnits > lot.initialUnits) throw new Error('Restbestand übersteigt den ursprünglichen Bestand.');
    }
    for(const event of state.usageEvents) domain.inventory.units(event.quantity);
    return state;
  }
  function migrate(input, defaults){
    if(input && input.schemaVersion === 2) return assertState(clone(input));
    if(input && input.schemaVersion != null && input.schemaVersion !== 1) throw new Error('Diese Datenversion wird noch nicht unterstützt.');
    const legacy = Object.assign(clone(defaults), clone(input || {}));
    const state = {...legacy, schemaVersion:2, diaperSets:[], inventoryLots:[], fitChecks:[], productExperiences:[], usageEvents:[]};
    state.settings = {...clone(defaults.settings), ...legacy.settings,
      reminders:{...defaults.settings.reminders, ...(legacy.settings || {}).reminders}};
    state.children = legacy.children.map(child => {
      const {currentBrand, currentLine, currentSize, stock, dailyUse, types, ...profile} = child;
      labels(types).forEach((label, index) => {
        const setId = `set_${child.id}_${index}`;
        state.diaperSets.push({id:setId, childId:child.id, label, purpose:purpose(label), active:true,
          isPrimary:index === 0, brand:currentBrand || '', line:currentLine || '', size:String(currentSize || '3'),
          productSizeId:null, dailyUse:index === 0 ? dailyUse : 0});
        if(index === 0){
          state.inventoryLots.push({id:`lot_${child.id}_legacy`, childId:child.id, setId,
            initialUnits:stock, remainingUnits:stock, productSizeId:null, source:'migration'});
          const fit = legacy.fitChecks && legacy.fitChecks[child.id];
          if(fit) state.fitChecks.push({...clone(fit), id:`fit_${child.id}_legacy`, childId:child.id, setId,
            productSizeId:null, weightKgSnapshot:null, answers:null, code:'legacy', createdAt:fit.at || null});
        }
      });
      return profile;
    });
    if(!state.children.some(c => c.id === state.activeChildId)) state.activeChildId = state.children[0] && state.children[0].id;
    return assertState(state);
  }
  domain.model = {clone, id, purpose, labels, assertState, migrate};
  if(typeof module !== 'undefined' && module.exports) module.exports = domain.model;
})(globalThis);
