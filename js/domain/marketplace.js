(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const modes=new Set(['Verkaufen','Tauschen','Verschenken']);
  const conditions=new Set(['Original verschlossen','Geöffnet · Restbestand']);
  const deliveries=new Set(['Abholung','Versand','Beides']);
  const statuses=new Set(['active','reserved','completed','archived']);
  const text=(value,label,max=160)=>{const result=String(value??'').trim();if(!result||result.length>max)throw new Error(`${label} fehlt oder ist zu lang.`);return result;};
  function listing(input){
    const mode=String(input.mode||'');if(!modes.has(mode))throw new Error('Ungültige Anzeigenart.');
    const condition=String(input.condition||'');if(!conditions.has(condition))throw new Error('Ungültiger Zustand.');
    const delivery=String(input.delivery||'Abholung');if(!deliveries.has(delivery))throw new Error('Ungültige Übergabeart.');
    const status=String(input.status||'active');if(!statuses.has(status))throw new Error('Ungültiger Anzeigenstatus.');
    const count=Number(input.count);if(!Number.isSafeInteger(count)||count<1||count>10000)throw new Error('Stückzahl muss zwischen 1 und 10.000 liegen.');
    return {mode,title:text(input.title,'Titel'),description:String(input.description||'').trim().slice(0,1000),condition,count,
      priceText:text(input.priceText??input.price??(mode==='Verschenken'?'kostenlos':'VB'),'Preis oder Tauschwunsch',80),delivery,
      region:text(input.region??input.distance??'in deiner Nähe','Region',80),ownerId:text(input.ownerId||'local-user','Anbieter-ID',80),
      owner:text(input.owner||'Du','Anbieter',80),status};
  }
  function message(input){return {listingId:text(input.listingId,'Anzeigen-ID',120),senderId:text(input.senderId,'Absender',80),text:text(input.text,'Nachricht',1000),createdAt:input.createdAt||new Date().toISOString()};}
  function report(input){
    const reasons=new Set(['spam','unsafe','misleading','harassment','other']),reason=String(input.reason||'');
    if(!reasons.has(reason))throw new Error('Ungültiger Meldegrund.');
    return {listingId:text(input.listingId,'Anzeigen-ID',120),reason,note:String(input.note||'').trim().slice(0,500),status:'local-only',createdAt:input.createdAt||new Date().toISOString()};
  }
  function visible(items,{mode='Alle',query='',onlyMine=false,blockedOwnerIds=[]}={}){
    const needle=String(query).trim().toLocaleLowerCase('de'),blocked=new Set(blockedOwnerIds);
    return items.filter(item=>item.status!=='archived'&&!blocked.has(item.ownerId)&&(!onlyMine||item.ownerId==='local-user')&&(mode==='Alle'||item.mode===mode)&&(!needle||`${item.title} ${item.description} ${item.owner} ${item.region}`.toLocaleLowerCase('de').includes(needle)));
  }
  domain.marketplace={modes:[...modes],conditions:[...conditions],deliveries:[...deliveries],statuses:[...statuses],listing,message,report,visible};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.marketplace;
})(globalThis);
