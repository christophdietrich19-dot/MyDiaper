(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  function staticProvider({key,label,sourceType='demo',offers}){
    if(!key||!label||!Array.isArray(offers))throw new Error('Ungültiger OfferProvider.');
    return {key,label,sourceType,search:()=>offers.map(item=>({...item,providerKey:item.providerKey||key,sourceType:item.sourceType||sourceType}))};
  }
  function importedProvider(snapshot){
    const checked=app.domain.offers.validateImportSnapshot(snapshot,app.productCatalog);
    return staticProvider({key:checked.providerKey,label:checked.label,sourceType:'import',offers:checked.offers});
  }
  function createOfferService({providers,catalog,additionalProviders=()=>[]}){
    if(!Array.isArray(providers)||!providers.length)throw new Error('Mindestens ein OfferProvider ist erforderlich.');
    function currentProviders(){
      const current=[...providers,...additionalProviders()];
      if(new Set(current.map(provider=>provider.key)).size!==current.length)throw new Error('OfferProvider-Schlüssel müssen eindeutig sein.');
      return current;
    }
    function all(){return currentProviders().flatMap(provider=>provider.search()).map(raw=>app.domain.offers.normalize(raw,catalog));}
    function search(params={}){
      const query=String(params.query||'').trim().toLocaleLowerCase('de');
      return all().filter(offer=>(!params.scope||offer.scope===params.scope)&&(!params.size||offer.size===String(params.size))&&
        (!params.productSizeId||offer.productSizeId===params.productSizeId)&&(!query||`${offer.product} ${offer.store} ${offer.size}`.toLocaleLowerCase('de').includes(query)))
        .sort(app.domain.pricing.compareOffers);
    }
    function getById(id){return all().find(offer=>offer.id===id)||null;}
    return {get providers(){return currentProviders().map(({key,label,sourceType})=>({key,label,sourceType}));},search,getById};
  }
  app.services=app.services||{};
  app.services.offers={staticProvider,importedProvider,createOfferService};
  if(typeof module!=='undefined'&&module.exports)module.exports=app.services.offers;
})(globalThis);
