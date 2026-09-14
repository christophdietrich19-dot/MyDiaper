(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  function createOfferRepository(store,catalog){
    const {model,offers}=app.domain;
    function childIn(state,childId){const child=state.children.find(item=>item.id===childId);if(!child)throw new Error('Kinderprofil nicht gefunden.');return child;}
    function validateTarget(state,childId,setId,productSizeId,productPackageId){
      childIn(state,childId);
      if(setId&&!state.diaperSets.some(set=>set.id===setId&&set.childId===childId))throw new Error('Windelset gehört nicht zu diesem Kind.');
      if(!app.domain.catalog.details(catalog,productSizeId))throw new Error('Produktgröße nicht im Katalog gefunden.');
      if(productPackageId&&!app.domain.catalog.createIndex(catalog).packages.has(productPackageId))throw new Error('Produktpackung nicht im Katalog gefunden.');
    }
    function listAlerts(childId){const state=store.get();childIn(state,childId);return state.priceAlerts.filter(alert=>alert.childId===childId);}
    function saveAlert(childId,input){
      const normalized=offers.normalizeAlert(input),alertId=input.id||model.id('alert');
      store.patch(state=>{
        validateTarget(state,childId,input.setId||null,normalized.productSizeId,normalized.productPackageId);
        let alert=input.id?state.priceAlerts.find(item=>item.id===input.id&&item.childId===childId):null;
        if(input.id&&!alert)throw new Error('Preisalarm gehört nicht zu diesem Kind.');
        if(!alert){
          alert=state.priceAlerts.find(item=>item.childId===childId&&item.productSizeId===normalized.productSizeId&&item.productPackageId===normalized.productPackageId&&item.scope===normalized.scope)||
            {id:alertId,childId,createdAt:new Date().toISOString()};
          if(!state.priceAlerts.includes(alert))state.priceAlerts.push(alert);
        }
        Object.assign(alert,model.clone(normalized),{setId:input.setId||null,updatedAt:new Date().toISOString()});
      });
      return alertId;
    }
    function removeAlert(childId,alertId){store.patch(state=>{childIn(state,childId);const index=state.priceAlerts.findIndex(item=>item.id===alertId&&item.childId===childId);if(index<0)throw new Error('Preisalarm gehört nicht zu diesem Kind.');state.priceAlerts.splice(index,1);});}
    function matchingAlerts(childId,offer){return listAlerts(childId).filter(alert=>offers.matchesAlert(offer,alert));}
    return {listAlerts,saveAlert,removeAlert,matchingAlerts};
  }
  app.repositories=app.repositories||{};
  app.repositories.createOfferRepository=createOfferRepository;
  if(typeof module!=='undefined'&&module.exports)module.exports=createOfferRepository;
})(globalThis);
