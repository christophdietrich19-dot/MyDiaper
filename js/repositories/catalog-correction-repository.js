(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  function createCatalogCorrectionRepository(store,catalog){
    function lookup(barcode){return app.domain.barcodes.findPackage(catalog,barcode);}
    function save(input){
      const id=app.domain.model.id('correction');
      store.patch(state=>state.catalogCorrections.push({id,...app.domain.barcodes.correction(input,catalog)}));
      return id;
    }
    function remove(id){store.patch(state=>{if(!state.catalogCorrections.some(item=>item.id===id))throw new Error('Korrekturentwurf nicht gefunden.');state.catalogCorrections=state.catalogCorrections.filter(item=>item.id!==id);});}
    return {lookup,save,remove,list:()=>store.get().catalogCorrections};
  }
  app.repositories=app.repositories||{};app.repositories.createCatalogCorrectionRepository=createCatalogCorrectionRepository;
  if(typeof module!=='undefined'&&module.exports)module.exports=createCatalogCorrectionRepository;
})(globalThis);
