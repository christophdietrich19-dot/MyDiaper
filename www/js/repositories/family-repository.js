(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const {model, inventory, sizes, fitCheck} = app.domain;
  function createFamilyRepository(store, guide){
    function childIn(state, childId){
      const child = state.children.find(c => c.id === childId);
      if(!child) throw new Error('Kinderprofil nicht gefunden.');
      return child;
    }
    function setIn(state, childId, setId, active = true){
      childIn(state, childId);
      const set = state.diaperSets.find(s => s.id === setId && s.childId === childId && (!active || s.active));
      if(!set) throw new Error('Windelset gehört nicht zu diesem Kind oder ist nicht aktiv.');
      return set;
    }
    function primaryIn(state, childId){
      childIn(state, childId);
      return state.diaperSets.find(s => s.childId === childId && s.active && s.isPrimary);
    }
    function listSets(childId, includeInactive = false){
      const state = store.get(); childIn(state, childId);
      return state.diaperSets.filter(s => s.childId === childId && (includeInactive || s.active));
    }
    function addLot(state, childId, setId, quantity, source){
      const set = setIn(state, childId, setId);
      inventory.units(quantity);
      if(quantity) state.inventoryLots.push({id:model.id('lot'), childId, setId, productSizeId:set.productSizeId,
        initialUnits:quantity, remainingUnits:quantity, source, createdAt:new Date().toISOString()});
    }
    function correctStock(state, childId, setId, quantity){
      setIn(state, childId, setId); inventory.units(quantity);
      const current = inventory.stockFor(state.inventoryLots, childId, setId);
      if(quantity > current) addLot(state, childId, setId, quantity - current, 'correction');
      else inventory.consume(state.inventoryLots, childId, setId, current - quantity);
    }
    function makeSet(childId, input, primary = false){
      return {id:model.id('set'), childId, label:input.label, purpose:model.purpose(input.label),
        brand:input.brand || '', line:input.line || '', size:String(input.size || '3'),
        dailyUse:input.dailyUse ?? 0, productSizeId:input.productSizeId ?? null, isPrimary:primary, active:true};
    }
    function viewChild(childId, setId){
      const state = store.get();
      const child = childIn(state, childId);
      const set = setId ? setIn(state, childId, setId) : primaryIn(state, childId);
      const stock = inventory.summary(state.inventoryLots, childId, set);
      // Legacy display fields are a projection, never duplicated in persisted profiles.
      return {...child, setId:set.id, setLabel:set.label, currentBrand:set.brand, currentLine:set.line,
        currentSize:set.size, ...stock, types:listSets(childId).map(s => s.label)};
    }
    function saveChildProfile(input){
      const childId = input.id || model.id('child');
      store.patch(state => {
        let child;
        const creating = !input.id;
        if(creating){
          child = {id:childId, color:['mint','blue','peach','lilac'][state.children.length % 4]};
          state.children.push(child);
        } else child = childIn(state, childId);
        Object.assign(child, {name:String(input.name).trim(), birthdate:input.birthdate || '', weight:input.weight, height:input.height});
        const wanted = model.labels(input.types);
        const former = creating ? null : primaryIn(state, childId);
        for(const set of state.diaperSets.filter(s => s.childId === childId)){
          set.active = wanted.includes(set.label);
          if(!set.active) set.isPrimary = false;
        }
        wanted.forEach(label => {
          if(!state.diaperSets.some(s => s.childId === childId && s.label === label && s.active)){
            state.diaperSets.push(makeSet(childId, {label, brand:input.brand, line:input.line ?? (former ? former.line : 'Premium'), size:input.size}));
          }
        });
        // A removed category retains its inventory and history under its original ID.
        const primary = former && former.active ? former : state.diaperSets.find(s => s.childId === childId && s.active);
        state.diaperSets.filter(s => s.childId === childId).forEach(s => s.isPrimary = s.id === primary.id);
        if(creating || primary === former){
          Object.assign(primary, {brand:input.brand, line:input.line ?? primary.line, size:String(input.size), dailyUse:input.dailyUse});
          correctStock(state, childId, primary.id, input.stock);
        }
        if(creating) state.activeChildId = childId;
      });
      return childId;
    }
    function createSet(childId, input){
      const set = makeSet(childId, input);
      store.patch(state => { childIn(state, childId); state.diaperSets.push(set); addLot(state, childId, set.id, input.stock ?? 0, 'manual'); });
      return set.id;
    }
    function updateSet(childId, setId, input){
      store.patch(state => {
        const set = setIn(state, childId, setId);
        // Identity and ownership are intentionally not copied from input.
        for(const key of ['brand','line','size','dailyUse']) if(input[key] !== undefined) set[key] = input[key];
        if(input.stock !== undefined) correctStock(state, childId, setId, input.stock);
      });
    }
    function addStock(childId, setId, quantity){ store.patch(state => addLot(state, childId, setId, quantity, 'manual')); }
    function consumeStock(childId, setId, quantity = 1){
      let consumed = 0;
      store.patch(state => {
        setIn(state, childId, setId);
        consumed = inventory.consume(state.inventoryLots, childId, setId, quantity);
        if(consumed) state.usageEvents.push({id:model.id('usage'), childId, setId, quantity:consumed,
          usedAt:new Date().toISOString(), source:'quick_action'});
      });
      return consumed;
    }
    function saveFitCheck(childId, setId, answers){
      const fitId = model.id('fit');
      store.patch(state => {
        const child = childIn(state, childId), set = setIn(state, childId, setId);
        const recommendedSize = sizes.recommendSize(child.weight, guide);
        state.fitChecks.push({id:fitId, childId, setId, productSizeId:set.productSizeId,
          productSnapshot:{brand:set.brand, line:set.line, size:set.size}, weightKgSnapshot:child.weight,
          answers:model.clone(answers), recommendation:{size:recommendedSize},
          ...fitCheck.evaluate(answers, recommendedSize), createdAt:new Date().toISOString()});
      });
      return fitId;
    }
    function listFitChecks(childId, setId){
      const state = store.get(); childIn(state, childId);
      if(setId) setIn(state, childId, setId, false);
      return state.fitChecks.filter(f => f.childId === childId && (!setId || f.setId === setId));
    }
    function saveExperience(childId, setId, input){
      const experienceId = input.id || model.id('experience');
      store.patch(state => {
        const set = setIn(state, childId, setId);
        let experience;
        if(input.id){
          experience = state.productExperiences.find(e => e.id === input.id && e.childId === childId && e.setId === setId);
          if(!experience) throw new Error('Produkterfahrung gehört nicht zu diesem Kind und Windelset.');
        } else {
          experience = {id:experienceId, childId, setId, productSizeId:set.productSizeId,
            productSnapshot:{brand:set.brand, line:set.line, size:set.size}, createdAt:new Date().toISOString()};
          state.productExperiences.push(experience);
        }
        for(const key of ['fitRating','leakRating','nightRating','skinComfortRating','sizeTendency','avoidRecommendation','notes']){
          if(input[key] !== undefined) experience[key] = model.clone(input[key]);
        }
        experience.updatedAt = new Date().toISOString();
      });
      return experienceId;
    }
    function listExperiences(childId){
      const state = store.get(); childIn(state, childId);
      return state.productExperiences.filter(e => e.childId === childId);
    }
    return {viewChild, listSets, saveChildProfile, createSet, updateSet, addStock, consumeStock,
      saveFitCheck, listFitChecks, saveExperience, listExperiences,
      switchChild:childId => store.patch(state => { childIn(state, childId); state.activeChildId = childId; })};
  }
  app.repositories = {createFamilyRepository};
  if(typeof module !== 'undefined' && module.exports) module.exports = app.repositories;
})(globalThis);
