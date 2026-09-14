(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const clone=value=>JSON.parse(JSON.stringify(value));
  function id(prefix){
    const random=root.crypto&&root.crypto.randomUUID?root.crypto.randomUUID():
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${random}`;
  }
  function purpose(label){return ({Windel:'day',Tageswindel:'day',Pants:'pants',Nachtwindel:'night',Schwimmwindel:'swim'})[label]||'custom';}
  function labels(types){const result=[...new Set((types||[]).map(value=>String(value).trim()).filter(Boolean))];return result.length?result:['Windel'];}
  function knownProductSize(productSizeId){return productSizeId==null||Boolean(domain.catalog.details(app.productCatalog,productSizeId));}
  function recordIds(state,name){
    if(!Array.isArray(state[name]))throw new Error(`Ungültige Daten: ${name}.`);
    const ids=new Set();
    for(const record of state[name]){
      if(!record||typeof record.id!=='string'||!record.id||ids.has(record.id))throw new Error(`Ungültige oder doppelte ID: ${name}.`);
      ids.add(record.id);
    }
  }

  function assertState(state){
    if(!state||state.schemaVersion!==4)throw new Error('Unbekannte Datenversion.');
    const names=['children','diaperSets','inventoryLots','fitChecks','productExperiences','usageEvents','sizeHistory','priceAlerts','market','marketReports','marketBlocks','catalogCorrections'];
    names.forEach(name=>recordIds(state,name));
    const childIds=new Set(state.children.map(child=>child.id)),activeChildren=state.children.filter(child=>!child.archivedAt);
    if(!activeChildren.length||!childIds.has(state.activeChildId)||state.children.find(child=>child.id===state.activeChildId)?.archivedAt)throw new Error('Aktives Kinderprofil fehlt.');
    for(const child of state.children){
      if(typeof child.name!=='string'||!child.name.trim()||!Number.isFinite(child.weight)||child.weight<=0||
         !Number.isFinite(child.height)||child.height<=0||(child.archivedAt!=null&&Number.isNaN(new Date(child.archivedAt).getTime())))throw new Error('Ungültiges Kinderprofil.');
      const primary=state.diaperSets.filter(set=>set.childId===child.id&&set.active&&set.isPrimary);
      if(primary.length!==1)throw new Error('Jedes Kind braucht genau ein aktives Hauptset.');
    }
    for(const set of state.diaperSets){
      if(!childIds.has(set.childId)||typeof set.label!=='string'||!set.label.trim()||typeof set.size!=='string'||!set.size.trim())throw new Error('Ungültiges Windelset.');
      if(!knownProductSize(set.productSizeId))throw new Error('Windelset verweist auf eine unbekannte Produktgröße.');
      domain.inventory.dailyUse(set.dailyUse);
    }
    for(const name of ['inventoryLots','fitChecks','productExperiences','usageEvents','sizeHistory']){
      for(const record of state[name]){
        if(!childIds.has(record.childId))throw new Error('Kind für Datensatz fehlt.');
        const nullable=name==='fitChecks'||name==='productExperiences';
        if(nullable&&record.setId==null)continue;
        const set=state.diaperSets.find(item=>item.id===record.setId&&item.childId===record.childId);
        if(!set)throw new Error('Datensatz und Windelset gehören nicht zum selben Kind.');
        if(!knownProductSize(record.productSizeId))throw new Error('Datensatz verweist auf eine unbekannte Produktgröße.');
      }
    }
    for(const lot of state.inventoryLots){
      domain.inventory.units(lot.initialUnits);domain.inventory.units(lot.remainingUnits);
      if(lot.remainingUnits>lot.initialUnits)throw new Error('Restbestand übersteigt den ursprünglichen Bestand.');
      if(lot.note!=null&&typeof lot.note!=='string')throw new Error('Ungültige Vorratsnotiz.');
      if(lot.acquiredAt!=null&&Number.isNaN(new Date(lot.acquiredAt).getTime()))throw new Error('Ungültiges Kaufdatum im Vorrat.');
      if(lot.updatedAt!=null&&Number.isNaN(new Date(lot.updatedAt).getTime()))throw new Error('Ungültiges Änderungsdatum im Vorrat.');
    }
    for(const event of state.usageEvents)domain.inventory.units(event.quantity);
    for(const experience of state.productExperiences)domain.personalization.normalizeExperience(experience);
    for(const entry of state.sizeHistory){
      if(typeof entry.toSize!=='string'||!entry.toSize.trim()||(entry.fromSize!=null&&typeof entry.fromSize!=='string'))throw new Error('Ungültiger Größenverlauf.');
      if(!knownProductSize(entry.fromProductSizeId)||!knownProductSize(entry.toProductSizeId))throw new Error('Größenverlauf verweist auf eine unbekannte Produktgröße.');
    }
    for(const alert of state.priceAlerts){
      if(!childIds.has(alert.childId))throw new Error('Kind für Preisalarm fehlt.');
      if(alert.setId&&!state.diaperSets.some(set=>set.id===alert.setId&&set.childId===alert.childId))throw new Error('Preisalarm und Windelset gehören nicht zum selben Kind.');
      if(!knownProductSize(alert.productSizeId))throw new Error('Preisalarm verweist auf eine unbekannte Produktgröße.');
      domain.offers.normalizeAlert(alert);
    }
    if(!state.settings||!state.settings.reminders)throw new Error('Erinnerungseinstellungen fehlen.');
    for(const key of ['stock','size','offers','market'])if(typeof state.settings.reminders[key]!=='boolean')throw new Error('Ungültige Erinnerungseinstellung.');
    domain.reminders.normalize(state.settings.reminderConfig);
    const listingIds=new Set(state.market.map(item=>{domain.marketplace.listing(item);return item.id;}));
    if(!state.chats||typeof state.chats!=='object'||Array.isArray(state.chats))throw new Error('Ungültige Marktplatz-Chats.');
    for(const [listingId,messages] of Object.entries(state.chats)){
      if(!listingIds.has(listingId)||!Array.isArray(messages))throw new Error('Chat gehört zu keiner Anzeige.');
      const ids=new Set();for(const message of messages){if(!message.id||ids.has(message.id))throw new Error('Ungültige Chatnachricht.');ids.add(message.id);domain.marketplace.message(message);}
    }
    for(const report of state.marketReports){if(!listingIds.has(report.listingId))throw new Error('Meldung gehört zu keiner Anzeige.');domain.marketplace.report(report);}
    for(const block of state.marketBlocks)if(!block.ownerId||typeof block.ownerId!=='string')throw new Error('Ungültige Blockierung.');
    for(const correction of state.catalogCorrections){
      if(!domain.barcodes.valid(correction.barcode)||!['unknown_barcode','wrong_assignment','wrong_pack_size','other'].includes(correction.kind)||typeof correction.note!=='string'||correction.note.length<3)throw new Error('Ungültiger Korrekturentwurf.');
      if(correction.packageId&&!app.productCatalog.packages.some(pack=>pack.id===correction.packageId))throw new Error('Korrektur verweist auf eine unbekannte Produktpackung.');
    }
    return state;
  }

  function linkCatalog(state){
    for(const set of state.diaperSets){
      if(!set.productSizeId){const match=domain.catalog.findProductSize(app.productCatalog,{brand:set.brand,line:set.line,size:set.size});set.productSizeId=match?match.id:null;}
    }
    for(const name of ['inventoryLots','fitChecks','productExperiences'])for(const record of state[name]){
      if(record.productSizeId)continue;const set=state.diaperSets.find(item=>item.id===record.setId&&item.childId===record.childId);if(set)record.productSizeId=set.productSizeId;
    }
  }
  function upgradeV3(input){
    const state={...clone(input),schemaVersion:4};
    state.children=state.children.map(child=>({...child,archivedAt:child.archivedAt??null}));
    state.inventoryLots=state.inventoryLots.map(lot=>({...lot,note:lot.note||'',acquiredAt:lot.acquiredAt??lot.createdAt??null,updatedAt:lot.updatedAt??lot.createdAt??null}));
    state.settings=state.settings||{};
    state.settings.reminders={stock:true,size:true,offers:true,market:true,...(state.settings.reminders||{})};
    state.settings.reminderConfig=domain.reminders.normalize(state.settings.reminderConfig||{});
    state.market=(state.market||[]).map((item,index)=>({id:item.id||`listing_migration_${index}`,...domain.marketplace.listing({...item,condition:String(item.condition||'').startsWith('Original')?'Original verschlossen':'Geöffnet · Restbestand',priceText:item.priceText??item.price,delivery:item.delivery||'Abholung',region:item.region??item.distance,ownerId:item.ownerId||(item.owner==='Du'?'local-user':`demo-${index+1}`),status:item.status||'active'}),createdAt:item.createdAt??null,updatedAt:item.updatedAt??item.createdAt??null}));
    const chats={};for(const [listingId,messages] of Object.entries(state.chats||{}))chats[listingId]=(messages||[]).map((message,index)=>({id:message.id||`message_${listingId}_${index}`,listingId,senderId:message.senderId||(message.from==='me'?'local-user':'demo-user'),from:message.from||(message.senderId==='local-user'?'me':'them'),text:String(message.text||''),createdAt:message.createdAt??null}));
    state.chats=chats;state.marketReports=state.marketReports||[];state.marketBlocks=state.marketBlocks||[];state.catalogCorrections=state.catalogCorrections||[];
    return state;
  }
  function upgradeV2(input){
    const state={...clone(input),schemaVersion:3,sizeHistory:[],priceAlerts:[]};linkCatalog(state);
    state.sizeHistory=state.diaperSets.map(set=>({id:`size_${set.id}_initial`,childId:set.childId,setId:set.id,fromSize:null,toSize:set.size,fromProductSizeId:null,toProductSizeId:set.productSizeId,productSizeId:set.productSizeId,fromProduct:null,toProduct:{brand:set.brand||'',line:set.line||''},reason:'migration',createdAt:null}));
    return state;
  }
  function legacyV2(input,defaults){
    const legacy=Object.assign(clone(defaults),clone(input||{}));
    const state={...legacy,schemaVersion:2,diaperSets:[],inventoryLots:[],fitChecks:[],productExperiences:[],usageEvents:[]};
    state.settings={...clone(defaults.settings),...legacy.settings,reminders:{...defaults.settings.reminders,...(legacy.settings||{}).reminders}};
    state.children=legacy.children.map(child=>{
      const {currentBrand,currentLine,currentSize,stock,dailyUse,types,...profile}=child;
      labels(types).forEach((label,index)=>{
        const setId=`set_${child.id}_${index}`;
        state.diaperSets.push({id:setId,childId:child.id,label,purpose:purpose(label),active:true,isPrimary:index===0,brand:currentBrand||'',line:currentLine||'',size:String(currentSize||'3'),productSizeId:null,dailyUse:index===0?dailyUse:0});
        if(index===0){
          state.inventoryLots.push({id:`lot_${child.id}_legacy`,childId:child.id,setId,initialUnits:stock,remainingUnits:stock,productSizeId:null,source:'migration'});
          const fit=legacy.fitChecks&&legacy.fitChecks[child.id];if(fit)state.fitChecks.push({...clone(fit),id:`fit_${child.id}_legacy`,childId:child.id,setId,productSizeId:null,weightKgSnapshot:null,answers:null,code:'legacy',createdAt:fit.at||null});
        }
      });return profile;
    });
    if(!state.children.some(child=>child.id===state.activeChildId))state.activeChildId=state.children[0]&&state.children[0].id;
    return state;
  }
  function migrate(input,defaults){
    if(input&&input.schemaVersion===4)return assertState(clone(input));
    if(input&&input.schemaVersion===3)return assertState(upgradeV3(input));
    if(input&&input.schemaVersion===2)return assertState(upgradeV3(upgradeV2(input)));
    if(input&&input.schemaVersion!=null&&input.schemaVersion!==1)throw new Error('Diese Datenversion wird noch nicht unterstützt.');
    return assertState(upgradeV3(upgradeV2(legacyV2(input,defaults))));
  }
  domain.model={clone,id,purpose,labels,assertState,migrate,upgradeV2,upgradeV3};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.model;
})(globalThis);
