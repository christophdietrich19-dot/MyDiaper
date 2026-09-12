(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const scopes=['local','online','both'];
  const IMPORT_FORMAT='mydiaper-offers';
  const IMPORT_VERSION=1;
  const MAX_IMPORT_CHARS=300000;
  const MAX_IMPORT_OFFERS=250;

  function isoOrNull(value,label){
    if(value==null||value==='')return null;
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))throw new Error(`Ungültiges ${label}.`);
    return date.toISOString();
  }
  function requiredText(value,label,max=100){
    const text=String(value||'').trim();
    if(!text||text.length>max)throw new Error(`${label} fehlt oder ist zu lang.`);
    return text;
  }
  function optionalText(value,max=160){
    if(value==null||value==='')return null;
    const text=String(value).trim();
    if(!text||text.length>max)throw new Error('Ein optionaler Angebotstext ist ungültig.');
    return text;
  }
  function optionalNumber(value,label){
    if(value==null||value==='')return null;
    const number=Number(value);
    if(!Number.isFinite(number)||number<0)throw new Error(`Ungültige ${label}.`);
    return number;
  }
  function httpsOrNull(value,label){
    if(value==null||value==='')return null;
    const text=String(value).trim();
    if(!/^https:\/\/[^\s]+$/i.test(text))throw new Error(`${label} muss eine gültige HTTPS-Adresse sein.`);
    if(!root.URL)return text;
    try{return new root.URL(text).toString();}catch(error){throw new Error(`Ungültige ${label}.`);}
  }
  function normalize(raw,catalog){
    if(!raw||typeof raw!=='object'||!raw.id||!raw.providerKey)throw new Error('Angebot ohne eindeutige Quelle.');
    if(!['local','online'].includes(raw.scope))throw new Error('Ungültiger Angebotsbereich.');
    if(!['demo','import'].includes(raw.sourceType))throw new Error('Ungültige Angebotsquelle.');
    const details=raw.productSizeId?domain.catalog.details(catalog,raw.productSizeId):null;
    const pack=raw.productPackageId?domain.catalog.createIndex(catalog).packages.get(raw.productPackageId):null;
    if(raw.productPackageId&&!pack)throw new Error('Angebot verweist auf eine unbekannte Packung.');
    if(pack&&raw.productSizeId&&pack.productSizeId!==raw.productSizeId)throw new Error('Packung und Produktgröße passen nicht zusammen.');
    const productSizeId=raw.productSizeId||pack?.productSizeId||null;
    const resolved=productSizeId?domain.catalog.details(catalog,productSizeId):details;
    const price=Number(raw.price),count=Number(raw.count??pack?.unitsPerPack);
    const shippingPrice=raw.shippingPrice==null?undefined:Number(raw.shippingPrice);
    if(!Number.isFinite(price)||price<0||!Number.isInteger(count)||count<=0||
       (shippingPrice!==undefined&&(!Number.isFinite(shippingPrice)||shippingPrice<0)))throw new Error('Ungültige Angebotswerte.');
    return {...raw,productSizeId,productPackageId:raw.productPackageId||null,
      product:raw.product||[resolved?.brand.name,resolved?.product.name].filter(Boolean).join(' '),size:String(raw.size||resolved?.size.label||''),
      count,price,shippingPrice,verifiedAt:isoOrNull(raw.verifiedAt,'Prüfdatum'),validFrom:isoOrNull(raw.validFrom,'Startdatum'),validUntil:isoOrNull(raw.validUntil,'Enddatum')};
  }
  function freshness(offer,now=new Date()){
    if(offer.sourceType==='demo')return {status:'demo',label:'Demo · nicht live geprüft'};
    const current=now instanceof Date?now:new Date(now);
    if(offer.validUntil&&new Date(offer.validUntil)<current)return {status:'expired',label:'Angebot abgelaufen'};
    if(!offer.verifiedAt)return {status:'unverified',label:'Noch nicht verifiziert'};
    const ageDays=(current-new Date(offer.verifiedAt))/86400000;
    if(ageDays>7)return {status:'stale',label:`Stand vor ${Math.floor(ageDays)} Tagen`};
    if(ageDays>2)return {status:'aging',label:`Stand vor ${Math.floor(ageDays)} Tagen`};
    return {status:'fresh',label:'Kürzlich geprüft'};
  }
  function normalizeAlert(input){
    const maxUnitPrice=Number(input.maxUnitPrice);
    if(!Number.isFinite(maxUnitPrice)||maxUnitPrice<=0)throw new Error('Preisgrenze muss größer als 0 sein.');
    if(!scopes.includes(input.scope))throw new Error('Ungültiger Preisalarm-Bereich.');
    if(typeof input.enabled!=='boolean')throw new Error('Ungültiger Preisalarm-Status.');
    if(!input.productSizeId)throw new Error('Preisalarm benötigt eine Produktgröße.');
    return {productSizeId:String(input.productSizeId),maxUnitPrice,scope:input.scope,enabled:input.enabled};
  }
  function matchesAlert(offer,alert){
    if(!alert?.enabled||offer.productSizeId!==alert.productSizeId)return false;
    if(alert.scope!=='both'&&alert.scope!==offer.scope)return false;
    const unit=domain.pricing.offerUnitPrice(offer);
    return unit!==null&&unit<=alert.maxUnitPrice;
  }

  function parseInput(input){
    if(typeof input==='string'){
      if(!input.trim())throw new Error('Bitte Angebotsdaten einfügen oder eine JSON-Datei wählen.');
      if(input.length>MAX_IMPORT_CHARS)throw new Error('Der Angebotsimport ist zu groß.');
      try{return JSON.parse(input);}catch(error){throw new Error('Der Angebotsimport ist kein gültiges JSON.');}
    }
    if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Ungültiger Angebotsimport.');
    return input;
  }
  function cleanImportedOffer(item,index,providerKey,catalog){
    if(!item||typeof item!=='object'||Array.isArray(item))throw new Error(`Angebot ${index+1} ist ungültig.`);
    const externalId=requiredText(item.externalId,`Externe ID in Angebot ${index+1}`,80);
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(externalId))throw new Error(`Externe ID in Angebot ${index+1} enthält ungültige Zeichen.`);
    if(!item.productPackageId)throw new Error(`Angebot ${index+1} benötigt eine bekannte productPackageId.`);
    const validFrom=isoOrNull(item.validFrom,'Startdatum'),validUntil=isoOrNull(item.validUntil,'Enddatum');
    if(validFrom&&validUntil&&new Date(validFrom)>new Date(validUntil))throw new Error(`Angebot ${index+1} endet vor seinem Start.`);
    const oldPrice=optionalNumber(item.oldPrice,'frühere Preisangabe');
    const distance=optionalNumber(item.distance,'Entfernung');
    const sourceUrl=httpsOrNull(item.sourceUrl,'Quellen-URL');
    if(item.currency&&String(item.currency).toUpperCase()!=='EUR')throw new Error('Die Testversion unterstützt für Importe derzeit nur EUR.');
    return normalize({
      id:`${providerKey}-${externalId}`,externalId,providerKey,sourceType:'import',scope:item.scope,
      store:requiredText(item.store,`Händler in Angebot ${index+1}`),storeName:optionalText(item.storeName),city:optionalText(item.city),
      distance:distance===null?undefined:distance,productPackageId:String(item.productPackageId),
      productSizeId:item.productSizeId?String(item.productSizeId):undefined,price:Number(item.price),
      oldPrice:oldPrice===null?undefined:oldPrice,shippingPrice:item.shippingPrice==null?undefined:Number(item.shippingPrice),
      shipping:optionalText(item.shipping),currency:'EUR',verifiedAt:item.verifiedAt||null,validFrom,validUntil,
      sourceUrl,url:httpsOrNull(item.url,'Angebots-URL')
    },catalog);
  }
  function normalizeImport(input,catalog,now=new Date()){
    const raw=parseInput(input);
    if(raw.format!==IMPORT_FORMAT||raw.version!==IMPORT_VERSION)throw new Error('Unbekanntes Angebotsformat oder nicht unterstützte Version.');
    if(!raw.provider||typeof raw.provider!=='object'||Array.isArray(raw.provider))throw new Error('Anbieterangaben fehlen.');
    const key=requiredText(raw.provider.key,'Anbieterschlüssel',40).toLocaleLowerCase('de');
    if(!/^[a-z0-9][a-z0-9-]{2,39}$/.test(key))throw new Error('Der Anbieterschlüssel darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.');
    const providerKey=`import-${key}`,label=requiredText(raw.provider.label,'Anbietername',80);
    if(!Array.isArray(raw.offers)||!raw.offers.length)throw new Error('Der Import enthält keine Angebote.');
    if(raw.offers.length>MAX_IMPORT_OFFERS)throw new Error(`Ein Import darf höchstens ${MAX_IMPORT_OFFERS} Angebote enthalten.`);
    const offers=raw.offers.map((item,index)=>cleanImportedOffer(item,index,providerKey,catalog));
    if(new Set(offers.map(offer=>offer.id)).size!==offers.length)throw new Error('Externe Angebots-IDs müssen innerhalb einer Quelle eindeutig sein.');
    return {schemaVersion:1,format:IMPORT_FORMAT,providerKey,label,sourceType:'import',importedAt:isoOrNull(now,'Importzeitpunkt'),offers};
  }
  function validateImportSnapshot(snapshot,catalog){
    if(!snapshot||snapshot.schemaVersion!==1||snapshot.format!==IMPORT_FORMAT||snapshot.sourceType!=='import'||
       typeof snapshot.providerKey!=='string'||!snapshot.providerKey.startsWith('import-')||typeof snapshot.label!=='string'||!snapshot.label.trim()||
       !Array.isArray(snapshot.offers)||!snapshot.offers.length||snapshot.offers.length>MAX_IMPORT_OFFERS)throw new Error('Gespeicherte Angebotsquelle ist ungültig.');
    const importedAt=isoOrNull(snapshot.importedAt,'Importzeitpunkt');
    const offers=snapshot.offers.map((offer,index)=>{
      if(offer.providerKey!==snapshot.providerKey||offer.sourceType!=='import')throw new Error(`Gespeichertes Angebot ${index+1} gehört nicht zur Quelle.`);
      return normalize(offer,catalog);
    });
    if(new Set(offers.map(offer=>offer.id)).size!==offers.length)throw new Error('Gespeicherte Angebots-IDs sind nicht eindeutig.');
    return {...snapshot,label:snapshot.label.trim(),importedAt,offers};
  }
  function importTemplate(){
    return JSON.stringify({format:IMPORT_FORMAT,version:IMPORT_VERSION,provider:{key:'mein-markt',label:'Mein kontrollierter Import'},offers:[{
      externalId:'angebot-001',scope:'local',store:'Händler eintragen',city:'Ort eintragen',
      productPackageId:'package-pampers-babydry-4-74',price:14.99,verifiedAt:new Date().toISOString()
    }]},null,2);
  }

  domain.offers={normalize,freshness,normalizeAlert,matchesAlert,normalizeImport,validateImportSnapshot,importTemplate,
    IMPORT_FORMAT,IMPORT_VERSION,MAX_IMPORT_CHARS,MAX_IMPORT_OFFERS};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.offers;
})(globalThis);
