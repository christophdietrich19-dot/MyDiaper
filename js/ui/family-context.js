(function(){
  const app = window.MyDiaper;
  app.createFamilyContext = function(repository, store){
    const selected = new Map();
    const activeChild = () => {
      const childId = store.get().activeChildId;
      const setId = selected.get(childId);
      const exists = repository.listSets(childId).some(s => s.id === setId);
      return repository.viewChild(childId, exists ? setId : undefined);
    };
    return {
      activeChild,
      childView:childId => repository.viewChild(childId),
      activeSets:() => repository.listSets(activeChild().id),
      selectSet:setId => { const childId = store.get().activeChildId; repository.viewChild(childId, setId); selected.set(childId, setId); },
      latestFit:() => { const child = activeChild(); return repository.listFitChecks(child.id, child.setId).at(-1); },
      fitChecksFor:setId => { const child=activeChild(); return repository.listFitChecks(child.id,setId); },
      experiencesFor:setId => { const child=activeChild(); return repository.listExperiences(child.id,setId); },
      sizeHistoryFor:setId => { const child=activeChild(); return repository.listSizeHistory(child.id,setId); },
      productDetails:productSizeId => productSizeId ? app.domain.catalog.details(app.productCatalog,productSizeId) : null,
      daysText:child => child.days === null ? '–' : child.days,
      clearSelection:() => selected.clear()
    };
  };
})();
