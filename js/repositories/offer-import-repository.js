(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  function createOfferImportRepository(store,catalog){
    function importText(text){
      const snapshot=app.domain.offers.normalizeImport(text,catalog,new Date());
      store.save(snapshot);
      return {providerKey:snapshot.providerKey,label:snapshot.label,offerCount:snapshot.offers.length,importedAt:snapshot.importedAt};
    }
    function list(){return store.list().map(({providerKey,label,sourceType,importedAt,offers})=>({providerKey,label,sourceType,importedAt,offerCount:offers.length}));}
    function snapshots(){return store.list();}
    function remove(providerKey){store.remove(providerKey);}
    return {importText,list,snapshots,remove,reset:store.reset,status:store.status,template:app.domain.offers.importTemplate};
  }
  app.repositories=app.repositories||{};
  app.repositories.createOfferImportRepository=createOfferImportRepository;
  if(typeof module!=='undefined'&&module.exports)module.exports=createOfferImportRepository;
})(globalThis);
