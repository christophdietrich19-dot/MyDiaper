(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  function normalize(value){return String(value??'').replace(/[\s-]/g,'');}
  function valid(value){
    const code=normalize(value);
    if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code))return false;
    const digits=[...code].map(Number),check=digits.pop();
    const sum=digits.reverse().reduce((total,digit,index)=>total+digit*(index%2===0?3:1),0);
    return (10-(sum%10))%10===check;
  }
  function requireValid(value){const code=normalize(value);if(!valid(code))throw new Error('Bitte einen gültigen EAN-/GTIN-Code eingeben.');return code;}
  function findPackage(catalog,value){
    const code=requireValid(value);
    const pack=(catalog?.packages||[]).find(item=>normalize(item.barcodeEan)===code);
    if(!pack)return null;
    const detail=domain.catalog.details(catalog,pack.productSizeId);
    return detail?{code,pack,...detail}:null;
  }
  function correction(input,catalog,now=new Date()){
    const kinds=new Set(['unknown_barcode','wrong_assignment','wrong_pack_size','other']);
    const kind=String(input.kind||'unknown_barcode');
    if(!kinds.has(kind))throw new Error('Unbekannter Korrekturgrund.');
    const barcode=requireValid(input.barcode);
    if(input.packageId&&!catalog.packages.some(item=>item.id===input.packageId))throw new Error('Unbekannte Produktpackung.');
    const note=String(input.note||'').trim();
    if(note.length<3||note.length>500)throw new Error('Bitte die Korrektur in 3 bis 500 Zeichen beschreiben.');
    return {kind,barcode,packageId:input.packageId||null,note,status:'local-draft',createdAt:now.toISOString(),updatedAt:now.toISOString()};
  }
  domain.barcodes={normalize,valid,requireValid,findPackage,correction};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.barcodes;
})(globalThis);
