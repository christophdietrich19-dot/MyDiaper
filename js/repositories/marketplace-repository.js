(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  function createMarketplaceRepository(store){
    const domain=app.domain.marketplace,model=app.domain.model;
    const find=(state,id)=>{const item=state.market.find(entry=>entry.id===id);if(!item)throw new Error('Anzeige nicht gefunden.');return item;};
    function list(filters={}){const state=store.get();return domain.visible(state.market,{...filters,blockedOwnerIds:state.marketBlocks.map(item=>item.ownerId)});}
    function save(input){
      const id=input.id||model.id('listing'),now=new Date().toISOString();
      store.patch(state=>{
        const existing=input.id?find(state,input.id):null;
        if(existing&&existing.ownerId!=='local-user')throw new Error('Nur eigene Anzeigen können bearbeitet werden.');
        const value=domain.listing({
          ...existing,
          ...input,
          ownerId:input.ownerId||existing?.ownerId||'local-user',
          owner:input.owner||existing?.owner||'Du',
          status:input.status||existing?.status||'active'
        });
        if(existing)Object.assign(existing,value,{updatedAt:now});
        else state.market.unshift({id,...value,createdAt:now,updatedAt:now});
      });
      return id;
    }
    function setStatus(id,status){store.patch(state=>{const item=find(state,id);if(item.ownerId!=='local-user')throw new Error('Nur eigene Anzeigen können geändert werden.');Object.assign(item,domain.listing({...item,status}),{updatedAt:new Date().toISOString()});});}
    function remove(id){store.patch(state=>{const item=find(state,id);if(item.ownerId!=='local-user')throw new Error('Nur eigene Anzeigen können gelöscht werden.');state.market=state.market.filter(entry=>entry.id!==id);delete state.chats[id];state.marketReports=state.marketReports.filter(entry=>entry.listingId!==id);});}
    function messages(id){const state=store.get();find(state,id);return (state.chats[id]||[]).slice();}
    function send(id,text){
      const messageId=model.id('message');store.patch(state=>{const item=find(state,id);if(state.marketBlocks.some(entry=>entry.ownerId===item.ownerId))throw new Error('Blockierte Kontakte können keine Nachrichten erhalten.');const value=domain.message({listingId:id,senderId:'local-user',text});state.chats[id]=state.chats[id]||[];state.chats[id].push({id:messageId,...value});});return messageId;
    }
    function report(id,input){const reportId=model.id('report');store.patch(state=>{find(state,id);if(state.marketReports.some(entry=>entry.listingId===id&&entry.status==='local-only'))throw new Error('Diese Anzeige wurde lokal bereits gemeldet.');state.marketReports.push({id:reportId,...domain.report({listingId:id,...input})});});return reportId;}
    function block(id){store.patch(state=>{const item=find(state,id);if(item.ownerId==='local-user')throw new Error('Das eigene Profil kann nicht blockiert werden.');if(!state.marketBlocks.some(entry=>entry.ownerId===item.ownerId))state.marketBlocks.push({id:model.id('block'),ownerId:item.ownerId,owner:item.owner,createdAt:new Date().toISOString()});});}
    function unblock(ownerId){store.patch(state=>{state.marketBlocks=state.marketBlocks.filter(entry=>entry.ownerId!==ownerId);});}
    return {list,save,setStatus,remove,messages,send,report,block,unblock,blocks:()=>store.get().marketBlocks,reports:()=>store.get().marketReports};
  }
  app.repositories=app.repositories||{};app.repositories.createMarketplaceRepository=createMarketplaceRepository;
  if(typeof module!=='undefined'&&module.exports)module.exports=createMarketplaceRepository;
})(globalThis);
