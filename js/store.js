window.MyDiaper = window.MyDiaper || {};

(function(){
  let storage = null;
  try { storage = window.localStorage; } catch(error) { /* file:// may prohibit storage */ }
  MyDiaper.store = MyDiaper.storage.createStore(storage, MyDiaper.legacyDefaults);
  MyDiaper.repository = MyDiaper.repositories.createFamilyRepository(MyDiaper.store, MyDiaper.catalog.sizeGuide);
})();
