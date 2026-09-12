(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const KEY='mydiaper-offer-imports-v1';
  const clone=value=>JSON.parse(JSON.stringify(value));

  function createOfferImportStore(storage,catalog){
    let state={schemaVersion:1,imports:[]},memoryOnly=!storage,readOnly=false,warning=null;
    if(storage){
      try{
        const raw=storage.getItem(KEY);
        if(raw!==null){
          const parsed=JSON.parse(raw);
          if(!parsed||parsed.schemaVersion!==1||!Array.isArray(parsed.imports))throw new Error('Ungültiger Importspeicher.');
          const imports=parsed.imports.map(item=>app.domain.offers.validateImportSnapshot(item,catalog));
          if(new Set(imports.map(item=>item.providerKey)).size!==imports.length)throw new Error('Doppelte Angebotsquelle.');
          state={schemaVersion:1,imports};
        }
      }catch(error){
        state={schemaVersion:1,imports:[]};readOnly=true;
        warning='Gespeicherte Angebotsimporte konnten nicht gelesen werden und bleiben unverändert.';
      }
    }
    if(memoryOnly)warning='Angebotsimporte gelten nur für diese Sitzung.';
    function commit(next){
      if(readOnly)throw new Error(warning);
      const imports=next.imports.map(item=>app.domain.offers.validateImportSnapshot(item,catalog));
      if(new Set(imports.map(item=>item.providerKey)).size!==imports.length)throw new Error('Doppelte Angebotsquelle.');
      const checked={schemaVersion:1,imports};
      if(!memoryOnly){
        try{storage.setItem(KEY,JSON.stringify(checked));}
        catch(error){throw new Error('Angebotsimport konnte nicht gespeichert werden. Der bisherige Stand bleibt erhalten.');}
      }
      state=checked;
    }
    function reset(){
      const empty={schemaVersion:1,imports:[]};
      if(!memoryOnly){
        try{storage.setItem(KEY,JSON.stringify(empty));}
        catch(error){throw new Error('Angebotsimporte konnten nicht zurückgesetzt werden.');}
      }
      state=empty;readOnly=false;warning=memoryOnly?'Angebotsimporte gelten nur für diese Sitzung.':null;
    }
    return {
      list:()=>clone(state.imports),
      save:snapshot=>{const next=clone(state),index=next.imports.findIndex(item=>item.providerKey===snapshot.providerKey);if(index<0)next.imports.push(snapshot);else next.imports[index]=snapshot;commit(next);},
      remove:providerKey=>{const next=clone(state),index=next.imports.findIndex(item=>item.providerKey===providerKey);if(index<0)throw new Error('Angebotsquelle nicht gefunden.');next.imports.splice(index,1);commit(next);},
      reset,
      status:()=>({memoryOnly,readOnly,warning})
    };
  }
  app.storage=app.storage||{};
  app.storage.offerImports={createOfferImportStore,KEY};
  if(typeof module!=='undefined'&&module.exports)module.exports=app.storage.offerImports;
})(globalThis);
