window.MyDiaper = window.MyDiaper || {};

(function(){
  let storage = null;
  try { storage = window.localStorage; } catch(error) { /* file:// may prohibit storage */ }
  MyDiaper.store = MyDiaper.storage.createStore(storage, MyDiaper.legacyDefaults);
  MyDiaper.repository = MyDiaper.repositories.createFamilyRepository(MyDiaper.store, MyDiaper.catalog.sizeGuide);
  MyDiaper.offerImportStore=MyDiaper.storage.offerImports.createOfferImportStore(storage,MyDiaper.productCatalog);
  MyDiaper.offerImportRepository=MyDiaper.repositories.createOfferImportRepository(MyDiaper.offerImportStore,MyDiaper.productCatalog);
  const provider=MyDiaper.services.offers.staticProvider({key:'demo-catalog',label:'Lokale MyDiaper-Testdaten',sourceType:'demo',
    offers:[...MyDiaper.referenceOffers,...MyDiaper.catalog.offers.local,...MyDiaper.catalog.offers.online]});
  MyDiaper.offerService=MyDiaper.services.offers.createOfferService({providers:[provider],catalog:MyDiaper.productCatalog,
    additionalProviders:()=>MyDiaper.offerImportRepository.snapshots().map(MyDiaper.services.offers.importedProvider)});
  MyDiaper.offerRepository=MyDiaper.repositories.createOfferRepository(MyDiaper.store,MyDiaper.productCatalog);
  MyDiaper.marketplaceRepository=MyDiaper.repositories.createMarketplaceRepository(MyDiaper.store);
  MyDiaper.catalogCorrectionRepository=MyDiaper.repositories.createCatalogCorrectionRepository(MyDiaper.store,MyDiaper.productCatalog);
})();
