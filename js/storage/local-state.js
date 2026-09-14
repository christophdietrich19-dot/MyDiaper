(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const KEY = 'mydiaper-v4-state';
  const PREVIOUS_KEY = 'mydiaper-v3-state';
  const LEGACY_KEY = 'mydiaper-v2-state';
  const FIRST_KEY = 'mydiaper-v1-state';
  function createStore(storage, defaults){
    const model = app.domain.model;
    const listeners = new Set();
    let state, memoryOnly = !storage, readOnly = false, warning = null;
    let current = null, previous = null, legacy = null, first = null, sourceKey = null;
    if(storage){
      try {
        current = storage.getItem(KEY);
        previous = current === null ? storage.getItem(PREVIOUS_KEY) : null;
        legacy = current === null && previous === null ? storage.getItem(LEGACY_KEY) : null;
        first = current === null && previous === null && legacy === null ? storage.getItem(FIRST_KEY) : null;
        sourceKey = current !== null ? KEY : previous !== null ? PREVIOUS_KEY : legacy !== null ? LEGACY_KEY : first !== null ? FIRST_KEY : null;
      }
      catch(error){ memoryOnly = true; }
    }
    try {
      const raw = current !== null ? current : previous !== null ? previous : legacy !== null ? legacy : first;
      const decoded = raw !== null ? JSON.parse(raw) : null;
      if(raw !== null && (!decoded || typeof decoded !== 'object' || Array.isArray(decoded))){
        throw new Error('Ungültiger gespeicherter Zustand.');
      }
      state = model.migrate(decoded, defaults);
    } catch(error){
      // Never overwrite unreadable or newer user data with the fallback demo.
      state = model.migrate(null, defaults);
      readOnly = true;
      warning = 'Gespeicherte Daten konnten nicht geladen werden. Sie bleiben unverändert; die Demo ist schreibgeschützt.';
    }
    if(memoryOnly) warning = 'Lokale Speicherung ist nicht verfügbar. Änderungen gelten nur für diese Sitzung.';
    if(sourceKey && sourceKey !== KEY && !readOnly && !memoryOnly){
      try { storage.setItem(KEY, JSON.stringify(state)); }
      catch(error){ readOnly = true; warning = 'Die Datenmigration konnte nicht gespeichert werden. Der bisherige Datenstand bleibt unverändert.'; }
    }
    function commit(next, resetting = false){
      if(readOnly && !resetting) throw new Error(warning);
      model.assertState(next);
      if(!memoryOnly){
        try { storage.setItem(KEY, JSON.stringify(next)); }
        catch(error){ throw new Error('Speichern fehlgeschlagen. Der bisherige Datenstand bleibt erhalten.'); }
      }
      state = next;
      if(resetting){ readOnly = false; warning = memoryOnly ? warning : null; }
      listeners.forEach(fn => fn(model.clone(state)));
    }
    return {
      get:() => model.clone(state),
      patch:fn => { const draft = model.clone(state); fn(draft); commit(draft); },
      save:() => commit(model.clone(state)),
      replace:next => commit(model.migrate(next, defaults), true),
      reset:() => commit(model.migrate(null, defaults), true),
      status:() => ({memoryOnly, readOnly, warning}),
      subscribe:fn => { listeners.add(fn); return () => listeners.delete(fn); }
    };
  }
  app.storage = {createStore, KEY, PREVIOUS_KEY, LEGACY_KEY, FIRST_KEY};
  if(typeof module !== 'undefined' && module.exports) module.exports = app.storage;
})(globalThis);
